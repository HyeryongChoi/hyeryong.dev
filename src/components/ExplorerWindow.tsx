"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useWindow } from "@/contexts/WindowContext";
import {
  Windows98MyDocuments2,
  WindowsShell32Icon3,
  Windows95TextFile,
  Windows98Modem,
} from "react-old-icons";

export function ExplorerWindow() {
  const router = useRouter();
  const {
    windowPosition,
    setWindowPosition,
    explorerZIndex,
    setShowExplorerWindow,
    bringToFront,
  } = useWindow();

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 클라이언트 마운트 감지
  useEffect(() => {
    setMounted(true);
  }, []);

  // 모바일 감지
  useEffect(() => {
    if (!mounted) return;
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mounted]);

  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return; // 모바일에서는 드래그 비활성화
    setIsDragging(true);
    const rect = (e.target as HTMLElement)
      .closest(".explorer-window")
      ?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleTitleBarTouchStart = (e: React.TouchEvent) => {
    if (isMobile) return; // 모바일에서는 드래그 비활성화
    const touch = e.touches[0];
    setIsDragging(true);
    const rect = (e.target as HTMLElement)
      .closest(".explorer-window")
      ?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    if (isMobile) return; // 모바일에서는 드래그 이벤트 리스너 추가 안 함

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setWindowPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        const touch = e.touches[0];
        setWindowPosition({
          x: touch.clientX - dragOffset.x,
          y: touch.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, dragOffset, setWindowPosition, isMobile]);

  const handleIconDoubleClick = (path: string) => {
    router.push(path);
  };

  return (
    <div
      className="explorer-window"
      onClick={() => bringToFront("explorer")}
      style={{
        '--window-top': windowPosition.y > 0 ? `${windowPosition.y}px` : '10%',
        '--window-left': windowPosition.x > 0 ? `${windowPosition.x}px` : '50%',
        '--window-transform': windowPosition.x > 0 ? 'none' : 'translateX(-50%)',
        cursor: isDragging ? "move" : "default",
        zIndex: explorerZIndex,
      } as React.CSSProperties}
    >
      {/* 타이틀바 */}
      <div
        className="win95-title-bar"
        onMouseDown={handleTitleBarMouseDown}
        onTouchStart={handleTitleBarTouchStart}
        style={{ cursor: mounted && isMobile ? "default" : "move" }}
      >
        <span style={{ fontSize: "11px", userSelect: "none" }}>
          HYERYONG.DEV
        </span>
        <div className="title-bar-buttons">
          <button
            className="title-bar-button"
            onMouseDown={(e) => e.stopPropagation()}
          >
            _
          </button>
          <button
            className="title-bar-button"
            onMouseDown={(e) => e.stopPropagation()}
          >
            □
          </button>
          <button
            className="title-bar-button"
            onClick={() => setShowExplorerWindow(false)}
            onMouseDown={(e) => e.stopPropagation()}
          >
            ✕
          </button>
        </div>
      </div>

      {/* 메뉴바 */}
      <div className="explorer-menubar">
        <span>
          <u>F</u>ile
        </span>
        <span>
          <u>E</u>dit
        </span>
        <span>
          <u>V</u>iew
        </span>
        <span>
          <u>G</u>o
        </span>
        <span>
          F<u>a</u>vorites
        </span>
        <span>
          <u>H</u>elp
        </span>
      </div>

      {/* 툴바 */}
      <div className="explorer-toolbar">
        <button className="toolbar-button" onClick={() => router.back()}>
          <span>←</span>
          <span>Back</span>
        </button>
        <button className="toolbar-button" onClick={() => router.forward()}>
          <span>→</span>
          <span>Forward</span>
        </button>
        <button className="toolbar-button" onClick={() => router.push('/')}>
          <span>↑</span>
          <span>Up</span>
        </button>
        <div className="toolbar-separator"></div>
        <button className="toolbar-button">
          <span style={{ lineHeight: "16px" }}>✂</span>
          <span>Cut</span>
        </button>
        <button className="toolbar-button">
          <span>⎘</span>
          <span>Copy</span>
        </button>
        <button className="toolbar-button">
          <span>⎗</span>
          <span>Paste</span>
        </button>
        <div className="toolbar-separator"></div>
        <button className="toolbar-button">
          <span>↶</span>
          <span>Undo</span>
        </button>
        <button className="toolbar-button">
          <span>×</span>
          <span>Delete</span>
        </button>
        <div className="toolbar-separator"></div>
        <button className="toolbar-button">
          <span>⚙</span>
          <span>Properties</span>
        </button>
        <button className="toolbar-button">
          <span>☰</span>
          <span>Views</span>
        </button>
      </div>

      {/* 주소 표시줄 */}
      <div className="address-bar">
        <span className="address-bar-label">Address</span>
        <input
          type="text"
          className="address-bar-input"
          value="C:\hyeryong.dev"
          readOnly
        />
      </div>

      {/* 내용 영역 */}
      <div className="explorer-content">
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              marginBottom: "12px",
              color: "#000",
            }}
          >
            HYERYONG.DEV
          </h2>
          <pre style={{ fontSize: "11px", color: "#000", lineHeight: "1.6" }}>
            {`Hi there, I’m Hyeryong Choi.\nWelcome to my blog — thanks for stopping by!`}
          </pre>
        </div>

        {/* 폴더 아이콘들 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
          }}
        >
          <button
            onClick={() => handleIconDoubleClick("/about")}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
            }}
          >
            <WindowsShell32Icon3 size={32} />
            <span style={{ fontSize: "11px", color: "#000" }}>About Me</span>
          </button>

          <button
            onClick={() => handleIconDoubleClick("/blog")}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
            }}
          >
            <Windows95TextFile size={32} />
            <span style={{ fontSize: "11px", color: "#000" }}>Blog</span>
          </button>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              padding: "8px",
            }}
          >
            <Windows98MyDocuments2 size={32} />
            <span style={{ fontSize: "11px", color: "#000" }}>Projects</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              padding: "8px",
            }}
          >
            <Windows98Modem size={32} />
            <span style={{ fontSize: "11px", color: "#000" }}>Contact</span>
          </div>
        </div>
      </div>

      {/* 상태바 */}
      <div className="explorer-status-bar">
        <div className="status-section" style={{ flex: 1 }}>
          4 object(s)
        </div>
        <div className="status-section">My Computer</div>
      </div>
    </div>
  );
}
