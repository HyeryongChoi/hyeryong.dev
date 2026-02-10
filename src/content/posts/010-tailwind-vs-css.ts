import type { BlogPost } from '@/data/blog.types';

export const post: BlogPost = {
  id: '010',
  title: 'TAILWIND_VS_CSS.MD',
  date: '2026.01.30',
  excerpt: 'Tailwind CSS와 순수 CSS, 언제 무엇을 쓸지',
  tags: ['TAILWIND', 'CSS', 'OPINION'],
  content: `# Tailwind vs 순수 CSS

## Tailwind 장점

유틸리티 클래스로 빠른 스타일링, 일관된 디자인 시스템.

## 순수 CSS가 나은 경우

복잡한 애니메이션, 테마 변수, 재사용 컴포넌트 스타일.

> SYSTEM: POST_END
`,
};
