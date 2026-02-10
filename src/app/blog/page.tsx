'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWindow } from '@/contexts/WindowContext';
import { blogPosts } from '@/data/posts';

const ITEMS_PER_PAGE = 10;

export default function BlogPage() {
  const router = useRouter();
  const { setShowStartMenu } = useWindow();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return blogPosts;
    const query = searchQuery.toLowerCase();
    return blogPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE) || 1;

  const paginationPages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const include = new Set([
      1,
      totalPages,
      currentPage,
      currentPage - 1,
      currentPage - 2,
      currentPage + 1,
      currentPage + 2,
    ]);
    const sorted = Array.from(include)
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);
    const result: (number | 'ellipsis')[] = [];
    for (const p of sorted) {
      if (result.length && p > (result[result.length - 1] as number) + 1) {
        result.push('ellipsis');
      }
      result.push(p);
    }
    return result;
  }, [totalPages, currentPage]);

  const postsToShow = useMemo(() => {
    if (isMobile) {
      return filteredPosts.slice(0, visibleCount);
    }
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPosts.slice(start, start + ITEMS_PER_PAGE);
  }, [isMobile, currentPage, visibleCount, filteredPosts]);

  const hasMore = isMobile && visibleCount < filteredPosts.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredPosts.length));
  }, [filteredPosts.length]);

  useEffect(() => {
    setCurrentPage(1);
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchQuery]);

  useEffect(() => {
    if (!isMobile || !hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '100px', threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobile, hasMore, loadMore]);

  return (
    <main
      className="blog-main blog-main-full"
      onClick={() => setShowStartMenu(false)}
    >
      <div className="blog-container blog-list-screen">
        <header className="blog-masthead">
          <span className="blog-masthead-label">C:\\</span>
          <h1 className="blog-masthead-title">BLOG</h1>
          <span className="blog-masthead-sub">directory listing</span>
        </header>
        <div className="blog-search-wrapper">
          <span className="blog-search-prompt" aria-hidden>C:\BLOG&gt;</span>
          <input
            type="text"
            placeholder=" search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="blog-search-input"
          />
          <button type="button" className="blog-search-button">
            RUN
          </button>
        </div>

        <div className="blog-card-list">
          {postsToShow.map((post, idx) => (
            <article
              key={post.id}
              className="blog-card"
              onClick={() => router.push(`/blog/${post.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  router.push(`/blog/${post.id}`);
                }
              }}
            >
              <span className="blog-card-num" aria-hidden>
                {(isMobile ? idx : (currentPage - 1) * ITEMS_PER_PAGE + idx) + 1}
              </span>
              <div className="blog-card-thumbnail">
                {post.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="blog-card-thumbnail-img"
                  />
                ) : (
                  <div className="blog-card-thumbnail-placeholder">
                    <span>{post.title.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="blog-card-body">
                <h2 className="blog-card-title">{post.title}</h2>
                <time className="blog-card-date" dateTime={post.date}>
                  {post.date}
                </time>
                <p className="blog-card-excerpt">{post.excerpt}</p>
                <div className="blog-card-tags">
                  {post.tags.map((tag) => (
                    <span key={tag} className="blog-card-tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {!isMobile && totalPages > 1 && (
          <nav className="blog-pagination" aria-label="Pagination">
            <button
              type="button"
              className="blog-pagination-btn blog-pagination-prev-next"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              Previous
            </button>
            <div className="blog-pagination-numbers">
              {paginationPages.map((page, i) =>
                page === 'ellipsis' ? (
                  <span key={`ellipsis-${i}`} className="blog-pagination-ellipsis">
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    className={`blog-pagination-num ${currentPage === page ? 'blog-pagination-num-active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
            <button
              type="button"
              className="blog-pagination-btn blog-pagination-prev-next"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </nav>
        )}

        {isMobile && hasMore && <div ref={sentinelRef} className="blog-infinite-sentinel" />}

        {filteredPosts.length === 0 && (
          <div className="blog-empty">No posts found.</div>
        )}
      </div>
    </main>
  );
}
