/** 에디터 화면 → /api/editor/* 호출 */
import type {
  ApiError,
  GetPostResponse,
  ListPostsResponse,
  PublishRequest,
  PublishResponse,
  UploadImageRequest,
  UploadImageResponse,
} from "@/lib/editor-api-types";

export class EditorApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: Partial<ApiError> & Record<string, unknown>,
  ) {
    super(typeof body.message === "string" ? body.message : `요청 실패 (${status})`);
    this.name = "EditorApiError";
  }
}

async function request<T>(url: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(
      url,
      body === undefined
        ? { cache: "no-store" }
        : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
    );
  } catch {
    throw new EditorApiError(0, { message: "네트워크에 연결할 수 없어요." });
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new EditorApiError(res.status, data);
  return data as T;
}

export const editorApi = {
  listPosts: () => request<ListPostsResponse>("/api/editor/posts"),
  getPost: (id: string) => request<GetPostResponse>(`/api/editor/posts/${encodeURIComponent(id)}`),
  uploadImage: (body: UploadImageRequest) => request<UploadImageResponse>("/api/editor/images", body),
  publish: (body: PublishRequest) => request<PublishResponse>("/api/editor/publish", body),
};
