/** 에디터 설정 (서버 전용). 값은 환경변수로 바꿀 수 있고, 기본값은 이 블로그 레포다. */
export const editorConfig = {
  allowedLogin: process.env.EDITOR_ALLOWED_LOGIN ?? "HyeryongChoi",
  repoOwner: process.env.EDITOR_REPO_OWNER ?? "HyeryongChoi",
  repoName: process.env.EDITOR_REPO_NAME ?? "hyeryong.dev",
  branch: process.env.EDITOR_REPO_BRANCH ?? "main",
  /** 테스트·로컬 확인용으로 GitHub API 주소를 바꿀 때만 쓴다. */
  githubApiUrl: process.env.EDITOR_GITHUB_API_URL ?? "https://api.github.com",
};

export function isAllowedLogin(login: unknown): boolean {
  return (
    typeof login === "string" &&
    login.toLowerCase() === editorConfig.allowedLogin.toLowerCase()
  );
}
