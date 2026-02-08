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

  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setWindowPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, setWindowPosition]);

  const handleIconDoubleClick = (path: string) => {
    router.push(path);
  };

  return (
    <div
      className="explorer-window"
      onClick={() => bringToFront("explorer")}
      style={{
        position: "absolute",
        top: windowPosition.y || "10%",
        left: windowPosition.x || "50%",
        transform: windowPosition.x ? "none" : "translateX(-50%)",
        width: "600px",
        height: "400px",
        cursor: isDragging ? "move" : "default",
        zIndex: explorerZIndex,
      }}
    >
      {/* 타이틀바 */}
      <div
        className="win95-title-bar"
        onMouseDown={handleTitleBarMouseDown}
        style={{ cursor: "move" }}
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
          <span style={{ fontSize: "16px", color: "#000" }}>←</span>
          <span style={{ fontSize: "8px", color: "#000" }}>Back</span>
        </button>
        <button className="toolbar-button" onClick={() => router.forward()}>
          <span style={{ fontSize: "16px", color: "#000" }}>→</span>
          <span style={{ fontSize: "8px", color: "#000" }}>Forward</span>
        </button>
        <button className="toolbar-button" onClick={() => router.push('/')}>
          <span style={{ fontSize: "16px", color: "#000" }}>↑</span>
          <span style={{ fontSize: "8px", color: "#000" }}>Up</span>
        </button>
        <div className="toolbar-separator"></div>
        <button className="toolbar-button">
          <span style={{ fontSize: "14px", color: "#000", lineHeight: "16px" }}>
            ✂
          </span>
          <span style={{ fontSize: "8px", color: "#000" }}>Cut</span>
        </button>
        <button className="toolbar-button">
          <span style={{ fontSize: "16px", color: "#000" }}>⎘</span>
          <span style={{ fontSize: "8px", color: "#000" }}>Copy</span>
        </button>
        <button className="toolbar-button">
          <span style={{ fontSize: "16px", color: "#000" }}>⎗</span>
          <span style={{ fontSize: "8px", color: "#000" }}>Paste</span>
        </button>
        <div className="toolbar-separator"></div>
        <button className="toolbar-button">
          <span style={{ fontSize: "16px", color: "#000" }}>↶</span>
          <span style={{ fontSize: "8px", color: "#000" }}>Undo</span>
        </button>
        <button className="toolbar-button">
          <span style={{ fontSize: "16px", color: "#000" }}>×</span>
          <span style={{ fontSize: "8px", color: "#000" }}>Delete</span>
        </button>
        <div className="toolbar-separator"></div>
        <button className="toolbar-button">
          <span style={{ fontSize: "16px", color: "#000" }}>⚙</span>
          <span style={{ fontSize: "8px", color: "#000" }}>Properties</span>
        </button>
        <button className="toolbar-button">
          <span style={{ fontSize: "16px", color: "#000" }}>☰</span>
          <span style={{ fontSize: "8px", color: "#000" }}>Views</span>
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
