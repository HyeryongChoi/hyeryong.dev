export interface BlogPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  tags: string[];
  thumbnail?: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: '001',
    title: 'RETRO_COMPUTING.MD',
    date: '2026.02.08',
    excerpt: '레트로 컴퓨팅의 매력과 웹 디자인에 적용하기',
    tags: ['DESIGN', 'RETRO', 'CSS'],
    content: `# 레트로 컴퓨팅의 매력

## 서론

1980-90년대 컴퓨터의 UI/UX는 지금 보면 투박하지만,
그 시대만의 독특한 매력이 있습니다.

## CRT 모니터의 특징

- 스캔라인 효과
- 글로우 효과
- 모노크롬 또는 제한된 컬러 팔레트
- 픽셀 폰트

## 웹에 적용하기

CSS를 활용하면 이런 레트로한 느낌을 쉽게 재현할 수 있습니다.

\`\`\`css
.crt-screen::before {
  content: '';
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15) 0px,
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
}
\`\`\`

## 결론

레트로 디자인은 단순한 향수를 넘어,
미니멀하고 집중력을 높이는 UI를 제공합니다.

> SYSTEM: POST_END
`
  },
  {
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
`
  },
  {
    id: '003',
    title: 'TYPESCRIPT_TIPS.LOG',
    date: '2026.02.06',
    excerpt: 'TypeScript 실전 팁과 트릭 모음',
    tags: ['TYPESCRIPT', 'JAVASCRIPT', 'TIP'],
    content: `# TypeScript 실전 팁

## 유틸리티 타입 활용하기

TypeScript는 다양한 유틸리티 타입을 제공합니다.

### Partial과 Required

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

type PartialUser = Partial<User>;
// 모든 속성이 optional

type RequiredUser = Required<User>;
// 모든 속성이 required
\`\`\`

### Pick과 Omit

\`\`\`typescript
type UserPreview = Pick<User, 'id' | 'name'>;
// id와 name만 선택

type UserWithoutEmail = Omit<User, 'email'>;
// email 제외
\`\`\`

## 타입 가드 만들기

\`\`\`typescript
function isString(value: unknown): value is string {
  return typeof value === 'string';
}
\`\`\`

## 제네릭 활용

제네릭을 사용하면 재사용 가능한 컴포넌트를 만들 수 있습니다.

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg;
}
\`\`\`

## 결론

TypeScript를 제대로 활용하면
코드의 안정성과 생산성이 크게 향상됩니다.

> SYSTEM: POST_END
`
  },
  {
    id: '004',
    title: 'WEB_PERFORMANCE.DAT',
    date: '2026.02.05',
    excerpt: '웹 성능 최적화를 위한 실전 가이드',
    tags: ['PERFORMANCE', 'WEB', 'OPTIMIZATION'],
    content: `# 웹 성능 최적화 가이드

## 성능이 중요한 이유

사용자는 빠른 웹사이트를 선호합니다.
페이지 로딩이 1초 늦어질 때마다 전환율이 7% 감소합니다.

## 최적화 전략

### 1. 이미지 최적화

- WebP 포맷 사용
- 적절한 크기로 리사이징
- Lazy loading 적용

### 2. 코드 스플리팅

\`\`\`typescript
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('./Heavy'));
\`\`\`

### 3. 캐싱 전략

- HTTP 캐싱
- Service Worker
- CDN 활용

### 4. 번들 크기 줄이기

- Tree shaking
- 사용하지 않는 코드 제거
- 의존성 최소화

## 측정 도구

- Lighthouse
- WebPageTest
- Chrome DevTools

## 결론

성능 최적화는 지속적인 과정입니다.
정기적으로 측정하고 개선해야 합니다.

> SYSTEM: POST_END
`
  },
];
