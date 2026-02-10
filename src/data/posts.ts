import type { BlogPost } from "./blog.types";
import { post as post001 } from "@/content/posts/001-retro-computing";
import { post as post002 } from "@/content/posts/002-nextjs-15";
import { post as post003 } from "@/content/posts/003-typescript-tips";
import { post as post004 } from "@/content/posts/004-web-performance";
import { post as post005 } from "@/content/posts/005-react-server-components";
import { post as post006 } from "@/content/posts/006-css-grid-tricks";
import { post as post007 } from "@/content/posts/007-git-workflow";
import { post as post008 } from "@/content/posts/008-accessibility-basics";
import { post as post009 } from "@/content/posts/009-docker-dev-setup";
import { post as post010 } from "@/content/posts/010-tailwind-vs-css";
import { post as post011 } from "@/content/posts/011-nodejs-streams";
import { post as post012 } from "@/content/posts/012-figma-to-code";
import { post as post013 } from "@/content/posts/013-sql-index-basics";

export type { BlogPost } from "./blog.types";

const allPosts = [
  post001,
  post002,
  post003,
  post004,
  post005,
  post006,
  post007,
  post008,
  post009,
  post010,
  post011,
  post012,
  post013,
];

/** 최신 글 먼저 (날짜 내림차순) */
export const blogPosts: BlogPost[] = [...allPosts].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
);
