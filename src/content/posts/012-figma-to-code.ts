import type { BlogPost } from '@/data/blog.types';

export const post: BlogPost = {
  id: '012',
  title: 'FIGMA_TO_CODE.MD',
  date: '2026.01.28',
  excerpt: 'Figma 디자인을 코드로 옮기는 팁',
  tags: ['FIGMA', 'DESIGN', 'FRONTEND'],
  content: `# Figma에서 코드로

## 디자인 토큰 추출

색상, 간격, 폰트를 변수로 정의해 일관성을 유지하세요.

## 컴포넌트 구조 맞추기

Frame 계층을 컴포넌트 트리와 1:1로 맞추면 유지보수가 쉬워집니다.

> SYSTEM: POST_END
`,
};
