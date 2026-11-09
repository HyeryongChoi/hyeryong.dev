/** 테스트용 메모리 Git 저장소 (GitClient 구현). 커밋은 경로 → 내용 맵의 스냅샷이다. */
import { createHash } from "node:crypto";
import { RefConflictError, type GitClient, type NewTreeEntry, type TreeEntry } from "./github-content";

const sha1 = (s: string) => createHash("sha1").update(s).digest("hex");

export class FakeGit implements GitClient {
  blobs = new Map<string, string>(); // sha → base64
  trees = new Map<string, Map<string, string>>(); // treeSha → path → blobSha
  commits = new Map<string, { tree: string; parent: string | null; message: string }>();
  head: string;
  /** updateHead 직전에 다른 커밋이 끼어든 상황을 흉내 낸다 */
  raceOnNextUpdate = false;

  constructor(files: Record<string, string> = {}) {
    const tree = new Map<string, string>();
    for (const [path, text] of Object.entries(files)) tree.set(path, this.putBlob(Buffer.from(text).toString("base64")));
    this.head = this.putCommit(this.putTree(tree), null, "init");
  }

  private putBlob(base64: string) {
    const sha = sha1(`blob:${base64}`);
    this.blobs.set(sha, base64);
    return sha;
  }
  private putTree(tree: Map<string, string>) {
    const sha = sha1(`tree:${JSON.stringify(Array.from(tree).sort())}`);
    this.trees.set(sha, tree);
    return sha;
  }
  private putCommit(tree: string, parent: string | null, message: string) {
    const sha = sha1(`commit:${tree}:${parent}:${message}:${this.commits.size}`);
    this.commits.set(sha, { tree, parent, message });
    return sha;
  }

  /** 다른 곳에서 main에 커밋이 생긴 상황 */
  commitElsewhere(path: string, text: string) {
    const tree = new Map(this.trees.get(this.commits.get(this.head)!.tree));
    tree.set(path, this.putBlob(Buffer.from(text).toString("base64")));
    this.head = this.putCommit(this.putTree(tree), this.head, "elsewhere");
  }

  files(commit = this.head): Record<string, string> {
    const tree = this.trees.get(this.commits.get(commit)!.tree)!;
    return Object.fromEntries(Array.from(tree).map(([p, s]) => [p, Buffer.from(this.blobs.get(s)!, "base64").toString()]));
  }

  async getHeadSha() {
    return this.head;
  }
  async getCommitTreeSha(commitSha: string) {
    return this.commits.get(commitSha)!.tree;
  }
  async getTree(treeSha: string): Promise<TreeEntry[]> {
    return Array.from(this.trees.get(treeSha)!).map(([path, sha]) => ({ path, sha, type: "blob" as const }));
  }
  async getBlobText(blobSha: string) {
    return Buffer.from(this.blobs.get(blobSha)!, "base64").toString("utf8");
  }
  async createBlob(base64: string) {
    return this.putBlob(base64);
  }
  async createTree(baseTreeSha: string, entries: NewTreeEntry[]) {
    const tree = new Map(this.trees.get(baseTreeSha));
    for (const e of entries) {
      if (e.content !== undefined) tree.set(e.path, this.putBlob(Buffer.from(e.content).toString("base64")));
      else if (e.sha === null) tree.delete(e.path);
      else if (e.sha) {
        if (!this.blobs.has(e.sha)) throw new Error(`unknown blob ${e.sha}`);
        tree.set(e.path, e.sha);
      }
    }
    return this.putTree(tree);
  }
  async createCommit(message: string, treeSha: string, parentSha: string) {
    return this.putCommit(treeSha, parentSha, message);
  }
  async updateHead(commitSha: string) {
    if (this.raceOnNextUpdate) {
      this.raceOnNextUpdate = false;
      this.commitElsewhere("README.md", "race");
    }
    if (this.commits.get(commitSha)!.parent !== this.head) throw new RefConflictError();
    this.head = commitSha;
  }
  commitUrl(commitSha: string) {
    return `https://github.com/test/repo/commit/${commitSha}`;
  }
  commitCount() {
    let n = 0;
    for (let c: string | null = this.head; c; c = this.commits.get(c)!.parent) n++;
    return n;
  }
}
