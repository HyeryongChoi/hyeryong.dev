"use client";

import type { ReactNode } from "react";

interface EditorDialogProps {
  title: string;
  icon?: string;
  wide?: boolean;
  children: ReactNode;
  actions: ReactNode;
  testId?: string;
}

/** 레트로 Windows 스타일 모달 대화상자 */
export default function EditorDialog({ title, icon, wide, children, actions, testId }: EditorDialogProps) {
  return (
    <div className="editor-overlay">
      <div
        className={`alert-window editor-dialog${wide ? " editor-dialog-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-testid={testId}
      >
        <div className="win95-title-bar">
          <span style={{ fontSize: "11px" }}>{title}</span>
        </div>
        <div className="editor-dialog-body">
          {icon && (
            <div className="editor-dialog-icon" aria-hidden>
              {icon}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
        </div>
        <div className="editor-dialog-actions">{actions}</div>
      </div>
    </div>
  );
}
