"use client";

import { signIn } from "next-auth/react";

interface EditorLoginProps {
  /** next-auth가 붙여주는 ?error= 값 (허용되지 않은 계정이면 AccessDenied) */
  error?: string;
}

export default function EditorLogin({ error }: EditorLoginProps) {
  const denied = error === "AccessDenied";

  return (
    <main className="blog-main blog-main-full editor-login-page">
      <div className="alert-window editor-dialog" role="dialog" aria-labelledby="editor-login-title">
        <div className="win95-title-bar">
          <span id="editor-login-title">Blog Editor - Log On</span>
        </div>
        <div className="editor-dialog-body">
          <div className="editor-dialog-icon" aria-hidden>
            {denied ? "⛔" : "🔑"}
          </div>
          <div>
            {denied ? (
              <>
                <p className="editor-dialog-strong">권한 없음</p>
                <p>이 에디터는 블로그 주인 계정으로만 쓸 수 있어요.</p>
              </>
            ) : (
              <>
                <p className="editor-dialog-strong">로그인이 필요해요</p>
                <p>블로그 주인 GitHub 계정으로 로그인하면 글을 쓸 수 있어요.</p>
              </>
            )}
            {error && !denied && <p className="editor-error">로그인 중 문제가 생겼어요. ({error})</p>}
          </div>
        </div>
        <div className="editor-dialog-actions">
          <button
            type="button"
            className="editor-button editor-button-primary"
            onClick={() => signIn("github", { callbackUrl: "/editor" })}
          >
            GitHub로 로그인
          </button>
        </div>
      </div>
    </main>
  );
}
