import { beforeEach, describe, expect, it } from "vitest";
import type { PublishRequest } from "./editor-api-types";
import { FakeGit } from "./fake-git";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
  getPost,
  imageBaseName,
  listPosts,
  publish,
  uploadImage,
} from "./github-content";

const KO_001 = `---\ntitle: History API\nexcerpt: 요약1\ntags: [SPA]\ndate: "2024. 11. 15."\n---\n본문1\n`;
const KO_002 = `---\ntitle: WebView\nexcerpt: 요약2\ntags: [WebView]\ndate: "2026. 3. 1."\n---\n본문2\n`;
const EN_002 = `---\ntitle: WebView EN\nexcerpt: Summary\ntags: [WebView]\n---\nBody2\n`;

// RIFF....WEBP 헤더를 가진 최소 webp 바이트
const webpBase64 = (seed = "x") =>
  Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBPVP8 "), Buffer.from(seed)]).toString("base64");

let git: FakeGit;
beforeEach(() => {
  git = new FakeGit({
    "src/content/posts/001-history-api/ko.md": KO_001,
    "src/content/posts/002-webview/ko.md": KO_002,
    "src/content/posts/002-webview/en.md": EN_002,
    "src/content/posts/README.md": "# guide",
    "public/images/old.png": "png",
  });
});

const newPost = (over: Partial<PublishRequest> = {}): PublishRequest => ({
  slug: "my-post",
  ko: { frontmatter: { title: "새 글", excerpt: "요약", tags: ["A"], date: "2026.11.08" }, body: "```js\nconst a = `${b}`;\n```" },
  images: [],
  ...over,
});

describe("listPosts / getPost", () => {
  it("main 기준 글 목록을 최신순으로 돌려준다", async () => {
    const res = await listPosts(git);
    expect(res.headSha).toBe(git.head);
    expect(res.posts).toEqual([
      { id: "002", slug: "webview", title: "WebView", date: "2026. 3. 1.", hasEn: true },
      { id: "001", slug: "history-api", title: "History API", date: "2024. 11. 15.", hasEn: false },
    ]);
  });

  it("글 하나를 KO/EN과 함께 불러온다", async () => {
    const res = await getPost(git, "002");
    expect(res).toMatchObject({
      id: "002",
      slug: "webview",
      headSha: git.head,
      ko: { frontmatter: { title: "WebView" }, body: "본문2" },
      en: { frontmatter: { title: "WebView EN" }, body: "Body2" },
    });
    expect((await getPost(git, "001")).en).toBeNull();
  });

  it("없는 글은 NotFoundError", async () => {
    await expect(getPost(git, "999")).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("publish (새 글)", () => {
  it("다음 번호(003)로 ko.md를 커밋 1개로 만든다", async () => {
    const before = git.commitCount();
    const res = await publish(git, newPost());

    expect(res).toMatchObject({ id: "003", url: "/blog/003", commitSha: git.head });
    expect(git.commitCount()).toBe(before + 1);
    const files = git.files();
    expect(files["src/content/posts/003-my-post/ko.md"]).toContain("title: 새 글");
    expect(files["src/content/posts/003-my-post/ko.md"]).toContain("const a = `${b}`;");
    expect(files["src/content/posts/003-my-post/en.md"]).toBeUndefined();
    expect(git.commits.get(git.head)!.message).toMatch(/^post: add 003-my-post/);
  });

  it("영어가 있으면 같은 커밋에 en.md도 들어간다", async () => {
    await publish(git, newPost({ en: { frontmatter: { title: "New", excerpt: "", tags: [] }, body: "Body" } }));
    expect(git.files()["src/content/posts/003-my-post/en.md"]).toContain("title: New");
  });

  it("커밋한 글은 다시 읽어도 같은 내용이다", async () => {
    const req = newPost();
    await publish(git, req);
    const loaded = await getPost(git, "003");
    expect(loaded.ko).toEqual(req.ko);
  });

  it("이미지와 글이 커밋 1개에 함께 들어간다", async () => {
    const img1 = await uploadImage(git, "Screen Shot 2026.png", webpBase64("1"));
    const img2 = await uploadImage(git, "diagram.webp", webpBase64("2"));
    const before = git.commitCount();

    await publish(git, newPost({ images: [img1, img2] }));

    expect(git.commitCount()).toBe(before + 1);
    const files = Object.keys(git.files());
    expect(files).toContain(`public${img1.path}`);
    expect(files).toContain(`public${img2.path}`);
  });

  it("제목이 비었거나 slug가 틀리면 커밋하지 않고 필드를 알려준다", async () => {
    const head = git.head;
    const bad = newPost({ slug: "Bad Slug" });
    bad.ko.frontmatter.title = "";

    const error = await publish(git, bad).catch((e) => e);

    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).fields.map((f) => f.field)).toEqual(["slug", "ko.title"]);
    expect(git.head).toBe(head);
  });

  it("이미지 경로가 /images/*.webp 형식이 아니면 거부한다", async () => {
    const error = await publish(git, newPost({ images: [{ path: "/../src/x.ts", blobSha: "a".repeat(40) }] })).catch((e) => e);
    expect(error).toBeInstanceOf(ValidationError);
  });
});

describe("publish (수정)", () => {
  it("기존 폴더의 파일을 갱신하는 커밋 1개를 만든다", async () => {
    const loaded = await getPost(git, "002");
    const before = git.commitCount();

    const res = await publish(git, {
      id: "002",
      slug: "webview",
      baseSha: loaded.headSha,
      ko: { ...loaded.ko, body: "고친 본문" },
      en: loaded.en!,
      images: [],
    });

    expect(res.id).toBe("002");
    expect(git.commitCount()).toBe(before + 1);
    expect(git.files()["src/content/posts/002-webview/ko.md"]).toContain("고친 본문");
    expect(Object.keys(git.files()).filter((p) => p.includes("/003-"))).toEqual([]);
    expect(git.commits.get(git.head)!.message).toMatch(/^post: update 002-webview/);
  });

  it("영어를 비우면 기존 en.md를 지운다", async () => {
    const loaded = await getPost(git, "002");
    await publish(git, { id: "002", slug: "webview", baseSha: loaded.headSha, ko: loaded.ko, images: [] });
    expect(git.files()["src/content/posts/002-webview/en.md"]).toBeUndefined();
  });

  it("불러온 뒤 main이 바뀌었으면 409(ConflictError)이고 커밋하지 않는다", async () => {
    const loaded = await getPost(git, "002");
    git.commitElsewhere("README.md", "changed");
    const head = git.head;

    const error = await publish(git, { id: "002", slug: "webview", baseSha: loaded.headSha, ko: loaded.ko, images: [] }).catch(
      (e) => e,
    );

    expect(error).toBeInstanceOf(ConflictError);
    expect((error as ConflictError).headSha).toBe(head);
    expect(git.head).toBe(head);
  });

  it("커밋 직전에 다른 커밋이 끼어들어도 덮어쓰지 않고 409", async () => {
    git.raceOnNextUpdate = true;
    await expect(publish(git, newPost())).rejects.toBeInstanceOf(ConflictError);
    expect(git.files()["src/content/posts/003-my-post/ko.md"]).toBeUndefined();
  });

  it("기존 글의 slug는 바꿀 수 없다", async () => {
    const loaded = await getPost(git, "002");
    await expect(
      publish(git, { id: "002", slug: "renamed", baseSha: loaded.headSha, ko: loaded.ko, images: [] }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("uploadImage", () => {
  it("webp가 아니면 거부한다", async () => {
    await expect(uploadImage(git, "a.png", Buffer.from("\x89PNG....").toString("base64"))).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it("4MB를 넘으면 거부한다", async () => {
    const big = Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBP"), Buffer.alloc(4 * 1024 * 1024)]);
    await expect(uploadImage(git, "big.webp", big.toString("base64"))).rejects.toBeInstanceOf(ValidationError);
  });

  it("파일 이름을 안전한 slug로 바꾸고 blob sha 일부를 붙인다", async () => {
    const res = await uploadImage(git, "Screen Shot 2026-11-08 at 1.23.45 PM.png", webpBase64());
    expect(res.path).toMatch(/^\/images\/screen-shot-2026-11-08-at-1-23-45-pm-[0-9a-f]{8}\.webp$/);
    expect(imageBaseName("../../etc/passwd")).toBe("passwd");
    expect(imageBaseName("캡처.png")).toBe("image");
  });
});
