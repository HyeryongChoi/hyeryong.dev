/**
 * 브라우저 임시저장 (localStorage).
 * 저장소를 쓸 수 없는 환경(시크릿 모드, 차단된 사이트 데이터)에서는 조용히 아무것도 하지 않는다.
 */
import type { PublishImage } from "./editor-api-types";
import type { EditorDoc } from "./editor-doc";

export const DRAFT_KEY = "blog-editor-draft-v1";

export interface StoredDraft {
  doc: EditorDoc;
  /** 업로드해 둔 이미지 (미리보기 URL은 저장하지 않는다) */
  images: PublishImage[];
  savedAt: number;
}

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function defaultStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readDraft(storage: StorageLike | null = defaultStorage()): StoredDraft | null {
  try {
    const raw = storage?.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as StoredDraft;
    if (!draft || !draft.doc || typeof draft.savedAt !== "number") return null;
    return { ...draft, images: Array.isArray(draft.images) ? draft.images : [] };
  } catch {
    return null;
  }
}

/** 저장에 성공하면 true */
export function writeDraft(draft: StoredDraft, storage: StorageLike | null = defaultStorage()): boolean {
  try {
    if (!storage) return false;
    storage.setItem(DRAFT_KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function clearDraft(storage: StorageLike | null = defaultStorage()): void {
  try {
    storage?.removeItem(DRAFT_KEY);
  } catch {
    // 저장소를 쓸 수 없으면 지울 것도 없다.
  }
}

export function formatSavedTime(savedAt: number): string {
  const d = new Date(savedAt);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
