"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWindow } from "@/contexts/WindowContext";

const playlist = [
  {
    title: "LUCY - 개화 (Flowering)",
    videoId: "hlv5N6bT8W4",
  },
  {
    title: "LUCY - 사랑은 어쩌고 (Where's Your Love)",
    videoId: "yE_wjJ2VfjE",
  },
  {
    title: "LUCY - 맞네 (You're Right)",
    videoId: "yGLhYyoTAy4",
  },
  {
    title: "LUCY - 놀이 (PLAY)",
    videoId: "wFJxzoljf10",
  },
  {
    title: "LUCY - 아지랑이 (Haze)",
    videoId: "uSW1iY2iacc",
  },
  {
    title: "사마죄 Challenge with 최상엽",
    videoId: "Jr5s0WLoNtk",
  },
];

export function MusicPlayerWindow() {
  const router = useRouter();
  const {
    musicWindowPosition,
    setMusicWindowPosition,
    musicZIndex,
    setShowMusicPlayer,
    currentTrackIndex,
    setCurrentTrackIndex,
    bringToFront,
  } = useWindow();

  const [isDraggingMusic, setIsDraggingMusic] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
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

  const handleMusicTitleBarMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return; // 모바일에서는 드래그 비활성화
    setIsDraggingMusic(true);
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

  const handleMusicTitleBarTouchStart = (e: React.TouchEvent) => {
    if (isMobile) return; // 모바일에서는 드래그 비활성화
    const touch = e.touches[0];
    setIsDraggingMusic(true);
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
      if (isDraggingMusic) {
        setMusicWindowPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingMusic && e.touches.length > 0) {
        const touch = e.touches[0];
        setMusicWindowPosition({
          x: touch.clientX - dragOffset.x,
          y: touch.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingMusic(false);
    };

    const handleTouchEnd = () => {
      setIsDraggingMusic(false);
    };

    if (isDraggingMusic) {
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
  }, [isDraggingMusic, dragOffset, setMusicWindowPosition, isMobile]);

  return (
    <div
      className="explorer-window music-player-window"
      style={{
        '--window-top': musicWindowPosition.y > 0 ? `${musicWindowPosition.y}px` : '10%',
        '--window-left': musicWindowPosition.x > 0 ? `${musicWindowPosition.x}px` : '50%',
        '--window-transform': musicWindowPosition.x > 0 ? 'none' : 'translateX(-50%)',
        cursor: isDraggingMusic ? "move" : "default",
        zIndex: musicZIndex,
      } as React.CSSProperties}
      onClick={() => {
        setShowPlaylistDropdown(false);
        bringToFront("music");
      }}
    >
      {/* 타이틀바 */}
      <div
        className="win95-title-bar"
        onMouseDown={handleMusicTitleBarMouseDown}
        onTouchStart={handleMusicTitleBarTouchStart}
        style={{ cursor: mounted && isMobile ? "default" : "move" }}
      >
        <span style={{ fontSize: "11px", userSelect: "none" }}>
          Windows Media Player
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
            onClick={() => setShowMusicPlayer(false)}
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
        <button 
          className="toolbar-button" 
          onClick={() => {
            if (currentTrackIndex > 0) {
              setCurrentTrackIndex(currentTrackIndex - 1);
            }
          }}
          disabled={currentTrackIndex === 0}
          style={{ opacity: currentTrackIndex === 0 ? 0.5 : 1 }}
        >
          <span>←</span>
          <span>Back</span>
        </button>
        <button 
          className="toolbar-button"
          onClick={() => {
            if (currentTrackIndex < playlist.length - 1) {
              setCurrentTrackIndex(currentTrackIndex + 1);
            }
          }}
          disabled={currentTrackIndex === playlist.length - 1}
          style={{ opacity: currentTrackIndex === playlist.length - 1 ? 0.5 : 1 }}
        >
          <span>→</span>
          <span>Forward</span>
        </button>
        <button 
          className="toolbar-button" 
          onClick={() => setCurrentTrackIndex(0)}
          disabled={currentTrackIndex === 0}
          style={{ opacity: currentTrackIndex === 0 ? 0.5 : 1 }}
        >
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

      {/* Track 선택 바 */}
      <div className="address-bar" style={{ position: "relative" }}>
        <span className="address-bar-label">Track</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowPlaylistDropdown(!showPlaylistDropdown);
          }}
          className="address-bar-input"
          style={{
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            textAlign: "left",
            padding: "2px 4px",
          }}
        >
          <span>♪ {playlist[currentTrackIndex].title}</span>
          <span>▼</span>
        </button>

        {/* 드롭다운 메뉴 */}
        {showPlaylistDropdown && (
          <div
            style={{
              position: "absolute",
              top: "26px",
              left: "50px",
              right: "2px",
              background: "var(--win98-gray)",
              border: "2px solid",
              borderColor:
                "var(--win98-white) var(--win98-black) var(--win98-black) var(--win98-white)",
              boxShadow: "2px 2px 0 rgba(0,0,0,0.2)",
              zIndex: 1000,
            }}
          >
            {playlist.map((track, index) => (
              <div
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentTrackIndex(index);
                  setShowPlaylistDropdown(false);
                }}
                style={{
                  padding: "6px 12px",
                  fontSize: "11px",
                  cursor: "pointer",
                  background:
                    currentTrackIndex === index
                      ? "#000080"
                      : "var(--win98-gray)",
                  color: currentTrackIndex === index ? "white" : "#000",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => {
                  if (currentTrackIndex !== index) {
                    e.currentTarget.style.background = "#000080";
                    e.currentTarget.style.color = "white";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentTrackIndex !== index) {
                    e.currentTarget.style.background = "var(--win98-gray)";
                    e.currentTarget.style.color = "#000";
                  }
                }}
              >
                <span style={{ fontSize: "14px" }}>♪</span>
                <span>{track.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 내용 영역 */}
      <div
        className="explorer-content"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "15px",
        }}
      >
        {/* YouTube 플레이어 */}
        <div style={{ width: "100%" }}>
          <div
            style={{
              position: "relative",
              paddingBottom: "56.25%",
              height: 0,
              border: "2px solid",
              borderColor:
                "var(--win98-dark-gray) var(--win98-white) var(--win98-white) var(--win98-dark-gray)",
              background: "#000",
            }}
          >
            <iframe
              key={currentTrackIndex}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
              src={`https://www.youtube.com/embed/${playlist[currentTrackIndex].videoId}`}
              title={playlist[currentTrackIndex].title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </div>

      {/* 상태바 */}
      <div className="explorer-status-bar">
        <div className="status-section" style={{ flex: 1 }}>
          ▶ Track {currentTrackIndex + 1} of {playlist.length}:{" "}
          {playlist[currentTrackIndex].title}
        </div>
      </div>
    </div>
  );
}
