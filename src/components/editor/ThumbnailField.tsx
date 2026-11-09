"use client";
/* eslint-disable @next/next/no-img-element -- 아직 배포 전인 이미지를 blob: URL로 보여줘야 해서 next/image를 쓸 수 없다 */

interface ThumbnailFieldProps {
  /** 직접 지정한 썸네일 경로 (비어 있으면 자동) */
  value: string;
  /** 비워뒀을 때 블로그가 쓰는 이미지 */
  autoPath?: string;
  /** 경로 → 화면에 그릴 주소 */
  previewSrc: (path: string) => string;
  disabled?: boolean;
  onOpenPicker: () => void;
  onClear: () => void;
}

/** 썸네일 칸: 작은 미리보기 · 현재 값 · [선택…] · [✕] */
export default function ThumbnailField({ value, autoPath, previewSrc, disabled, onOpenPicker, onClear }: ThumbnailFieldProps) {
  const shown = value || autoPath;
  const label = value ? value : autoPath ? `자동: 본문 첫 이미지 (${autoPath})` : "자동: 본문에 이미지가 없어 썸네일 없음";

  return (
    <div className="editor-thumb-field" data-testid="thumbnail-field">
      <div className={`editor-thumb-mini${value ? "" : " editor-thumb-auto"}`} aria-hidden>
        {shown ? <img src={previewSrc(shown)} alt="" /> : <span>없음</span>}
      </div>
      <span className="editor-thumb-value" title={label} data-testid="thumbnail-value">
        {label}
      </span>
      <button type="button" className="editor-button editor-button-small" onClick={onOpenPicker} disabled={disabled}>
        선택…
      </button>
      {value && (
        <button
          type="button"
          className="editor-button editor-button-small"
          onClick={onClear}
          aria-label="썸네일 지정 해제 (본문 첫 이미지 사용)"
          title="지정 해제 (본문 첫 이미지 사용)"
        >
          ✕
        </button>
      )}
    </div>
  );
}
