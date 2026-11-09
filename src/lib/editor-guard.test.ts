import { describe, expect, it } from "vitest";
import { authOptions } from "./auth";
import { authorizeToken } from "./editor-guard";

describe("authorizeToken", () => {
  it("로그인하지 않으면 401", () => {
    expect(authorizeToken(null)).toEqual({ ok: false, status: 401, error: "unauthorized" });
  });

  it("허용되지 않은 계정이면 403", () => {
    expect(authorizeToken({ login: "someone-else", accessToken: "t" })).toMatchObject({
      ok: false,
      status: 403,
    });
  });

  it("허용된 계정(대소문자 무시)이면 통과", () => {
    expect(authorizeToken({ login: "hyeryongchoi", accessToken: "t" })).toEqual({
      ok: true,
      editor: { login: "hyeryongchoi", accessToken: "t" },
    });
  });
});

describe("authOptions", () => {
  const cb = authOptions.callbacks!;

  it("허용되지 않은 GitHub 계정은 로그인이 거부된다", async () => {
    // @ts-expect-error 테스트에 필요한 값만 넘긴다
    expect(await cb.signIn!({ profile: { login: "intruder" } })).toBe(false);
    // @ts-expect-error 테스트에 필요한 값만 넘긴다
    expect(await cb.signIn!({ profile: { login: "HyeryongChoi" } })).toBe(true);
  });

  it("session에는 access token이 들어가지 않는다", async () => {
    const session = await cb.session!({
      session: { user: { name: "H" }, expires: "x" },
      token: { login: "HyeryongChoi", accessToken: "secret-token" },
    } as unknown as Parameters<NonNullable<typeof cb.session>>[0]);
    expect(JSON.stringify(session)).not.toContain("secret-token");
    expect(session).toMatchObject({ login: "HyeryongChoi" });
  });
});
