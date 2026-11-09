/** GitClient의 실제 구현: 로그인한 사용자의 토큰으로 GitHub Git Data API를 호출한다 (서버 전용). */
import { Octokit } from "@octokit/rest";
import { editorConfig } from "./editor-config";
import { RefConflictError, type GitClient } from "./github-content";

export function createGitClient(accessToken: string): GitClient {
  const octokit = new Octokit({ auth: accessToken, baseUrl: editorConfig.githubApiUrl });
  const { repoOwner: owner, repoName: repo, branch } = editorConfig;
  const ref = `heads/${branch}`;

  return {
    async getHeadSha() {
      const { data } = await octokit.git.getRef({ owner, repo, ref });
      return data.object.sha;
    },
    async getCommitTreeSha(commitSha) {
      const { data } = await octokit.git.getCommit({ owner, repo, commit_sha: commitSha });
      return data.tree.sha;
    },
    async getTree(treeSha) {
      const { data } = await octokit.git.getTree({ owner, repo, tree_sha: treeSha, recursive: "true" });
      if (data.truncated) throw new Error("레포 트리가 너무 커서 GitHub가 일부만 돌려줬습니다.");
      return data.tree
        .filter((e) => e.path && e.sha && e.type)
        .map((e) => ({ path: e.path!, sha: e.sha!, type: e.type as "blob" | "tree" | "commit" }));
    },
    async getBlobText(blobSha) {
      const { data } = await octokit.git.getBlob({ owner, repo, file_sha: blobSha });
      return Buffer.from(data.content, data.encoding as BufferEncoding).toString("utf8");
    },
    async createBlob(base64) {
      const { data } = await octokit.git.createBlob({ owner, repo, content: base64, encoding: "base64" });
      return data.sha;
    },
    async createTree(baseTreeSha, entries) {
      const { data } = await octokit.git.createTree({
        owner,
        repo,
        base_tree: baseTreeSha,
        tree: entries.map((e) => ({
          path: e.path,
          mode: "100644" as const,
          type: "blob" as const,
          ...(e.content !== undefined ? { content: e.content } : { sha: e.sha ?? null }),
        })),
      });
      return data.sha;
    },
    async createCommit(message, treeSha, parentSha) {
      const { data } = await octokit.git.createCommit({ owner, repo, message, tree: treeSha, parents: [parentSha] });
      return data.sha;
    },
    async updateHead(commitSha) {
      try {
        await octokit.git.updateRef({ owner, repo, ref, sha: commitSha, force: false });
      } catch (error) {
        // 422: fast-forward가 아님 (그 사이 다른 커밋이 생김)
        if ((error as { status?: number }).status === 422) throw new RefConflictError();
        throw error;
      }
    },
    commitUrl(commitSha) {
      return `https://github.com/${owner}/${repo}/commit/${commitSha}`;
    },
  };
}
