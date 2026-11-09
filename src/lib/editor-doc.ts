/**
 * 에디터 문서 모델 (클라이언트에서 쓰는 순수 함수).
 * 화면 입력값 ↔ API 요청/응답 변환과 발행 전 검증을 담당한다.
 */
import type {
  ApiPostFile,
  FieldErrorItem,
  GetPostResponse,
  PublishImage,
  PublishRequest,
} from "./editor-api-types";

export type EditorLocale = "ko" | "en";

export interface LocaleFields {
  title: string;
  excerpt: string;
  /** 쉼표로 구분한 태그 입력값 */
  tags: string;
  body: string;
}

export interface EditorDoc {
  /** 기존 글을 수정 중이면 id, 새 글이면 null */
  id: string | null;
  slug: string;
  date: string;
  thumbnail: string;
  ko: LocaleFields;
  en: LocaleFields;
  /** 수정 중인 글을 불러온(또는 마지막으로 발행한) 시점의 main 커밋 */
  baseSha: string | null;
}

export interface EditorImage extends PublishImage {
  /** 미리보기용 object URL. 임시저장에서 복구한 이미지는 없을 수 있다. */
  previewUrl?: string;
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const emptyFields = (): LocaleFields => ({ title: "", excerpt: "", tags: "", body: "" });

/** 블로그 날짜 형식 YYYY.MM.DD (로컬 시간 기준) */
export function formatToday(now: Date = new Date()): string {
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}.${m}.${d}`;
}

export function emptyDoc(now: Date = new Date()): EditorDoc {
  return {
    id: null,
    slug: "",
    date: formatToday(now),
    thumbnail: "",
    ko: emptyFields(),
    en: emptyFields(),
    baseSha: null,
  };
}

export function parseTags(input: string): string[] {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function isLocaleEmpty(fields: LocaleFields): boolean {
  return [fields.title, fields.excerpt, fields.tags, fields.body].every((v) => v.trim() === "");
}

/** 내용이 하나도 없는 새 문서인지 (임시저장·덮어쓰기 확인에 쓴다) */
export function isDocBlank(doc: EditorDoc): boolean {
  return doc.id === null && doc.slug.trim() === "" && isLocaleEmpty(doc.ko) && isLocaleEmpty(doc.en);
}

/** 발행 전 클라이언트 검증. 서버도 같은 규칙으로 다시 검증한다. */
export function validateDoc(doc: EditorDoc): FieldErrorItem[] {
  const errors: FieldErrorItem[] = [];
  if (!SLUG_PATTERN.test(doc.slug)) {
    errors.push({ field: "slug", message: "slug는 영문 소문자·숫자·-만 쓸 수 있어요." });
  }
  if (doc.date.trim() === "") {
    errors.push({ field: "date", message: "날짜를 입력해 주세요." });
  }
  if (doc.ko.title.trim() === "") {
    errors.push({ field: "ko.title", message: "제목을 입력해 주세요." });
  }
  if (!isLocaleEmpty(doc.en) && doc.en.title.trim() === "") {
    errors.push({ field: "en.title", message: "영어 버전을 쓰려면 영어 제목도 필요해요." });
  }
  return errors;
}

function toApiFile(fields: LocaleFields, extra: Partial<ApiPostFile["frontmatter"]> = {}): ApiPostFile {
  return {
    frontmatter: {
      title: fields.title.trim(),
      excerpt: fields.excerpt.trim(),
      tags: parseTags(fields.tags),
      ...extra,
    },
    body: fields.body,
  };
}

/** 본문(ko/en)에 실제로 쓰인 이미지만 발행 요청에 담는다. */
export function usedImages(doc: EditorDoc, images: PublishImage[]): PublishImage[] {
  const text = `${doc.ko.body}\n${doc.en.body}\n${doc.thumbnail}`;
  return images
    .filter((img) => text.includes(img.path))
    .map(({ path, blobSha }) => ({ path, blobSha }));
}

export function toPublishRequest(doc: EditorDoc, images: PublishImage[]): PublishRequest {
  const koExtra: Partial<ApiPostFile["frontmatter"]> = { date: doc.date.trim() };
  if (doc.thumbnail.trim()) koExtra.thumbnail = doc.thumbnail.trim();

  const request: PublishRequest = {
    slug: doc.slug,
    ko: toApiFile(doc.ko, koExtra),
    images: usedImages(doc, images),
  };
  if (doc.id) request.id = doc.id;
  if (doc.baseSha) request.baseSha = doc.baseSha;
  if (!isLocaleEmpty(doc.en)) request.en = toApiFile(doc.en);
  return request;
}

/** 불러온 글 → 에디터 문서 */
export function fromLoadedPost(post: GetPostResponse): EditorDoc {
  const toFields = (file: ApiPostFile | null): LocaleFields =>
    file
      ? {
          title: file.frontmatter.title,
          excerpt: file.frontmatter.excerpt,
          tags: file.frontmatter.tags.join(", "),
          body: file.body,
        }
      : emptyFields();

  return {
    id: post.id,
    slug: post.slug,
    date: post.ko.frontmatter.date ?? "",
    thumbnail: post.ko.frontmatter.thumbnail ?? "",
    ko: toFields(post.ko),
    en: toFields(post.en),
    baseSha: post.headSha,
  };
}

/** 미리보기에서 아직 배포되지 않은 이미지 경로를 브라우저의 object URL로 바꾼다. */
export function previewMarkdown(body: string, images: EditorImage[]): string {
  return images.reduce(
    (text, img) => (img.previewUrl ? text.split(img.path).join(img.previewUrl) : text),
    body,
  );
}
