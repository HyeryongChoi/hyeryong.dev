"use client";

import { useId } from "react";

interface ToolbarButtonProps {
  icon: string;
  label: string;
  /** 마우스를 올리거나 키보드로 포커스하면 보이는 설명 */
  tooltip: string;
  onClick?: () => void;
  /** 있으면 새 탭으로 여는 링크로 그린다 */
  href?: string;
  disabled?: boolean;
}

/** 레트로 툴바 버튼 + Win98 스타일 툴팁 */
export default function ToolbarButton({ icon, label, tooltip, onClick, href, disabled }: ToolbarButtonProps) {
  const tipId = useId();
  const content = (
    <>
      <span aria-hidden>{icon}</span>
      <span className="editor-tool-label">{label}</span>
      <span id={tipId} role="tooltip" className="editor-tool-tip">
        {tooltip}
      </span>
    </>
  );

  if (href) {
    return (
      <a className="toolbar-button editor-tool" href={href} target="_blank" rel="noreferrer" aria-describedby={tipId}>
        {content}
      </a>
    );
  }
  return (
    <button
      type="button"
      className="toolbar-button editor-tool"
      disabled={disabled}
      onClick={onClick}
      aria-describedby={tipId}
    >
      {content}
    </button>
  );
}
