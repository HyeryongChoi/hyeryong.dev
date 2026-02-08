'use client';

import { blogPosts } from '@/data/posts';
import { useRouter, useParams } from 'next/navigation';
import { useMemo } from 'react';

export default function BlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const post = useMemo(() => {
    return blogPosts.find(p => p.id === id);
  }, [id]);

  const currentIndex = blogPosts.findIndex(p => p.id === id);

  if (!post) {
    return (
      <div className="pc-screen min-h-screen flex items-center justify-center">
        <div className="win95-window p-8 text-center">
          <div className="text-3xl text-red-500 mb-4">오류</div>
          <div className="text-xl mb-6">게시글을 찾을 수 없습니다</div>
          <button
            onClick={() => router.push('/blog')}
            className="win95-button"
            type="button"
          >
            목록으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pc-screen min-h-screen flex">
      {/* 왼쪽 사이드바 */}
      <aside className="w-24 bg-[#C0C0C0] border-r-2 border-[#808080] p-2">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => router.push('/')}
            className="sidebar-button"
            type="button"
          >
            <div className="text-3xl">🏠</div>
            <div className="text-sm">홈</div>
          </button>
          <button
            onClick={() => router.push('/about')}
            className="sidebar-button"
            type="button"
          >
            <div className="text-3xl">👤</div>
            <div className="text-sm">소개</div>
          </button>
          <button
            onClick={() => router.push('/blog')}
            className="sidebar-button bg-[#d4d0c8]"
            type="button"
          >
            <div className="text-3xl">📝</div>
            <div className="text-sm">블로그</div>
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col">
        {/* 타이틀바 */}
        <div className="win95-title-bar">
          <span className="text-xl">HYERYONG.DEV - {post.title}</span>
          <div className="flex gap-1">
            <button className="px-2 bg-[#C0C0C0] text-black border border-white">_</button>
            <button className="px-2 bg-[#C0C0C0] text-black border border-white">□</button>
            <button className="px-2 bg-[#C0C0C0] text-black border border-white">✕</button>
          </div>
        </div>

        {/* 메뉴바 */}
        <div className="menu-bar">
          <span className="menu-item" onClick={() => router.push('/blog')}>← 목록</span>
          <span className="menu-item">파일(F)</span>
          <span className="menu-item">편집(E)</span>
          <span className="menu-item">보기(V)</span>
        </div>

        {/* 본문 영역 */}
        <div className="flex-1 p-8 overflow-auto">
          {/* 게시글 헤더 */}
          <div className="pc-box-double mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-sm text-gray-300 mb-2">[{post.id}]</div>
                <div className="text-3xl text-yellow-300 mb-3">{post.title}</div>
                <div className="text-lg text-cyan-300">작성일: {post.date}</div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-[#0000AA] text-white border border-white text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* 게시글 내용 */}
          <div className="pc-box">
            <div className="text-xl text-white leading-relaxed whitespace-pre-wrap">
              {post.content.split('\n').map((line, index) => {
                // 헤딩 처리
                if (line.startsWith('# ')) {
                  return (
                    <div key={index} className="text-3xl text-yellow-300 font-bold my-6 border-b-2 border-white pb-2">
                      {line.slice(2)}
                    </div>
                  );
                }
                if (line.startsWith('## ')) {
                  return (
                    <div key={index} className="text-2xl text-cyan-300 font-bold my-5">
                      ▶ {line.slice(3)}
                    </div>
                  );
                }
                if (line.startsWith('### ')) {
                  return (
                    <div key={index} className="text-xl text-cyan-200 font-bold my-4">
                      • {line.slice(4)}
                    </div>
                  );
                }
                
                // 코드 블록 시작/끝
                if (line.startsWith('```')) {
                  return <div key={index} className="h-0"></div>;
                }
                
                // 리스트
                if (line.startsWith('- ')) {
                  return (
                    <div key={index} className="ml-6 my-2">
                      <span className="text-yellow-300">▸</span> {line.slice(2)}
                    </div>
                  );
                }
                
                // 인용구
                if (line.startsWith('> ')) {
                  return (
                    <div key={index} className="border-l-4 border-cyan-300 pl-4 my-4 text-cyan-200 italic">
                      {line.slice(2)}
                    </div>
                  );
                }
                
                // 빈 줄
                if (line.trim() === '') {
                  return <div key={index} className="h-4"></div>;
                }
                
                // 일반 텍스트
                return (
                  <div key={index} className="my-2">
                    {line}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 네비게이션 버튼 */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => {
                if (currentIndex < blogPosts.length - 1) {
                  router.push(`/blog/${blogPosts[currentIndex + 1].id}`);
                }
              }}
              disabled={currentIndex >= blogPosts.length - 1}
              className="win95-button disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              ← 이전 글
            </button>

            <button
              onClick={() => router.push('/blog')}
              className="win95-button"
              type="button"
            >
              목록으로
            </button>

            <button
              onClick={() => {
                if (currentIndex > 0) {
                  router.push(`/blog/${blogPosts[currentIndex - 1].id}`);
                }
              }}
              disabled={currentIndex <= 0}
              className="win95-button disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              다음 글 →
            </button>
          </div>
        </div>

        {/* 상태바 */}
        <div className="status-bar">
          <span>게시글 보기 - {post.title}</span>
          <span>HYERYONG.DEV | 2026</span>
        </div>
      </main>
    </div>
  );
}
