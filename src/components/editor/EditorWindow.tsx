"use client";

import type { ReactNode } from "react";
import { signOut } from "next-auth/react";

interface EditorWindowProps {
  title: string;
  login: string;
  toolbar?: ReactNode;
  status?: ReactNode;
  children?: ReactNode;
}

/** 레트로 Windows 스타일의 에디터 창 틀 (제목 표시줄 · 툴바 · 본문 · 상태바) */
export default function EditorWindow({ title, login, toolbar, status, children }: EditorWindowProps) {
  return (
    <main className="blog-main blog-main-full blog-article-page editor-page">
      <div className="blog-container editor-container">
        <div className="blog-article-window editor-window">
          <div className="win95-title-bar">
            <span className="editor-title-text">{title} - Blog Editor</span>
            <div className="editor-title-right">
              <span className="editor-login" data-testid="editor-login">
                👤 {login}
              </span>
              <button
                type="button"
                className="editor-signout"
                onClick={() => signOut({ callbackUrl: "/editor" })}
              >
                Log off
              </button>
            </div>
          </div>
          <div className="explorer-toolbar editor-toolbar">{toolbar}</div>
          <div className="editor-body">{children}</div>
          <div className="explorer-status-bar">{status}</div>
        </div>
      </div>
    </main>
  );
}
