/** /api/editor/* 공통: 도메인 에러 → HTTP 응답 (PRD 4장 에러 표) */
import { NextResponse } from "next/server";
import type { ApiError } from "./editor-api-types";
import { ConflictError, NotFoundError, ValidationError } from "./github-content";
import { PostFormatError } from "./post-format";

export function errorResponse(error: unknown): NextResponse<ApiError> {
  if (error instanceof ValidationError) {
    return NextResponse.json({ error: "invalid", fields: error.fields }, { status: 400 });
  }
  if (error instanceof ConflictError) {
    return NextResponse.json({ error: "conflict", headSha: error.headSha }, { status: 409 });
  }
  if (error instanceof NotFoundError) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (error instanceof PostFormatError) {
    return NextResponse.json({ error: "github_error", message: error.message }, { status: 502 });
  }
  const status = (error as { status?: number }).status;
  if (status === 401) {
    // GitHub 토큰이 만료·취소된 경우: 다시 로그인해야 한다.
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  console.error("[editor] GitHub API error", error);
  return NextResponse.json(
    { error: "github_error", message: error instanceof Error ? error.message : "알 수 없는 오류" },
    { status: 502 },
  );
}

export async function readJson<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new ValidationError([{ field: "body", message: "요청 본문이 올바른 JSON이 아닙니다." }]);
  }
}
