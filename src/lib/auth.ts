/**
 * 에디터 로그인 (next-auth v4, GitHub OAuth).
 * - 허용된 계정(editorConfig.allowedLogin)만 로그인된다.
 * - GitHub access token은 서버 쪽 JWT에만 저장하고 session(클라이언트로 가는 값)에는 넣지 않는다.
 */
import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { isAllowedLogin } from "./editor-config";

interface GitHubProfile {
  login?: string;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
      // 공개 레포에 커밋할 권한. 비공개 레포라면 "repo"로 바꾼다.
      authorization: { params: { scope: "read:user public_repo" } },
    }),
  ],
  pages: { signIn: "/editor", error: "/editor" },
  callbacks: {
    signIn({ profile }) {
      return isAllowedLogin((profile as GitHubProfile | undefined)?.login);
    },
    jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token;
        token.login = (profile as GitHubProfile).login;
      }
      return token;
    },
    session({ session, token }) {
      // accessToken은 의도적으로 넣지 않는다.
      return { ...session, login: typeof token.login === "string" ? token.login : undefined };
    },
  },
};
