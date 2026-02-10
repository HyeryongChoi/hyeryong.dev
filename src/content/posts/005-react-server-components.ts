import type { BlogPost } from '@/data/blog.types';

export const post: BlogPost = {
  id: '005',
  title: 'REACT_SERVER_COMPONENTS.MD',
  date: '2026.02.04',
  excerpt: 'React Server Components 개념과 Next.js에서의 활용',
  tags: ['REACT', 'NEXTJS', 'RSC'],
  content: `# React Server Components

서버 컴포넌트는 번들 크기를 줄이고 초기 로딩을 빠르게 합니다.

## 장점

- 클라이언트 번들에 포함되지 않음
- 서버에서 직접 DB/API 호출 가능

> SYSTEM: POST_END
`,
};
