'use client';

import { useEffect, useState } from 'react';

const SEGMENTS = 12;

interface LoadingSpinnerProps {
  /** 다이얼로그로 표시할지, 인라인 스피너만 표시할지 */
  asDialog?: boolean;
  /** 다이얼로그일 때 닫기 콜백 (X 버튼) */
  onClose?: () => void;
  /** 표시 텍스트 */
  label?: string;
  /** Done/Cancel 버튼 표시 여부 */
  showButtons?: boolean;
  onDone?: () => void;
  onCancel?: () => void;
}

export default function LoadingSpinner({
  asDialog = true,
  onClose,
  label = 'Loading...',
  showButtons = false,
  onDone,
  onCancel,
}: LoadingSpinnerProps) {
  /** 왼쪽부터 채워지는 개수 (0 → SEGMENTS → 0 반복, 오른쪽 방향 진행) */
  const [fillCount, setFillCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setFillCount((prev) => (prev >= SEGMENTS ? 0 : prev + 1));
    }, 100);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!asDialog || !onClose) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [asDialog, onClose]);

  const content = (
    <>
      <p className="loading-spinner-label">{label}</p>
      <div className="loading-spinner-track" role="progressbar" aria-valuetext={label}>
        <div className="loading-spinner-segments">
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <div
              key={i}
              className={`loading-spinner-segment ${i < fillCount ? 'filled' : ''}`}
            />
          ))}
        </div>
      </div>
      {showButtons && (
        <div className="loading-spinner-buttons">
          <button type="button" className="loading-spinner-btn" onClick={onDone}>
            Done
          </button>
          <button type="button" className="loading-spinner-btn" onClick={onCancel ?? onClose}>
            Cancel
          </button>
        </div>
      )}
    </>
  );

  if (asDialog) {
    return (
      <>
        <div
          className="loading-spinner-overlay"
          onClick={() => onClose?.()}
          role="presentation"
        />
        <div className="loading-spinner-dialog">
          <div className="loading-spinner-title-bar">
            <span className="loading-spinner-title-text">{label}</span>
            <button
              type="button"
              className="loading-spinner-close"
              onClick={() => onClose?.()}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="loading-spinner-body">{content}</div>
        </div>
      </>
    );
  }

  return <div className="loading-spinner-inline">{content}</div>;
}
