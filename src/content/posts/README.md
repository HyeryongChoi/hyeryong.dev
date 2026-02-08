# 블로그 포스트 작성 가이드

## 새 포스트 추가 방법

### 1. 포스트 파일 생성
`src/content/posts/` 폴더에 새 파일 생성 (예: `005-my-post.ts`)

### 2. 포스트 내용 작성
`_template.ts`를 참고하여 작성:

```ts
import type { BlogPost } from '@/data/blog.types';

export const post: BlogPost = {
  id: '005',
  title: '포스트_제목',
  date: '2026.02.04',
  excerpt: '목록에 표시될 짧은 설명',
  tags: ['TAG1', 'TAG2'],
  thumbnail: '/images/thumbnail.jpg', // 선택
  content: `# 마크다운 본문...`,
};
```

### 3. posts.ts에 등록
`src/data/posts.ts`에서:
1. import 추가: `import { post as post005 } from '@/content/posts/005-my-post';`
2. allPosts 배열에 추가: `post005`
