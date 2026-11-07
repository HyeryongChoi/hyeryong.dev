"use client";

import { useEffect, useState } from "react";
import type { PostSummary } from "@/lib/editor-api-types";
import EditorDialog from "./EditorDialog";
import { editorApi } from "./editor-api";

interface OpenPostDialogProps {
  onOpen: (id: string) => void;
  onCancel: () => void;
}

/** GitHub main 기준 글 목록에서 수정할 글을 고른다. */
export default function OpenPostDialog({ onOpen, onCancel }: OpenPostDialogProps) {
  const [posts, setPosts] = useState<PostSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    editorApi
      .listPosts()
      .then((res) => alive && setPosts(res.posts))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <EditorDialog
      title="Open - 글 열기"
      wide
      testId="open-dialog"
      actions={
        <>
          <button
            type="button"
            className="editor-button editor-button-primary"
            disabled={!selected}
            onClick={() => selected && onOpen(selected)}
          >
            열기
          </button>
          <button type="button" className="editor-button" onClick={onCancel}>
            취소
          </button>
        </>
      }
    >
      {error && <p className="editor-error">글 목록을 불러오지 못했어요: {error}</p>}
      {!error && !posts && <p>GitHub에서 글 목록을 불러오는 중…</p>}
      {posts && (
        <div className="editor-post-list-wrap">
          <table className="editor-post-list">
            <thead>
              <tr>
                <th>ID</th>
                <th>제목</th>
                <th>날짜</th>
                <th>EN</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr
                  key={p.id}
                  aria-selected={selected === p.id}
                  onClick={() => setSelected(p.id)}
                  onDoubleClick={() => onOpen(p.id)}
                >
                  <td>{p.id}</td>
                  <td>{p.title}</td>
                  <td>{p.date}</td>
                  <td>{p.hasEn ? "✓" : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </EditorDialog>
  );
}
