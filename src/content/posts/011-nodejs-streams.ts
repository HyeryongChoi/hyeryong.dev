import type { BlogPost } from '@/data/blog.types';

export const post: BlogPost = {
  id: '011',
  title: 'NODEJS_STREAMS.TXT',
  date: '2026.01.29',
  excerpt: 'Node.js 스트림 API로 대용량 데이터 다루기',
  tags: ['NODEJS', 'STREAMS', 'BACKEND'],
  content: `# Node.js 스트림

## Readable, Writable, Transform

메모리에 전부 올리지 않고 청크 단위로 처리할 수 있습니다.

## pipe()

\`readable.pipe(writable)\` 로 파이프라인을 간단히 구성.

> SYSTEM: POST_END
`,
};
