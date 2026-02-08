import type { BlogPost } from './blog.types';
import { post as post001 } from '@/content/posts/001-retro-computing';
import { post as post002 } from '@/content/posts/002-nextjs-15';
import { post as post003 } from '@/content/posts/003-typescript-tips';
import { post as post004 } from '@/content/posts/004-web-performance';

export type { BlogPost } from './blog.types';

const allPosts = [post001, post002, post003, post004];

export const blogPosts: BlogPost[] = [...allPosts].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);
