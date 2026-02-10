import type { BlogPost } from '@/data/blog.types';

export const post: BlogPost = {
  id: '013',
  title: 'SQL_INDEX_BASICS.LOG',
  date: '2026.01.27',
  excerpt: '인덱스가 쿼리 성능에 미치는 영향',
  tags: ['SQL', 'DATABASE', 'PERFORMANCE'],
  content: `# SQL 인덱스 기초

## 언제 인덱스를 걸까

WHERE, JOIN, ORDER BY에 자주 쓰이는 컬럼에 인덱스를 고려합니다.

## 주의점

인덱스는 쓰기 비용을 올립니다. 과하면 오히려 느려질 수 있어요.

> SYSTEM: POST_END
`,
};
