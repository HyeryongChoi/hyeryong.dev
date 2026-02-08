import type { BlogPost } from '@/data/blog.types';

export const post: BlogPost = {
  id: '002',
  title: 'NEXTJS_15.TXT',
  date: '2026.02.07',
  excerpt: 'Next.js 15의 새로운 기능과 성능 개선 사항',
  tags: ['NEXT.JS', 'REACT', 'WEB'],
  content: `# Next.js 15 업데이트

## 주요 변경사항

Next.js 15가 출시되면서 많은 개선이 이루어졌습니다.

### 1. Turbopack의 안정화

개발 환경에서 Turbopack을 기본으로 사용할 수 있게 되었습니다.
빌드 속도가 크게 개선되었습니다.

### 2. React 19 지원

최신 React 19의 기능들을 완벽하게 지원합니다:

- Server Actions
- Use Hook
- 개선된 Suspense

### 3. 부분 사전 렌더링

Static과 Dynamic 렌더링을 페이지 단위가 아닌
컴포넌트 단위로 분리할 수 있게 되었습니다.

## 성능 개선

\`\`\`typescript
// app/page.tsx
export default async function Page() {
  const data = await fetch('...');
  return <div>{data}</div>;
}
\`\`\`

## 마이그레이션 팁

기존 프로젝트를 업그레이드할 때는
단계적으로 진행하는 것이 좋습니다.

> SYSTEM: POST_END
`,
};
