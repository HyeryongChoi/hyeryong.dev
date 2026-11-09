/**
 * 에디터의 GitHub 저장 로직 (서버 전용).
 * Git Data API를 GitClient 인터페이스 뒤에 두어, 실제 Octokit 대신 가짜 저장소로 테스트할 수 있게 한다.
 */
import type {
  ApiPostFile,
  FieldErrorItem,
  GetPostResponse,
  ListPostsResponse,
  PublishRequest,
  UploadImageResponse,
} from "./editor-api-types";
import {
  POSTS_DIR,
  SLUG_PATTERN,
  folderName,
  nextPostId,
  parseFolderName,
  parsePostFile,
  serializePostFile,
  sortPostsByDateDesc,
  validateFrontmatter,
  type PostLocale,
} from "./post-format";

export interface TreeEntry {
  path: string;
  type: "blob" | "tree" | "commit";
  sha: string;
}

export interface NewTreeEntry {
  path: string;
  /** 기존 blob을 가리킬 때 */
  sha?: string | null;
  /** 텍스트 파일 내용을 바로 넣을 때 */
  content?: string;
}

export interface GitClient {
  getHeadSha(): Promise<string>;
  getCommitTreeSha(commitSha: string): Promise<string>;
  getTree(treeSha: string): Promise<TreeEntry[]>;
  getBlobText(blobSha: string): Promise<string>;
  createBlob(base64: string): Promise<string>;
  createTree(baseTreeSha: string, entries: NewTreeEntry[]): Promise<string>;
  createCommit(message: string, treeSha: string, parentSha: string): Promise<string>;
  /** fast-forward가 아니면 RefConflictError를 던진다 */
  updateHead(commitSha: string): Promise<void>;
  commitUrl(commitSha: string): string;
}

export class ValidationError extends Error {
  constructor(readonly fields: FieldErrorItem[]) {
    super(fields.map((f) => `${f.field}: ${f.message}`).join(", "));
    this.name = "ValidationError";
  }
}

export class ConflictError extends Error {
  constructor(readonly headSha: string) {
    super("main이 바뀌었습니다.");
    this.name = "ConflictError";
  }
}

/** updateHead에서 non-fast-forward일 때 GitClient 구현이 던진다 */
export class RefConflictError extends Error {}

export class NotFoundError extends Error {}

export const IMAGE_DIR = "public/images";
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const IMAGE_PATH_PATTERN = /^\/images\/[a-z0-9]+(?:-[a-z0-9]+)*\.webp$/;
const SHA_PATTERN = /^[0-9a-f]{40}$/;

interface PostFolder {
  id: string;
  slug: string;
  dir: string;
  ko?: TreeEntry;
  en?: TreeEntry;
}

async function readSnapshot(client: GitClient) {
  const headSha = await client.getHeadSha();
  const treeSha = await client.getCommitTreeSha(headSha);
  const tree = await client.getTree(treeSha);

  const folders = new Map<string, PostFolder>();
  const prefix = `${POSTS_DIR}/`;
  for (const entry of tree) {
    if (!entry.path.startsWith(prefix)) continue;
    const [folder, file, ...rest] = entry.path.slice(prefix.length).split("/");
    const parsed = parseFolderName(folder);
    if (!parsed) continue;
    const post = folders.get(parsed.id) ?? { ...parsed, dir: `${prefix}${folder}` };
    if (entry.type === "blob" && rest.length === 0 && (file === "ko.md" || file === "en.md")) {
      post[file === "ko.md" ? "ko" : "en"] = entry;
    }
    folders.set(parsed.id, post);
  }
  return { headSha, treeSha, folders };
}

export async function listPosts(client: GitClient): Promise<ListPostsResponse> {
  const { headSha, folders } = await readSnapshot(client);
  const posts = await Promise.all(
    Array.from(folders.values())
      .filter((f) => f.ko)
      .map(async (f) => {
        const ko = parsePostFile(await client.getBlobText(f.ko!.sha), "ko", `${f.dir}/ko.md`);
        return { id: f.id, slug: f.slug, title: ko.frontmatter.title, date: ko.frontmatter.date ?? "", hasEn: !!f.en };
      }),
  );
  return { posts: sortPostsByDateDesc(posts), headSha };
}

export async function getPost(client: GitClient, id: string): Promise<GetPostResponse> {
  const { headSha, folders } = await readSnapshot(client);
  const folder = folders.get(id);
  if (!folder?.ko) throw new NotFoundError(`글 ${id}를 찾을 수 없습니다.`);

  const ko = parsePostFile(await client.getBlobText(folder.ko.sha), "ko", `${folder.dir}/ko.md`);
  const en = folder.en
    ? parsePostFile(await client.getBlobText(folder.en.sha), "en", `${folder.dir}/en.md`)
    : null;
  return { id, slug: folder.slug, ko, en, headSha };
}

function isWebp(bytes: Buffer): boolean {
  return (
    bytes.length > 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  );
}

export function imageBaseName(filename: string): string {
  const base = filename
    .replace(/^.*[\\/]/, "")
    .replace(/\.[^.]*$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  return base || "image";
}

export async function uploadImage(
  client: GitClient,
  filename: string,
  base64: string,
): Promise<UploadImageResponse> {
  const bytes = Buffer.from(base64, "base64");
  if (bytes.length > MAX_IMAGE_BYTES) {
    throw new ValidationError([{ field: "image", message: "이미지가 4MB를 넘어요." }]);
  }
  if (!isWebp(bytes)) {
    throw new ValidationError([{ field: "image", message: "webp 이미지만 올릴 수 있어요." }]);
  }
  const blobSha = await client.createBlob(base64);
  return { blobSha, path: `/images/${imageBaseName(filename)}-${blobSha.slice(0, 8)}.webp` };
}

function validateRequest(req: PublishRequest): FieldErrorItem[] {
  const errors: FieldErrorItem[] = [];
  if (typeof req.slug !== "string" || !SLUG_PATTERN.test(req.slug)) {
    errors.push({ field: "slug", message: "slug는 영문 소문자·숫자·-만 쓸 수 있어요." });
  }
  const checkFile = (file: ApiPostFile | undefined, locale: PostLocale) => {
    if (!file || typeof file.body !== "string") {
      errors.push({ field: `${locale}.body`, message: "본문이 없습니다." });
      return;
    }
    for (const e of validateFrontmatter(file.frontmatter, locale)) {
      errors.push({ field: `${locale}.${e.field}`, message: e.message });
    }
  };
  checkFile(req.ko, "ko");
  if (req.en !== undefined) checkFile(req.en, "en");

  if (!Array.isArray(req.images)) {
    errors.push({ field: "images", message: "images는 배열이어야 합니다." });
  } else if (req.images.some((img) => !IMAGE_PATH_PATTERN.test(img.path) || !SHA_PATTERN.test(img.blobSha))) {
    errors.push({ field: "images", message: "이미지 경로나 sha 형식이 올바르지 않습니다." });
  }
  return errors;
}

/** 글과 이미지를 main에 커밋 1개로 올린다. */
export async function publish(client: GitClient, req: PublishRequest) {
  const errors = validateRequest(req);
  if (errors.length > 0) throw new ValidationError(errors);

  const { headSha, treeSha, folders } = await readSnapshot(client);

  let id: string;
  let dir: string;
  let action: "add" | "update";
  const entries: NewTreeEntry[] = [];

  if (req.id) {
    const existing = folders.get(req.id);
    if (!existing) throw new NotFoundError(`글 ${req.id}를 찾을 수 없습니다.`);
    if (existing.slug !== req.slug) {
      throw new ValidationError([{ field: "slug", message: "기존 글의 slug는 바꿀 수 없어요." }]);
    }
    if (!req.baseSha) {
      throw new ValidationError([{ field: "baseSha", message: "수정할 때는 baseSha가 필요합니다." }]);
    }
    if (req.baseSha !== headSha) throw new ConflictError(headSha);

    id = req.id;
    dir = existing.dir;
    action = "update";
    if (!req.en && existing.en) entries.push({ path: `${dir}/en.md`, sha: null });
  } else {
    id = nextPostId(Array.from(folders.keys()));
    dir = `${POSTS_DIR}/${folderName(id, req.slug)}`;
    action = "add";
  }

  entries.push({ path: `${dir}/ko.md`, content: serializePostFile(req.ko, "ko") });
  if (req.en) entries.push({ path: `${dir}/en.md`, content: serializePostFile(req.en, "en") });
  for (const img of req.images) {
    entries.push({ path: `public${img.path}`, sha: img.blobSha });
  }

  const newTree = await client.createTree(treeSha, entries);
  const message = `post: ${action} ${folderName(id, req.slug)}\n\nPublished from /editor`;
  const commitSha = await client.createCommit(message, newTree, headSha);
  try {
    await client.updateHead(commitSha);
  } catch (error) {
    if (error instanceof RefConflictError) throw new ConflictError(await client.getHeadSha());
    throw error;
  }

  return { commitSha, commitUrl: client.commitUrl(commitSha), id, url: `/blog/${id}` };
}
