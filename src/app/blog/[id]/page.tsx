"use client";

import { blogPosts } from "@/data/posts";
import { useRouter, useParams } from "next/navigation";
import { useMemo } from "react";
import { useWindow } from "@/contexts/WindowContext";
import MarkdownRenderer from "@/components/MarkdownRenderer/MarkdownRenderer";

export default function BlogPostPage() {
  const router = useRouter();
  const { setShowStartMenu } = useWindow();
  const params = useParams();
  const id = params.id as string;

  const post = useMemo(() => {
    return blogPosts.find((p) => p.id === id);
  }, [id]);

  const currentIndex = blogPosts.findIndex((p) => p.id === id);
  const prevPost =
    currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;

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
        {/* 게시글 헤더 */}
        <header className="blog-article-box" style={{ padding: "16px" }}>
          <h1 className="blog-card-title" style={{ marginBottom: "8px" }}>
            {post.title}
          </h1>
          <time className="blog-card-date" dateTime={post.date}>
            {post.date}
          </time>
          <div className="blog-card-tags" style={{ marginTop: "8px" }}>
            {post.tags.map((tag) => (
              <span key={tag} className="blog-card-tag">
                #{tag}
              </span>
            ))}
          </div>
        </header>

        {/* 게시글 내용 */}
        <div
          className="blog-article-content blog-article-box"
          style={{
            padding: "24px",
          }}
        >
          <MarkdownRenderer content={post.content} />
        </div>

        {/* Previous / Next / Back to list navigation */}
        <nav className="blog-article-nav">
          <button
            onClick={() => prevPost && router.push(`/blog/${prevPost.id}`)}
            disabled={!prevPost}
            className="blog-article-nav-btn"
            type="button"
          >
            <span className="blog-article-nav-label">Previous</span>
            {prevPost ? prevPost.title : "—"}
          </button>
          <button
            onClick={() => router.push("/blog")}
            className="blog-article-nav-btn blog-article-nav-btn-center"
            type="button"
          >
            <span className="blog-article-nav-label">Back to list</span>
          </button>
          <button
            onClick={() => nextPost && router.push(`/blog/${nextPost.id}`)}
            disabled={!nextPost}
            className="blog-article-nav-btn"
            type="button"
          >
            <span className="blog-article-nav-label">Next</span>
            {nextPost ? nextPost.title : "—"}
          </button>
        </nav>
      </div>
    </main>
  );
}
