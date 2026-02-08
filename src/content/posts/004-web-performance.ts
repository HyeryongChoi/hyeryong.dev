import type { BlogPost } from '@/data/blog.types';

export const post: BlogPost = {
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
`,
};
