import type { BlogPost } from "./blog.types";
import { post as post001 } from "@/content/posts/001-history-api";

export type { BlogPost } from "./blog.types";

const allPosts = [post001];

/** 최신 글 먼저 (날짜 내림차순) */
export const blogPosts: BlogPost[] = [...allPosts].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
);
