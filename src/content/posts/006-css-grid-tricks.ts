import type { BlogPost } from '@/data/blog.types';

export const post: BlogPost = {
  id: '006',
  title: 'CSS_GRID_TRICKS.LOG',
  date: '2026.02.03',
  excerpt: 'CSS Grid로 레이아웃 잡는 실전 팁',
  tags: ['CSS', 'GRID', 'LAYOUT'],
  content: `# CSS Grid 실전 트릭

\`\`\`css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
\`\`\`

반응형 그리드가 한 줄로 해결됩니다.

> SYSTEM: POST_END
`,
};
