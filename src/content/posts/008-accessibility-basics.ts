import type { BlogPost } from '@/data/blog.types';

export const post: BlogPost = {
  id: '008',
  title: 'ACCESSIBILITY_BASICS.MD',
  date: '2026.02.01',
  excerpt: '웹 접근성, 시맨틱 HTML과 키보드 네비게이션',
  tags: ['A11Y', 'HTML', 'UX'],
  content: `# 웹 접근성 기초

## 시맨틱 HTML

\`<nav>\`, \`<main>\`, \`<article>\` 등 의미 있는 태그 사용.

## 키보드만으로 조작

tabIndex, focus 스타일, 포커스 순서를 고려하세요.

> SYSTEM: POST_END
`,
};
