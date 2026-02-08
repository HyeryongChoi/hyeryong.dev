import type { BlogPost } from '@/data/blog.types';

export const post: BlogPost = {
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
`,
};
