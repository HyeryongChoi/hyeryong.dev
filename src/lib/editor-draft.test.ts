import { describe, expect, it } from "vitest";
import { DRAFT_KEY, clearDraft, formatSavedTime, readDraft, writeDraft, type StoredDraft } from "./editor-draft";
import { emptyDoc } from "./editor-doc";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  };
}

const throwingStorage = {
  getItem: () => {
    throw new Error("SecurityError");
  },
  setItem: () => {
    throw new Error("QuotaExceededError");
  },
  removeItem: () => {
    throw new Error("SecurityError");
  },
};

const draft: StoredDraft = {
  doc: { ...emptyDoc(), slug: "draft", ko: { title: "임시", excerpt: "", tags: "", body: "쓰는 중" } },
  images: [{ path: "/images/a-12345678.webp", blobSha: "a".repeat(40) }],
  savedAt: new Date(2026, 10, 8, 9, 5).getTime(),
};

describe("editor-draft", () => {
  it("저장한 임시글을 다시 읽는다", () => {
    const storage = memoryStorage();
    expect(writeDraft(draft, storage)).toBe(true);
    expect(readDraft(storage)).toEqual(draft);
  });

  it("지우면 더 이상 읽히지 않는다", () => {
    const storage = memoryStorage();
    writeDraft(draft, storage);
    clearDraft(storage);
    expect(readDraft(storage)).toBeNull();
  });

  it("저장소를 쓸 수 없는 환경에서도 에러 없이 동작한다", () => {
    expect(() => writeDraft(draft, throwingStorage)).not.toThrow();
    expect(writeDraft(draft, throwingStorage)).toBe(false);
    expect(readDraft(throwingStorage)).toBeNull();
    expect(() => clearDraft(throwingStorage)).not.toThrow();
    expect(writeDraft(draft, null)).toBe(false);
  });

  it("깨진 값은 무시한다", () => {
    const storage = memoryStorage();
    storage.map.set(DRAFT_KEY, "{not json");
    expect(readDraft(storage)).toBeNull();
  });

  it("저장 시각을 HH:MM으로 보여준다", () => {
    expect(formatSavedTime(draft.savedAt)).toBe("09:05");
  });
});
