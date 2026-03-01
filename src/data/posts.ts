import type { BlogPost } from "./blog.types";
import { post as post001 } from "@/content/posts/001-history-api";
import { post as post002 } from "@/content/posts/002-webview-scroll-bug";

export type { BlogPost } from "./blog.types";

const allPosts = [post001, post002];

/** 최신 글 먼저 (날짜 내림차순) */
export const blogPosts: BlogPost[] = [...allPosts].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
);
