import type { BlogPost } from '@/data/blog.types';

/**
 * 새 포스트 작성 가이드
 * 1. 이 파일을 복사하여 005-슬러그.ts 형태로 저장
 * 2. 아래 post 객체 내용 수정
 * 3. src/data/posts.ts 에 import 및 allPosts 배열에 추가
 */
export const post: BlogPost = {
  id: '005',
  title: '포스트_제목.EXT',
  date: '2026.02.04',
  excerpt: '간단한 설명 (목록에 표시됨)',
  tags: ['TAG1', 'TAG2'],
  thumbnail: '/images/thumbnail.jpg', // 선택
  content: `# 제목

본문 마크다운 내용...

> SYSTEM: POST_END
`,
};
