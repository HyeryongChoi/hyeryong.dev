"use client";
/* eslint-disable @next/next/no-img-element -- 아직 배포 전인 이미지를 blob: URL로 보여줘야 해서 next/image를 쓸 수 없다 */

import { useEffect, useRef, useState } from "react";
import type { ThumbnailCandidate } from "@/lib/editor-doc";
import EditorDialog from "./EditorDialog";

interface ThumbnailPickerProps {
  candidates: ThumbnailCandidate[];
  /** 현재 직접 지정된 썸네일 (없으면 "") */
  current: string;
  autoPath?: string;
  previewSrc: (path: string) => string;
  uploading: boolean;
  /** "" 이면 자동(본문 첫 이미지) */
  onSelect: (path: string) => void;
  onUpload: (files: File[]) => void;
  onClose: () => void;
}

const fileName = (path: string) => path.split("/").pop() ?? path;

/** 썸네일 선택 창: 본문 이미지 중에서 고르거나 새 이미지를 올린다 */
export default function ThumbnailPicker({
  candidates,
  current,
  autoPath,
  previewSrc,
  uploading,
  onSelect,
  onUpload,
  onClose,
}: ThumbnailPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  // 창이 열려 있는 동안 ⌘V로 붙여넣은 이미지를 썸네일로 올린다
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []);
      if (files.length === 0) return;
      e.preventDefault();
      onUpload(files.slice(0, 1));
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onUpload]);

  // Esc로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <EditorDialog
      title="썸네일 선택"
      wide
      testId="thumbnail-picker"
      actions={
        <button type="button" className="editor-button" onClick={onClose}>
          닫기
        </button>
      }
    >
      <div className="editor-thumb-picker">
        <div className="editor-thumb-grid" role="listbox" aria-label="썸네일 후보">
          <button
            type="button"
            role="option"
            aria-selected={current === ""}
            className="editor-thumb-tile"
            onClick={() => onSelect("")}
          >
            <span className="editor-thumb-tile-img editor-thumb-auto">
              {autoPath ? <img src={previewSrc(autoPath)} alt="" /> : <span>없음</span>}
            </span>
            <span className="editor-thumb-tile-name">자동 (본문 첫 이미지)</span>
          </button>
          {candidates.map((c) => (
            <button
              key={c.path}
              type="button"
              role="option"
              aria-selected={current === c.path}
              className="editor-thumb-tile"
              title={c.path}
              onClick={() => onSelect(c.path)}
            >
              <span className="editor-thumb-tile-img">
                <img src={previewSrc(c.path)} alt="" />
              </span>
              <span className="editor-thumb-tile-name">
                {fileName(c.path)}
                {!c.inBody && <em> · 썸네일 전용</em>}
              </span>
            </button>
          ))}
        </div>
        {candidates.length === 0 && <p className="editor-thumb-empty">본문에 넣은 이미지가 아직 없어요.</p>}

        <div
          className={`editor-thumb-drop${dragging ? " editor-thumb-dragging" : ""}`}
          onDragOver={(e) => {
            if (Array.from(e.dataTransfer.types).includes("Files")) {
              e.preventDefault();
              setDragging(true);
            }
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            setDragging(false);
            const files = Array.from(e.dataTransfer.files);
            if (files.length === 0) return;
            e.preventDefault();
            onUpload(files.slice(0, 1));
          }}
          data-testid="thumbnail-drop"
        >
          {uploading ? (
            <span>이미지를 변환·업로드하는 중…</span>
          ) : (
            <>
              <span>본문에 없는 이미지를 쓰려면 여기로 끌어다 놓거나 ⌘V로 붙여넣으세요.</span>
              <button type="button" className="editor-button editor-button-small" onClick={() => fileRef.current?.click()}>
                파일 선택…
              </button>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            data-testid="thumbnail-file"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = "";
              if (files.length > 0) onUpload(files.slice(0, 1));
            }}
          />
        </div>
        <p className="editor-thumb-note">올린 이미지는 webp로 바뀌고, 발행할 때 글과 같은 커밋에 들어가요.</p>
      </div>
    </EditorDialog>
  );
}
