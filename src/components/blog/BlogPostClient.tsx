"use client";

import { getLocalizedPost, type BlogPost } from "@/data/blog.types";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useWindow } from "@/contexts/WindowContext";
import { useLanguage } from "@/contexts/LanguageContext";
import MarkdownRenderer from "@/components/MarkdownRenderer/MarkdownRenderer";

interface BlogPostClientProps {
  /** 없는 id면 null */
  post: BlogPost | null;
  /** 목록(최신순)에서 바로 앞 글 id */
  previousId: string | null;
  /** 목록(최신순)에서 바로 뒤 글 id */
  nextId: string | null;
  /** 목록에서의 위치 (0부터) */
  currentIndex: number;
  totalCount: number;
}

export default function BlogPostClient({
  post: rawPost,
  previousId,
  nextId,
  currentIndex,
  totalCount,
}: BlogPostClientProps) {
  const router = useRouter();
  const { locale } = useLanguage();
  const { setShowStartMenu } = useWindow();

  const post = useMemo(
    () => (rawPost ? getLocalizedPost(rawPost, locale) : null),
    [rawPost, locale],
  );

  const previousPost = previousId ? { id: previousId } : null;
  const nextPost = nextId ? { id: nextId } : null;

  if (!post) {
    return (
      <main
        className="blog-main blog-main-full"
        onClick={() => setShowStartMenu(false)}
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <div className="blog-container">
          <div style={{ textAlign: "center", padding: "48px" }}>
            <div
              style={{ fontSize: "24px", color: "#c00", marginBottom: "16px" }}
            >
              Error
            </div>
            <div style={{ fontSize: "16px", marginBottom: "24px" }}>
              Post not found.
            </div>
            <button
              onClick={() => router.push("/blog")}
              className="blog-article-nav-btn"
              type="button"
            >
              Back to list
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="blog-main blog-main-full blog-article-page"
      onClick={() => setShowStartMenu(false)}
    >
      <div className="blog-container">
        {/* Win98 탐색기 스타일 창 */}
        <div className="blog-article-window">
          {/* 타이틀바 */}
          <div className="win95-title-bar">
            <span style={{ fontSize: "11px", userSelect: "none" }}>
              {post.title} (C:)
            </span>
            <div className="title-bar-buttons">
              <button className="title-bar-button" type="button">
                _
              </button>
              <button className="title-bar-button" type="button">
                □
              </button>
              <button className="title-bar-button" type="button">
                ✕
              </button>
            </div>
          </div>

          {/* 메뉴바 */}
          <div className="explorer-menubar">
            <span>
              <u>F</u>ile
            </span>
            <span>
              <u>E</u>dit
            </span>
            <span>
              <u>V</u>iew
            </span>
            <span>
              <u>G</u>o
            </span>
            <span>
              F<u>a</u>vorites
            </span>
            <span>
              <u>H</u>elp
            </span>
          </div>

          {/* 툴바 */}
          <div className="explorer-toolbar">
            <button
              type="button"
              className="toolbar-button"
              onClick={() => previousPost && router.push(`/blog/${previousPost.id}`)}
              disabled={!previousPost}
              title="목록의 이전 글"
            >
              <span>←</span>
              <span>Back</span>
            </button>
            <button
              type="button"
              className="toolbar-button"
              onClick={() => nextPost && router.push(`/blog/${nextPost.id}`)}
              disabled={!nextPost}
              title="목록의 다음 글"
            >
              <span>→</span>
              <span>Forward</span>
            </button>
            <button
              type="button"
              className="toolbar-button"
              onClick={() => router.push("/blog")}
              title="Back to list"
            >
              <span>↑</span>
              <span>Up</span>
            </button>
            <div className="toolbar-separator" />
            <button type="button" className="toolbar-button">
              <span>✂</span>
              <span>Cut</span>
            </button>
            <button type="button" className="toolbar-button">
              <span>⎘</span>
              <span>Copy</span>
            </button>
            <button type="button" className="toolbar-button">
              <span>⎗</span>
              <span>Paste</span>
            </button>
            <div className="toolbar-separator" />
            <button type="button" className="toolbar-button">
              <span>↶</span>
              <span>Undo</span>
            </button>
            <button type="button" className="toolbar-button">
              <span>×</span>
              <span>Delete</span>
            </button>
          </div>

          {/* 주소 표시줄 */}
          <div className="address-bar">
            <span className="address-bar-label">Address</span>
            <input
              type="text"
              className="address-bar-input"
              readOnly
              value={`C:\\blog\\${post.id}\\#${post.tags.join("\\#")}`}
            />
          </div>

          {/* 본문 영역 (흰 배경) */}
          <div className="blog-article-body">
            {/* 상단: 제목 + 컬러 라인 + 메타 */}
            <div className="blog-article-pane-header">
              <h1 className="blog-article-pane-title">{post.title}</h1>
              <div className="blog-article-color-line" aria-hidden />
              <div className="blog-article-meta">
                <time dateTime={post.date}>{post.date}</time>
                <div className="blog-card-tags">
                  {post.tags.map((tag) => (
                    <span key={tag} className="blog-card-tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {/* 본문 콘텐츠 */}
            <div className="blog-article-content blog-article-content-inner">
              <MarkdownRenderer content={post.content} />
            </div>
          </div>

          {/* 상태바 */}
          <div className="explorer-status-bar">
            <div className="status-section" style={{ flex: 1 }}>
              Track {currentIndex + 1} of {totalCount}: {post.title}
            </div>
            <div className="status-section">HYERYONG.DEV</div>
          </div>
        </div>
      </div>
    </main>
  );
}
