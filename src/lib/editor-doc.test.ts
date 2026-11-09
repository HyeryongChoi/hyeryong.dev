import { describe, expect, it } from "vitest";
import {
  autoThumbnail,
  emptyDoc,
  imagePreviewSrc,
  markdownImagePaths,
  thumbnailCandidates,
  formatToday,
  fromLoadedPost,
  isDocBlank,
  parseTags,
  previewMarkdown,
  toPublishRequest,
  validateDoc,
  type EditorDoc,
} from "./editor-doc";

const filled = (over: Partial<EditorDoc> = {}): EditorDoc => ({
  ...emptyDoc(new Date(2026, 10, 8)),
  slug: "my-post",
  ko: { title: "제목", excerpt: "요약", tags: "React, WebView ,", body: "본문" },
  ...over,
});

describe("새 문서", () => {
  it("날짜 기본값은 오늘(YYYY.MM.DD)", () => {
    expect(formatToday(new Date(2026, 0, 5))).toBe("2026.01.05");
    expect(emptyDoc(new Date(2026, 10, 8)).date).toBe("2026.11.08");
  });

  it("빈 문서인지 판단한다", () => {
    expect(isDocBlank(emptyDoc())).toBe(true);
    expect(isDocBlank(filled())).toBe(false);
  });
});

describe("validateDoc", () => {
  it("정상 문서는 에러가 없다", () => {
    expect(validateDoc(filled())).toEqual([]);
  });

  it("제목이 비었거나 slug 형식이 틀리면 필드를 알려준다", () => {
    const errors = validateDoc(filled({ slug: "My Post", ko: { title: " ", excerpt: "", tags: "", body: "" } }));
    expect(errors.map((e) => e.field)).toEqual(["slug", "ko.title"]);
  });

  it("영어를 일부만 쓰면 영어 제목을 요구하고, 비워두면 괜찮다", () => {
    expect(validateDoc(filled({ en: { title: "", excerpt: "", tags: "", body: "Body" } })).map((e) => e.field)).toEqual([
      "en.title",
    ]);
    expect(validateDoc(filled())).toEqual([]);
  });
});

describe("toPublishRequest", () => {
  it("새 글: id 없이 ko만 담고, 태그를 배열로 바꾼다", () => {
    const req = toPublishRequest(filled(), []);
    expect(req).toEqual({
      slug: "my-post",
      ko: { frontmatter: { title: "제목", excerpt: "요약", tags: ["React", "WebView"], date: "2026.11.08" }, body: "본문" },
      images: [],
    });
  });

  it("영어가 있으면 en을 담고, 수정이면 id와 baseSha를 담는다", () => {
    const req = toPublishRequest(
      filled({ id: "002", baseSha: "abc", en: { title: "Title", excerpt: "", tags: "", body: "Body" } }),
      [],
    );
    expect(req).toMatchObject({ id: "002", baseSha: "abc", en: { frontmatter: { title: "Title" }, body: "Body" } });
  });

  it("본문에 남아 있는 이미지만 담는다", () => {
    const doc = filled({ ko: { title: "t", excerpt: "", tags: "", body: "![](/images/a-1.webp)" } });
    const req = toPublishRequest(doc, [
      { path: "/images/a-1.webp", blobSha: "1" },
      { path: "/images/deleted-2.webp", blobSha: "2" },
    ]);
    expect(req.images).toEqual([{ path: "/images/a-1.webp", blobSha: "1" }]);
  });
});

it("parseTags는 빈 값과 공백을 지운다", () => {
  expect(parseTags(" a, ,b ,")).toEqual(["a", "b"]);
});

it("불러온 글을 에디터 문서로 바꾼다", () => {
  const doc = fromLoadedPost({
    id: "002",
    slug: "webview",
    headSha: "head1",
    ko: { frontmatter: { title: "제목", excerpt: "요약", tags: ["A", "B"], date: "2026. 3. 1." }, body: "본문" },
    en: null,
  });
  expect(doc).toMatchObject({
    id: "002",
    slug: "webview",
    date: "2026. 3. 1.",
    baseSha: "head1",
    ko: { tags: "A, B" },
    en: { title: "", body: "" },
  });
});

it("미리보기에서는 아직 배포되지 않은 이미지를 object URL로 바꾼다", () => {
  expect(
    previewMarkdown("![a](/images/a.webp) ![a](/images/a.webp)", [
      { path: "/images/a.webp", blobSha: "1", previewUrl: "blob:x" },
    ]),
  ).toBe("![a](blob:x) ![a](blob:x)");
});

describe("썸네일", () => {
  const withBodies = (ko: string, en = "") =>
    filled({
      ko: { title: "t", excerpt: "", tags: "", body: ko },
      en: { title: en ? "e" : "", excerpt: "", tags: "", body: en },
    });

  it("본문 이미지 경로를 순서대로, 중복 없이 뽑는다", () => {
    expect(
      markdownImagePaths('![a](/images/a.webp)\n텍스트 ![b](/images/b.webp "제목")\n![a 다시](/images/a.webp)'),
    ).toEqual(["/images/a.webp", "/images/b.webp"]);
  });

  it("자동 썸네일은 ko 본문 첫 이미지, 없으면 en 본문 첫 이미지", () => {
    expect(autoThumbnail(withBodies("![](/images/ko.webp)", "![](/images/en.webp)"))).toBe("/images/ko.webp");
    expect(autoThumbnail(withBodies("이미지 없음", "![](/images/en.webp)"))).toBe("/images/en.webp");
    expect(autoThumbnail(withBodies("이미지 없음"))).toBeUndefined();
  });

  it("후보: 본문 이미지(KO→EN) + 본문에 없는 업로드 이미지", () => {
    const doc = withBodies("![](/images/a.webp)", "![](/images/b.webp) ![](/images/a.webp)");
    expect(
      thumbnailCandidates(doc, [
        { path: "/images/a.webp", blobSha: "1" },
        { path: "/images/thumb-only.webp", blobSha: "2" },
      ]),
    ).toEqual([
      { path: "/images/a.webp", inBody: true },
      { path: "/images/b.webp", inBody: true },
      { path: "/images/thumb-only.webp", inBody: false },
    ]);
  });

  it("썸네일로만 올린 이미지도 발행 요청에 포함된다", () => {
    const doc = filled({ thumbnail: "/images/thumb-only.webp" });
    const req = toPublishRequest(doc, [{ path: "/images/thumb-only.webp", blobSha: "2" }]);
    expect(req.images).toEqual([{ path: "/images/thumb-only.webp", blobSha: "2" }]);
    expect(req.ko.frontmatter.thumbnail).toBe("/images/thumb-only.webp");
  });

  it("미리보기 주소: 올린 이미지는 object URL, 기존 이미지는 경로 그대로", () => {
    const images = [{ path: "/images/new.webp", blobSha: "1", previewUrl: "blob:x" }];
    expect(imagePreviewSrc("/images/new.webp", images)).toBe("blob:x");
    expect(imagePreviewSrc("/images/history-api-thumbnail.webp", images)).toBe("/images/history-api-thumbnail.webp");
  });
});
