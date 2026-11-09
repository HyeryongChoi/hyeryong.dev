"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ClipboardEvent, type DragEvent } from "react";
import { signIn } from "next-auth/react";
import type { FieldErrorItem, PublishResponse } from "@/lib/editor-api-types";
import {
  emptyDoc,
  fromLoadedPost,
  isDocBlank,
  isLocaleEmpty,
  toPublishRequest,
  validateDoc,
  type EditorDoc,
  type EditorImage,
  type EditorLocale,
  type LocaleFields,
} from "@/lib/editor-doc";
import { clearDraft, formatSavedTime, readDraft, writeDraft, type StoredDraft } from "@/lib/editor-draft";
import { altFromFilename, blobToBase64, toWebp } from "@/lib/image-processing";
import EditorDialog from "./EditorDialog";
import EditorPreview from "./EditorPreview";
import EditorWindow from "./EditorWindow";
import OpenPostDialog from "./OpenPostDialog";
import { EditorApiError, editorApi } from "./editor-api";

interface EditorAppProps {
  login: string;
}

type Dialog =
  | { type: "restore"; draft: StoredDraft }
  | { type: "open" }
  | { type: "published"; result: PublishResponse }
  | { type: "message"; title: string; icon: string; message: string; relogin?: boolean }
  | { type: "confirm"; message: string; onConfirm: () => void };

type Busy = null | "publish" | "upload" | "load";

const AUTOSAVE_DELAY_MS = 1000;
const LOCALE_LABEL: Record<EditorLocale, string> = { ko: "한국어 KO", en: "English EN" };

export default function EditorApp({ login }: EditorAppProps) {
  const [doc, setDoc] = useState<EditorDoc>(() => emptyDoc());
  /** 마지막으로 불러오거나 발행한 상태. 이것과 다르면 '변경됨' */
  const [cleanSnapshot, setCleanSnapshot] = useState(() => JSON.stringify(doc));
  const [images, setImages] = useState<EditorImage[]>([]);
  const [locale, setLocale] = useState<EditorLocale>("ko");
  const [errors, setErrors] = useState<FieldErrorItem[]>([]);
  const [busy, setBusy] = useState<Busy>(null);
  const [status, setStatus] = useState("Ready");
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [dropping, setDropping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const dirty = JSON.stringify(doc) !== cleanSnapshot;
  const enEmpty = isLocaleEmpty(doc.en);
  const fields = doc[locale];

  // 처음 열 때 임시저장된 글이 있으면 복구할지 묻는다.
  useEffect(() => {
    const draft = readDraft();
    if (draft && !isDocBlank(draft.doc)) setDialog({ type: "restore", draft });
  }, []);

  // 변경이 멈추고 1초 뒤 자동 임시저장
  useEffect(() => {
    if (!dirty || isDocBlank(doc) || dialog?.type === "restore") return;
    const timer = setTimeout(() => {
      const now = Date.now();
      const ok = writeDraft({ doc, images: images.map(({ path, blobSha }) => ({ path, blobSha })), savedAt: now });
      if (ok) setSavedAt(now);
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [doc, images, dirty, dialog?.type]);

  const errorFor = (field: string) => errors.find((e) => e.field === field)?.message;

  const updateShared = (key: "slug" | "date" | "thumbnail", value: string) => {
    setDoc((d) => ({ ...d, [key]: value }));
    setErrors((errs) => errs.filter((e) => e.field !== key));
  };

  const updateLocale = (key: keyof LocaleFields, value: string) => {
    setDoc((d) => ({ ...d, [locale]: { ...d[locale], [key]: value } }));
    setErrors((errs) => errs.filter((e) => e.field !== `${locale}.${key}`));
  };

  const resetTo = useCallback((next: EditorDoc, nextImages: EditorImage[] = []) => {
    setDoc(next);
    setCleanSnapshot(JSON.stringify(next));
    setImages(nextImages);
    setErrors([]);
    setSavedAt(null);
  }, []);

  /** 저장하지 않은 변경이 있으면 확인 후 실행 */
  const guardDirty = (message: string, action: () => void) => {
    if (dirty && !isDocBlank(doc)) setDialog({ type: "confirm", message, onConfirm: action });
    else action();
  };

  const showApiError = (error: unknown, context: string) => {
    if (error instanceof EditorApiError) {
      if (error.status === 401) {
        setDialog({
          type: "message",
          title: "로그인 만료",
          icon: "🔑",
          message: "로그인이 만료됐어요. 작성 중인 내용은 임시저장돼 있으니 다시 로그인해 주세요.",
          relogin: true,
        });
        return;
      }
      if (error.status === 409) {
        setDialog({
          type: "message",
          title: "충돌",
          icon: "⚠️",
          message:
            "글을 연 뒤 main에 다른 커밋이 생겼어요. 덮어쓰지 않도록 발행을 멈췄어요. 작성 중인 내용은 그대로 남아 있으니, 최신 글을 다시 열어 변경 내용을 옮겨 주세요.",
        });
        return;
      }
    }
    setDialog({
      type: "message",
      title: "오류",
      icon: "❌",
      message: `${context}: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
    });
  };

  // ---- 발행 ----
  const handlePublish = async () => {
    const clientErrors = validateDoc(doc);
    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      if (clientErrors.some((e) => e.field.startsWith("en.")) && !clientErrors.some((e) => e.field.startsWith("ko."))) {
        setLocale("en");
      } else if (clientErrors.some((e) => e.field.startsWith("ko."))) {
        setLocale("ko");
      }
      setStatus("입력값을 확인해 주세요.");
      return;
    }

    setBusy("publish");
    setStatus("GitHub에 발행하는 중…");
    try {
      const result = await editorApi.publish(toPublishRequest(doc, images));
      const published = { ...doc, id: result.id, baseSha: result.commitSha };
      setDoc(published);
      setCleanSnapshot(JSON.stringify(published));
      clearDraft();
      setSavedAt(null);
      setStatus(`발행 완료: ${result.commitSha.slice(0, 7)}`);
      setDialog({ type: "published", result });
    } catch (error) {
      if (error instanceof EditorApiError && error.status === 400 && Array.isArray(error.body.fields)) {
        setErrors(error.body.fields as FieldErrorItem[]);
        setStatus("입력값을 확인해 주세요.");
      } else {
        setStatus("발행 실패");
        showApiError(error, "발행하지 못했어요");
      }
    } finally {
      setBusy(null);
    }
  };

  // ---- 열기 ----
  const handleOpen = async (id: string) => {
    setDialog(null);
    setBusy("load");
    setStatus(`${id} 글을 불러오는 중…`);
    try {
      const post = await editorApi.getPost(id);
      resetTo(fromLoadedPost(post));
      setLocale("ko");
      setStatus(`${post.id}-${post.slug} 불러옴`);
    } catch (error) {
      setStatus("불러오기 실패");
      showApiError(error, "글을 불러오지 못했어요");
    } finally {
      setBusy(null);
    }
  };

  // ---- 이미지 ----
  const insertAtCursor = (text: string) => {
    const el = textareaRef.current;
    const body = doc[locale].body;
    const start = el?.selectionStart ?? body.length;
    const end = el?.selectionEnd ?? body.length;
    const before = body.slice(0, start);
    const insert = `${before && !before.endsWith("\n") ? "\n" : ""}${text}\n`;
    updateLocale("body", before + insert + body.slice(end));
    requestAnimationFrame(() => {
      if (!el) return;
      const caret = start + insert.length;
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  };

  const handleImageFiles = async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      setDialog({ type: "message", title: "이미지 아님", icon: "🖼️", message: "이미지 파일만 넣을 수 있어요." });
      return;
    }
    setBusy("upload");
    try {
      const snippets: string[] = [];
      for (const file of imageFiles) {
        setStatus(`이미지 변환·업로드 중: ${file.name || "clipboard"}`);
        const webp = await toWebp(file);
        const uploaded = await editorApi.uploadImage({
          filename: file.name || "clipboard.png",
          base64: await blobToBase64(webp),
        });
        setImages((prev) => [...prev, { ...uploaded, previewUrl: URL.createObjectURL(webp) }]);
        snippets.push(`![${altFromFilename(file.name || "image")}](${uploaded.path})`);
      }
      insertAtCursor(snippets.join("\n"));
      setStatus(`이미지 ${snippets.length}개 추가됨 (발행할 때 함께 커밋돼요)`);
    } catch (error) {
      setStatus("이미지 업로드 실패");
      showApiError(error, "이미지를 올리지 못했어요");
    } finally {
      setBusy(null);
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const files = Array.from(e.clipboardData.files);
    if (files.length === 0) return;
    e.preventDefault();
    void handleImageFiles(files);
  };

  const onDrop = (e: DragEvent<HTMLTextAreaElement>) => {
    setDropping(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    e.preventDefault();
    void handleImageFiles(files);
  };

  // 페이지를 떠날 때만 미리보기 object URL 정리 (목록이 바뀔 때 해제하면 아직 쓰는 URL까지 깨진다)
  const imagesRef = useRef(images);
  imagesRef.current = images;
  useEffect(
    () => () => imagesRef.current.forEach((img) => img.previewUrl && URL.revokeObjectURL(img.previewUrl)),
    [],
  );

  const title = doc.id ? `${doc.id}-${doc.slug}${dirty ? " *" : ""}` : `Untitled${dirty ? " *" : ""}`;
  const charCount = useMemo(() => fields.body.length.toLocaleString(), [fields.body]);

  const toolbar = (
    <>
      <button
        type="button"
        className="toolbar-button"
        disabled={busy !== null}
        onClick={() => guardDirty("작성 중인 내용을 닫고 새 글을 시작할까요?", () => resetTo(emptyDoc()))}
      >
        <span>📄</span>
        <span>New</span>
      </button>
      <button
        type="button"
        className="toolbar-button"
        disabled={busy !== null}
        onClick={() => guardDirty("작성 중인 내용을 닫고 다른 글을 열까요?", () => setDialog({ type: "open" }))}
      >
        <span>📂</span>
        <span>Open</span>
      </button>
      <div className="toolbar-separator" />
      <button type="button" className="toolbar-button" disabled={busy !== null} onClick={handlePublish}>
        <span>🚀</span>
        <span>{busy === "publish" ? "Publishing…" : "Publish"}</span>
      </button>
      <div className="toolbar-separator" />
      <a className="toolbar-button" href="/blog" target="_blank" rel="noreferrer">
        <span>🌐</span>
        <span>Blog</span>
      </a>
    </>
  );

  const statusBar = (
    <>
      <div className="status-section" style={{ flex: 1 }} data-testid="editor-status">
        {status}
      </div>
      <div className="status-section">{doc.id ? `수정: ${doc.id}` : "새 글"}</div>
      <div className="status-section">
        {LOCALE_LABEL[locale]} · {charCount}자
      </div>
      <div className="status-section" data-testid="draft-status">
        {savedAt ? `임시저장됨 ${formatSavedTime(savedAt)}` : dirty ? "변경됨" : "변경 없음"}
      </div>
    </>
  );

  return (
    <EditorWindow title={title} login={login} toolbar={toolbar} status={statusBar}>
      <div className="editor-shared">
        <div className="editor-field">
          <label htmlFor="editor-slug">Slug</label>
          <input
            id="editor-slug"
            className="editor-input"
            value={doc.slug}
            readOnly={doc.id !== null}
            placeholder="my-post-title"
            aria-invalid={!!errorFor("slug")}
            title={doc.id ? "기존 글의 slug는 바꿀 수 없어요" : "영문 소문자·숫자·-"}
            onChange={(e) => updateShared("slug", e.target.value.toLowerCase())}
          />
        </div>
        <div className="editor-field">
          <label htmlFor="editor-date">날짜</label>
          <input
            id="editor-date"
            className="editor-input"
            value={doc.date}
            aria-invalid={!!errorFor("date")}
            onChange={(e) => updateShared("date", e.target.value)}
          />
        </div>
        <div className="editor-field">
          <label htmlFor="editor-thumbnail">썸네일</label>
          <input
            id="editor-thumbnail"
            className="editor-input"
            value={doc.thumbnail}
            placeholder="(선택) 비우면 본문 첫 이미지"
            onChange={(e) => updateShared("thumbnail", e.target.value)}
          />
        </div>
      </div>
      {(errorFor("slug") || errorFor("date")) && (
        <div className="editor-field-error" role="alert">
          {[errorFor("slug"), errorFor("date")].filter(Boolean).join(" ")}
        </div>
      )}

      <div className="editor-tabs" role="tablist">
        {(["ko", "en"] as const).map((l) => (
          <button
            key={l}
            type="button"
            role="tab"
            className="editor-tab"
            aria-selected={locale === l}
            onClick={() => setLocale(l)}
          >
            {LOCALE_LABEL[l]}
            {l === "en" && enEmpty && <span className="editor-tab-badge">(비어 있음)</span>}
            {errors.some((e) => e.field.startsWith(`${l}.`)) && <span className="editor-tab-badge"> ⚠</span>}
          </button>
        ))}
      </div>

      <div className="editor-tabpanel" role="tabpanel" aria-label={LOCALE_LABEL[locale]}>
        <div className="editor-meta">
          <div className="editor-field">
            <label htmlFor="editor-title">제목</label>
            <input
              id="editor-title"
              className="editor-input"
              value={fields.title}
              aria-invalid={!!errorFor(`${locale}.title`)}
              placeholder={locale === "en" ? "(선택) 영어 제목" : "글 제목"}
              onChange={(e) => updateLocale("title", e.target.value)}
            />
          </div>
          <div className="editor-field">
            <label htmlFor="editor-tags">태그</label>
            <input
              id="editor-tags"
              className="editor-input"
              value={fields.tags}
              placeholder="React, WebView"
              onChange={(e) => updateLocale("tags", e.target.value)}
            />
          </div>
          <div className="editor-field editor-field-wide">
            <label htmlFor="editor-excerpt">요약</label>
            <input
              id="editor-excerpt"
              className="editor-input"
              value={fields.excerpt}
              placeholder="목록에 보일 짧은 설명"
              onChange={(e) => updateLocale("excerpt", e.target.value)}
            />
          </div>
          {errorFor(`${locale}.title`) && (
            <div className="editor-field-error editor-field-wide" role="alert">
              {errorFor(`${locale}.title`)}
            </div>
          )}
        </div>

        <div className="editor-split">
          <div className="editor-pane">
            <div className="editor-pane-label">
              <span>Markdown</span>
              <span>이미지: 붙여넣기(⌘V) 또는 끌어다 놓기</span>
            </div>
            <textarea
              ref={textareaRef}
              className={`editor-textarea${dropping ? " editor-dropping" : ""}`}
              value={fields.body}
              aria-label="마크다운 본문"
              placeholder={locale === "en" ? "(선택) 영어 본문. 비워두면 한국어가 보여요." : "## 마크다운으로 작성하세요"}
              spellCheck={false}
              disabled={busy === "load"}
              onChange={(e) => updateLocale("body", e.target.value)}
              onPaste={onPaste}
              onDragOver={(e) => {
                if (Array.from(e.dataTransfer.types).includes("Files")) {
                  e.preventDefault();
                  setDropping(true);
                }
              }}
              onDragLeave={() => setDropping(false)}
              onDrop={onDrop}
            />
          </div>
          <div className="editor-pane">
            <div className="editor-pane-label">
              <span>Preview</span>
              <span>실제 블로그와 같은 렌더러</span>
            </div>
            <EditorPreview
              fields={locale === "en" && enEmpty ? doc.ko : fields}
              date={doc.date}
              images={images}
              fallbackNotice={locale === "en" && enEmpty}
            />
          </div>
        </div>
      </div>

      {dialog?.type === "restore" && (
        <EditorDialog
          title="임시저장 복구"
          icon="💾"
          testId="restore-dialog"
          actions={
            <>
              <button
                type="button"
                className="editor-button editor-button-primary"
                onClick={() => {
                  const draft = dialog.draft;
                  setDoc(draft.doc);
                  setImages(draft.images);
                  setSavedAt(draft.savedAt);
                  setStatus("임시저장된 글을 복구했어요.");
                  setDialog(null);
                }}
              >
                복구
              </button>
              <button
                type="button"
                className="editor-button"
                onClick={() => {
                  clearDraft();
                  setDialog(null);
                }}
              >
                버리기
              </button>
            </>
          }
        >
          <p className="editor-dialog-strong">임시저장된 글을 복구할까요?</p>
          <p>
            {formatSavedTime(dialog.draft.savedAt)}에 저장된 &ldquo;
            {dialog.draft.doc.ko.title || dialog.draft.doc.slug || "제목 없음"}&rdquo;
          </p>
        </EditorDialog>
      )}

      {dialog?.type === "open" && <OpenPostDialog onOpen={handleOpen} onCancel={() => setDialog(null)} />}

      {dialog?.type === "published" && (
        <EditorDialog
          title="발행 완료"
          icon="🎉"
          testId="published-dialog"
          actions={
            <button type="button" className="editor-button editor-button-primary" onClick={() => setDialog(null)}>
              확인
            </button>
          }
        >
          <p className="editor-dialog-strong">main에 커밋했어요.</p>
          <p>
            커밋:{" "}
            <a href={dialog.result.commitUrl} target="_blank" rel="noreferrer">
              {dialog.result.commitSha.slice(0, 7)}
            </a>
          </p>
          <p>
            1~2분 뒤{" "}
            <a href={dialog.result.url} target="_blank" rel="noreferrer">
              {dialog.result.url}
            </a>
            에 반영돼요.
          </p>
        </EditorDialog>
      )}

      {dialog?.type === "message" && (
        <EditorDialog
          title={dialog.title}
          icon={dialog.icon}
          testId="message-dialog"
          actions={
            <>
              {dialog.relogin && (
                <button
                  type="button"
                  className="editor-button editor-button-primary"
                  onClick={() => signIn("github", { callbackUrl: "/editor" })}
                >
                  다시 로그인
                </button>
              )}
              <button type="button" className="editor-button" onClick={() => setDialog(null)}>
                확인
              </button>
            </>
          }
        >
          <p>{dialog.message}</p>
        </EditorDialog>
      )}

      {dialog?.type === "confirm" && (
        <EditorDialog
          title="확인"
          icon="❓"
          actions={
            <>
              <button
                type="button"
                className="editor-button editor-button-primary"
                onClick={() => {
                  const action = dialog.onConfirm;
                  setDialog(null);
                  action();
                }}
              >
                예
              </button>
              <button type="button" className="editor-button" onClick={() => setDialog(null)}>
                아니요
              </button>
            </>
          }
        >
          <p>{dialog.message}</p>
          <p>저장하지 않은 내용은 브라우저 임시저장에만 남아 있어요.</p>
        </EditorDialog>
      )}
    </EditorWindow>
  );
}
