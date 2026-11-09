/**
 * /api/editor/* 공통 권한 확인 (서버 전용).
 * 로그인 안 함 → 401, 허용되지 않은 계정 → 403.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getToken, type JWT } from "next-auth/jwt";
import { isAllowedLogin } from "./editor-config";

export interface EditorIdentity {
  login: string;
  accessToken: string;
}

export type GuardResult =
  | { ok: true; editor: EditorIdentity }
  | { ok: false; status: 401 | 403; error: "unauthorized" | "forbidden" };

/** 토큰 내용만 보고 판단하는 순수 함수 */
export function authorizeToken(token: JWT | null): GuardResult {
  if (!token || typeof token.accessToken !== "string") {
    return { ok: false, status: 401, error: "unauthorized" };
  }
  if (!isAllowedLogin(token.login)) {
    return { ok: false, status: 403, error: "forbidden" };
  }
  return { ok: true, editor: { login: token.login as string, accessToken: token.accessToken } };
}

type Handler<C> = (req: NextRequest, editor: EditorIdentity, ctx: C) => Promise<Response>;

/** Route Handler를 감싸 권한이 없으면 401/403을 바로 반환한다. */
export function withEditor<C>(handler: Handler<C>) {
  return async (req: NextRequest, ctx: C): Promise<Response> => {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const result = authorizeToken(token);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return handler(req, result.editor, ctx);
  };
}
