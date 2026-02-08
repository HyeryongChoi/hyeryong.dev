'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWindow } from '@/contexts/WindowContext';
import { blogPosts } from '@/data/posts';

export default function BlogPage() {
  const router = useRouter();
  const { setShowStartMenu } = useWindow();
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <main
      className="blog-main blog-main-full"
      onClick={() => setShowStartMenu(false)}
    >
        <div className="blog-container">
          {/* 검색창 */}
          <div className="blog-search-wrapper">
            <input
              type="text"
              placeholder="Search posts by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="blog-search-input"
            />
            <button type="button" className="blog-search-button">
              Search
            </button>
          </div>

          {/* 카드 목록 - 1열 배치 */}
          <div className="blog-card-list">
            {filteredPosts.map((post) => (
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

          {filteredPosts.length === 0 && (
            <div className="blog-empty">No posts found.</div>
          )}
        </div>
    </main>
  );
}
