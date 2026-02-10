import type { BlogPost } from '@/data/blog.types';

export const post: BlogPost = {
  id: '007',
  title: 'GIT_WORKFLOW.TXT',
  date: '2026.02.02',
  excerpt: 'Git 브랜치 전략과 커밋 컨벤션 정리',
  tags: ['GIT', 'WORKFLOW', 'DEV'],
  content: `# Git 워크플로우

## 브랜치 전략

- main: 배포용
- develop: 개발 통합
- feature/*: 기능 개발

feat:, fix:, docs: 접두사로 의도를 명확히.

> SYSTEM: POST_END
`,
};
