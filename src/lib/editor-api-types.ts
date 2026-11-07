/** 에디터 ↔ /api/editor/* 계약 (PRD 4장). 클라이언트·서버가 함께 쓰는 타입만 둔다. */

export interface ApiFrontmatter {
  title: string;
  excerpt: string;
  tags: string[];
  date?: string;
  thumbnail?: string;
}

export interface ApiPostFile {
  frontmatter: ApiFrontmatter;
  body: string;
}

export interface PostSummary {
  id: string;
  slug: string;
  title: string;
  date: string;
  hasEn: boolean;
}

export interface ListPostsResponse {
  posts: PostSummary[];
  headSha: string;
}

export interface GetPostResponse {
  id: string;
  slug: string;
  ko: ApiPostFile;
  en: ApiPostFile | null;
  headSha: string;
}

export interface UploadImageRequest {
  filename: string;
  /** webp 파일의 base64 (data: 접두어 없이) */
  base64: string;
}

export interface UploadImageResponse {
  blobSha: string;
  /** 본문에 넣을 경로. 예: /images/capture-1a2b3c4d.webp */
  path: string;
}

export interface PublishImage {
  path: string;
  blobSha: string;
}

export interface PublishRequest {
  /** 없으면 새 글 */
  id?: string;
  slug: string;
  ko: ApiPostFile;
  /** 없으면 en.md를 만들지 않는다 (수정 시에는 기존 en.md를 지운다) */
  en?: ApiPostFile;
  images: PublishImage[];
  /** 수정할 때 글을 불러온 시점의 main 커밋. 그 사이 main이 바뀌면 409 */
  baseSha?: string;
}

export interface PublishResponse {
  commitSha: string;
  commitUrl: string;
  id: string;
  /** 반영 후 글 주소. 예: /blog/003 */
  url: string;
}

export interface FieldErrorItem {
  /** 예: "slug", "ko.title", "en.excerpt", "images" */
  field: string;
  message: string;
}

export type ApiError =
  | { error: "unauthorized" | "forbidden" | "not_found" }
  | { error: "invalid"; fields: FieldErrorItem[] }
  | { error: "conflict"; headSha: string }
  | { error: "github_error"; message: string };
