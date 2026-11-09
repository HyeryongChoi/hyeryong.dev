"use client";

import MarkdownRenderer from "@/components/MarkdownRenderer/MarkdownRenderer";
import { parseTags, previewMarkdown, type EditorImage, type LocaleFields } from "@/lib/editor-doc";

interface EditorPreviewProps {
  fields: LocaleFields;
  date: string;
  images: EditorImage[];
  /** EN 탭인데 영어가 비어 있어 한국어로 대체해 보여주는 중 */
  fallbackNotice?: boolean;
}

/** 블로그 글 상세 화면과 같은 마크업·렌더러로 그린 미리보기 */
export default function EditorPreview({ fields, date, images, fallbackNotice }: EditorPreviewProps) {
  const tags = parseTags(fields.tags);

  return (
    <div className="editor-preview blog-article-body" data-testid="editor-preview">
      {fallbackNotice && (
        <div className="editor-preview-notice" role="note">
          영어 버전 없음 (한국어로 대체됨)
        </div>
      )}
      <div className="blog-article-pane-header">
        <h1 className="blog-article-pane-title">{fields.title || "(제목 없음)"}</h1>
        <div className="blog-article-color-line" aria-hidden />
        <div className="blog-article-meta">
          <time dateTime={date}>{date}</time>
          <div className="blog-card-tags">
            {tags.map((tag) => (
              <span key={tag} className="blog-card-tag">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="blog-article-content blog-article-content-inner">
        <MarkdownRenderer content={previewMarkdown(fields.body, images)} />
      </div>
    </div>
  );
}
