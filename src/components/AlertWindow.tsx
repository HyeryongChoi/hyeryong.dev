"use client";

import { useWindow } from "@/contexts/WindowContext";

export function AlertWindow() {
  const { showAlert, setShowAlert, alertMessage } = useWindow();

  if (!showAlert) return null;

  return (
    <>
      {/* 오버레이 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.3)",
          zIndex: 10000,
        }}
        onClick={() => setShowAlert(false)}
      />

      {/* 알림창 */}
      <div
        className="alert-window"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "320px",
          zIndex: 10001,
        }}
      >
        {/* 타이틀바 */}
        <div className="win95-title-bar">
          <span style={{ fontSize: "11px", userSelect: "none" }}>Information</span>
          <div className="title-bar-buttons">
            <button
              className="title-bar-button"
              onClick={() => setShowAlert(false)}
            >
              ✕
            </button>
          </div>
        </div>

        {/* 내용 */}
        <div
          style={{
            background: "var(--win98-gray)",
            padding: "20px",
            display: "flex",
            gap: "16px",
            alignItems: "flex-start",
          }}
        >
          {/* 정보 아이콘 */}
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "var(--win98-blue)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "20px",
              fontWeight: "bold",
              flexShrink: 0,
            }}
          >
            i
          </div>

          {/* 메시지 */}
          <div
            style={{
              flex: 1,
              fontSize: "11px",
              color: "#000",
              paddingTop: "6px",
            }}
          >
            {alertMessage}
          </div>
        </div>

        {/* 버튼 영역 */}
        <div
          style={{
            background: "var(--win98-gray)",
            padding: "0 20px 16px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button
            className="alert-button"
            onClick={() => setShowAlert(false)}
            style={{
              width: "75px",
              height: "23px",
              background: "var(--win98-gray)",
              border: "2px solid",
              borderColor:
                "var(--win98-white) var(--win98-black) var(--win98-black) var(--win98-white)",
              fontSize: "11px",
              fontWeight: "bold",
              cursor: "pointer",
              outline: "none",
            }}
          >
            OK
          </button>
        </div>
      </div>
    </>
  );
}
