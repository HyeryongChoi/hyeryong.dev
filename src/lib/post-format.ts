/**
 * 마크다운 글 파일 형식 (서버 전용).
 * 로더(빌드 시)와 에디터 API(발행 시)가 같은 규칙을 쓰도록 한곳에 모은다.
 *
 * 글 폴더: src/content/posts/{id}-{slug}/ko.md (필수), en.md (선택)
 */
import matter from "gray-matter";
import type { BlogPost } from "../data/blog.types";

export type PostLocale = "ko" | "en";

export interface PostFrontmatter {
  title: string;
  excerpt: string;
  tags: string[];
  /** ko.md에만 필수. en.md는 ko 값을 따른다. */
  date?: string;
  thumbnail?: string;
}

export interface PostFile {
  frontmatter: PostFrontmatter;
  body: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export const POSTS_DIR = "src/content/posts";
export const FOLDER_PATTERN = /^(\d{3})-([a-z0-9]+(?:-[a-z0-9]+)*)$/;
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function parseFolderName(name: string): { id: string; slug: string } | null {
  const match = FOLDER_PATTERN.exec(name);
  return match ? { id: match[1], slug: match[2] } : null;
}

export function folderName(id: string, slug: string): string {
  return `${id}-${slug}`;
}

/** 기존 id 중 가장 큰 번호 + 1 (3자리) */
export function nextPostId(existingIds: string[]): string {
  const max = existingIds.reduce((acc, id) => Math.max(acc, Number(id) || 0), 0);
  return String(max + 1).padStart(3, "0");
}

/** YAML이 날짜처럼 생긴 값을 Date로 바꿔버리는 경우를 블로그 형식(YYYY.MM.DD)으로 되돌린다. */
function normalizeDate(value: unknown): unknown {
  if (value instanceof Date) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, "0");
    const d = String(value.getUTCDate()).padStart(2, "0");
    return `${y}.${m}.${d}`;
  }
  return value;
}

export function validateFrontmatter(data: unknown, locale: PostLocale): FieldError[] {
  const errors: FieldError[] = [];
  const fm = (data ?? {}) as Record<string, unknown>;

  if (typeof fm.title !== "string" || fm.title.trim() === "") {
    errors.push({ field: "title", message: "제목은 비어 있을 수 없습니다." });
  }
  if (typeof fm.excerpt !== "string") {
    errors.push({ field: "excerpt", message: "요약(excerpt)은 문자열이어야 합니다." });
  }
  if (!Array.isArray(fm.tags) || fm.tags.some((t) => typeof t !== "string")) {
    errors.push({ field: "tags", message: "태그는 문자열 배열이어야 합니다." });
  }
  const date = normalizeDate(fm.date);
  if (locale === "ko" && (typeof date !== "string" || date.trim() === "")) {
    errors.push({ field: "date", message: "날짜는 ko.md에 필수입니다." });
  }
  if (fm.thumbnail !== undefined && typeof fm.thumbnail !== "string") {
    errors.push({ field: "thumbnail", message: "썸네일은 경로 문자열이어야 합니다." });
  }
  return errors;
}

export class PostFormatError extends Error {
  constructor(
    readonly file: string,
    readonly errors: FieldError[],
  ) {
    super(`${file}: ${errors.map((e) => `${e.field} - ${e.message}`).join(", ")}`);
    this.name = "PostFormatError";
  }
}

/** md 파일 텍스트 → frontmatter + 본문. 형식이 틀리면 파일·필드를 담은 에러를 던진다. */
export function parsePostFile(text: string, locale: PostLocale, file = `${locale}.md`): PostFile {
  // gray-matter는 같은 문자열의 결과를 캐시하므로 복사본을 받아 수정한다.
  const parsed = matter(text);
  const data = { ...(parsed.data as Record<string, unknown>) };
  data.date = normalizeDate(data.date);

  const errors = validateFrontmatter(data, locale);
  if (errors.length > 0) throw new PostFormatError(file, errors);

  const frontmatter: PostFrontmatter = {
    title: data.title as string,
    excerpt: data.excerpt as string,
    tags: [...(data.tags as string[])],
  };
  if (typeof data.date === "string") frontmatter.date = data.date;
  if (typeof data.thumbnail === "string") frontmatter.thumbnail = data.thumbnail;

  return { frontmatter, body: stripTrailingNewline(parsed.content) };
}

function stripTrailingNewline(text: string): string {
  return text.endsWith("\n") ? text.slice(0, -1) : text;
}

/** frontmatter + 본문 → md 파일 텍스트 */
export function serializePostFile(file: PostFile, locale: PostLocale): string {
  const fm: Record<string, unknown> = {
    title: file.frontmatter.title,
    excerpt: file.frontmatter.excerpt,
    tags: file.frontmatter.tags,
  };
  if (locale === "ko") {
    if (file.frontmatter.date) fm.date = file.frontmatter.date;
    if (file.frontmatter.thumbnail) fm.thumbnail = file.frontmatter.thumbnail;
  }
  // 항상 줄바꿈 하나를 붙여 저장하고, 읽을 때 정확히 하나만 지운다 → 본문이 그대로 왕복된다.
  return matter.stringify(`${file.body}\n`, fm);
}

/** ko(+en) 파일 → 블로그가 쓰는 BlogPost. en이 없으면 기본값(content 등)이 ko라서 EN 화면도 한국어로 대체된다. */
export function toBlogPost(id: string, slug: string, ko: PostFile, en: PostFile | null): BlogPost {
  const post: BlogPost = {
    id,
    slug,
    title: ko.frontmatter.title,
    date: ko.frontmatter.date ?? "",
    excerpt: ko.frontmatter.excerpt,
    tags: ko.frontmatter.tags,
    content: ko.body,
    titleKo: ko.frontmatter.title,
    excerptKo: ko.frontmatter.excerpt,
    tagsKo: ko.frontmatter.tags,
    contentKo: ko.body,
  };
  if (ko.frontmatter.thumbnail) post.thumbnail = ko.frontmatter.thumbnail;
  if (en) {
    post.titleEn = en.frontmatter.title;
    post.excerptEn = en.frontmatter.excerpt;
    post.tagsEn = en.frontmatter.tags;
    post.contentEn = en.body;
  }
  return post;
}

/** 최신 글 먼저 (날짜 내림차순, 같으면 id 내림차순) */
export function sortPostsByDateDesc<T extends { date: string; id: string }>(posts: T[]): T[] {
  return [...posts].sort((a, b) => {
    const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
    return diff !== 0 && !Number.isNaN(diff) ? diff : b.id.localeCompare(a.id);
  });
}
