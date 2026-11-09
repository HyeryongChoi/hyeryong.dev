import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getLocalizedPost } from "@/data/blog.types";
import { getAllPosts } from "./posts";
import {
  PostFormatError,
  nextPostId,
  parseFolderName,
  parsePostFile,
  serializePostFile,
} from "./post-format";

let root: string;

function writePost(folder: string, files: Record<string, string>) {
  const dir = path.join(root, folder);
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), text);
}

const ko = (title: string, date: string, body = "본문") =>
  `---\ntitle: ${title}\nexcerpt: 요약\ntags: [A]\ndate: "${date}"\n---\n${body}\n`;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "posts-"));
});
afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("getAllPosts", () => {
  it("폴더만 추가하면 최신순으로 목록에 들어간다", () => {
    writePost("001-old", { "ko.md": ko("옛 글", "2024. 11. 15.") });
    writePost("003-test", { "ko.md": ko("새 글", "2026.11.08") });

    const posts = getAllPosts(root);

    expect(posts.map((p) => p.id)).toEqual(["003", "001"]);
    expect(posts[0]).toMatchObject({ slug: "test", title: "새 글", date: "2026.11.08" });
  });

  it("en.md가 없으면 EN 화면은 한국어로 대체된다", () => {
    writePost("001-only-ko", { "ko.md": ko("한국어 제목", "2026.01.01", "한국어 본문") });

    const en = getLocalizedPost(getAllPosts(root)[0], "en");

    expect(en.title).toBe("한국어 제목");
    expect(en.content).toBe("한국어 본문");
  });

  it("en.md가 있으면 EN 화면에 영어 값을 쓴다", () => {
    writePost("001-both", {
      "ko.md": ko("한국어", "2026.01.01", "본문"),
      "en.md": "---\ntitle: English\nexcerpt: Summary\ntags: [B]\n---\nBody\n",
    });

    const en = getLocalizedPost(getAllPosts(root)[0], "en");

    expect(en).toMatchObject({ title: "English", excerpt: "Summary", tags: ["B"], content: "Body" });
    expect(en.date).toBe("2026.01.01");
  });

  it("필수 frontmatter가 빠지면 파일과 필드를 알려주는 에러를 낸다", () => {
    writePost("001-broken", { "ko.md": "---\nexcerpt: 요약\ntags: []\ndate: '2026.01.01'\n---\n본문\n" });

    expect(() => getAllPosts(root)).toThrow(PostFormatError);
    expect(() => getAllPosts(root)).toThrow(/001-broken\/ko\.md: title/);
  });

  it("형식이 맞지 않는 폴더와 파일은 무시한다", () => {
    writePost("001-ok", { "ko.md": ko("정상", "2026.01.01") });
    writePost("drafts", { "ko.md": ko("무시", "2026.01.01") });
    fs.writeFileSync(path.join(root, "README.md"), "# guide");

    expect(getAllPosts(root).map((p) => p.id)).toEqual(["001"]);
  });
});

describe("post-format", () => {
  it("직렬화한 파일을 다시 읽으면 같은 값이 나온다 (백틱·${} 포함)", () => {
    const file = {
      frontmatter: { title: "제목: 콜론", excerpt: "요약", tags: ["React"], date: "2026.11.08" },
      body: "```ts\nconst a = `${b}`;\n```",
    };

    const text = serializePostFile(file, "ko");

    expect(parsePostFile(text, "ko")).toEqual(file);
  });

  it("YAML이 날짜로 해석한 값은 YYYY.MM.DD 문자열로 되돌린다", () => {
    const parsed = parsePostFile("---\ntitle: t\nexcerpt: e\ntags: []\ndate: 2026-11-08\n---\nb", "ko");
    expect(parsed.frontmatter.date).toBe("2026.11.08");
  });

  it("en.md는 date 없이도 유효하다", () => {
    expect(() => parsePostFile("---\ntitle: t\nexcerpt: e\ntags: []\n---\nb", "en")).not.toThrow();
  });

  it("다음 id는 가장 큰 번호 + 1 이다", () => {
    expect(nextPostId(["001", "002"])).toBe("003");
    expect(nextPostId(["001", "010"])).toBe("011");
    expect(nextPostId([])).toBe("001");
  });

  it("폴더 이름에서 id와 slug를 읽는다", () => {
    expect(parseFolderName("002-webview-scroll-bug")).toEqual({ id: "002", slug: "webview-scroll-bug" });
    expect(parseFolderName("2-bad")).toBeNull();
    expect(parseFolderName("003-Bad_Slug")).toBeNull();
  });
});
