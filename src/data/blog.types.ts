export interface BlogPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  tags: string[];
  thumbnail?: string;
  /** i18n: locale별 오버라이드 */
  titleKo?: string;
  titleEn?: string;
  excerptKo?: string;
  excerptEn?: string;
  contentKo?: string;
  contentEn?: string;
  tagsKo?: string[];
  tagsEn?: string[];
}

export type Locale = 'ko' | 'en';

/** 마크다운 콘텐츠에서 첫 번째 이미지 URL 추출 (![alt](url)) */
export function getFirstImageFromContent(content: string): string | undefined {
  const match = content.match(/!\[[^\]]*\]\(([^)]+)\)/);
  return match?.[1];
}

export function getLocalizedPost(post: BlogPost, locale: Locale) {
  const content =
    locale === 'ko' ? (post.contentKo ?? post.content) : (post.contentEn ?? post.content);
  const thumbnail =
    post.thumbnail ??
    getFirstImageFromContent(post.content) ??
    getFirstImageFromContent(content);
  return {
    ...post,
    title: locale === 'ko' ? (post.titleKo ?? post.title) : (post.titleEn ?? post.title),
    excerpt: locale === 'ko' ? (post.excerptKo ?? post.excerpt) : (post.excerptEn ?? post.excerpt),
    content,
    tags: locale === 'ko' ? (post.tagsKo ?? post.tags) : (post.tagsEn ?? post.tags),
    thumbnail,
  };
}
