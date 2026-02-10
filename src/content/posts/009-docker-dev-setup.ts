import type { BlogPost } from '@/data/blog.types';

export const post: BlogPost = {
  id: '009',
  title: 'DOCKER_DEV_SETUP.LOG',
  date: '2026.01.31',
  excerpt: '로컬 개발 환경을 Docker로 통일하기',
  tags: ['DOCKER', 'DEV', 'ENV'],
  content: `# Docker 개발 환경

## docker-compose로 한 번에

DB, Redis, 앱을 하나의 compose 파일로 띄우면 팀 전체가 동일한 환경을 쓰게 됩니다.

## 볼륨 마운트

소스 코드를 마운트해 변경 사항이 바로 반영되게 하세요.

> SYSTEM: POST_END
`,
};
