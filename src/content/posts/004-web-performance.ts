import type { BlogPost } from '@/data/blog.types';

export const post: BlogPost = {
  id: '004',
  title: 'WEB_PERFORMANCE.MD',
  date: '2026.02.05',
  excerpt: '웹 성능 최적화, LCP와 Core Web Vitals',
  tags: ['PERFORMANCE', 'WEB', 'LCP'],
  content: `# 웹 성능 최적화

## Core Web Vitals

LCP, FID, CLS를 측정하고 개선하는 것이 사용자 경험에 직결됩니다.

## 이미지 최적화

\`\`\`html
<img src="photo.jpg" loading="lazy" decoding="async" />
\`\`\`

> SYSTEM: POST_END
`,
};
