/**
 * 빌드 시점 글 로더 (서버 전용).
 * src/content/posts/{id}-{slug}/ 폴더를 읽어 BlogPost[]를 만든다. 폴더만 추가하면 자동 등록된다.
 */
import fs from "node:fs";
import path from "node:path";
import type { BlogPost } from "../data/blog.types";
import { POSTS_DIR, parseFolderName, parsePostFile, sortPostsByDateDesc, toBlogPost } from "./post-format";

export function getAllPosts(rootDir: string = path.join(process.cwd(), POSTS_DIR)): BlogPost[] {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  const posts: BlogPost[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const parsed = parseFolderName(entry.name);
    if (!parsed) continue;

    const dir = path.join(rootDir, entry.name);
    const koPath = path.join(dir, "ko.md");
    const enPath = path.join(dir, "en.md");
    const rel = (p: string) => path.relative(process.cwd(), p);

    if (!fs.existsSync(koPath)) {
      throw new Error(`${rel(koPath)}: ko.md가 없습니다.`);
    }
    const ko = parsePostFile(fs.readFileSync(koPath, "utf8"), "ko", rel(koPath));
    const en = fs.existsSync(enPath)
      ? parsePostFile(fs.readFileSync(enPath, "utf8"), "en", rel(enPath))
      : null;

    posts.push(toBlogPost(parsed.id, parsed.slug, ko, en));
  }

  return sortPostsByDateDesc(posts);
}

export function getPostById(id: string, rootDir?: string): BlogPost | undefined {
  return getAllPosts(rootDir).find((p) => p.id === id);
}
