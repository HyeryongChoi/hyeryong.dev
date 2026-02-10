import type { BlogPost } from "./blog.types";
import { post as post001 } from "@/content/posts/001-retro-computing";
import { post as post002 } from "@/content/posts/002-nextjs-15";
import { post as post003 } from "@/content/posts/003-typescript-tips";

export type { BlogPost } from "./blog.types";

const allPosts = [post001, post002, post003];

/** 최신 글 먼저 (날짜 내림차순) */
export const blogPosts: BlogPost[] = [...allPosts].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
);
