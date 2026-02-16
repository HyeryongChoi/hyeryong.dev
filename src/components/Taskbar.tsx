"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWindow } from "@/contexts/WindowContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  WindowsMyComputer2,
  WindowsCDROMDrive,
  WindowsShell40,
  WindowsShell47,
  WindowsProgramGroup3,
  Windows95StartupDiskWizard,
  Windows98MyDocuments2,
  WindowsShell32Icon22,
  WindowsShell32Icon134,
  MicrosoftHelp,
  Windows95Run,
  WindowsShell45,
  WindowsShutDown,
} from "react-old-icons";

export function Taskbar() {
  const router = useRouter();
  const { t, locale, setLocale } = useLanguage();
  const {
    showExplorerWindow,
    setShowExplorerWindow,
    showMusicPlayer,
    setShowMusicPlayer,
    setIsMusicPlayerMinimized,
    musicEverOpened,
    bringToFront,
    explorerZIndex,
    musicZIndex,
    showStartMenu,
    setShowStartMenu,
  } = useWindow();
  const [currentTime, setCurrentTime] = useState("");
  const [mounted, setMounted] = useState(false);

  // 클라이언트 마운트 감지
  useEffect(() => {
    setMounted(true);
  }, []);

  // 시간 업데이트
  useEffect(() => {
    if (!mounted) return;
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      setCurrentTime(`${displayHours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [mounted]);

  return (
    <>
      {/* 시작 메뉴 */}
      {showStartMenu && (
        <nav className="start-menu" aria-label="Start menu">
          <div className="start-menu-banner">
            <span>{t("startMenu.windows98")}</span>
          </div>
          <ul className="start-menu-items">
            <li className="start-menu-item">
              <WindowsShell47 size={20} />
              <span>{t("startMenu.windowsUpdate")}</span>
            </li>
            <li className="start-menu-separator"></li>
            <li className="start-menu-item">
              <WindowsProgramGroup3 size={20} />
              <span>{t("startMenu.programs")}</span>
              <span className="submenu-arrow">▶</span>
            </li>
            <li className="start-menu-item">
              <Windows95StartupDiskWizard size={20} />
              <span>{t("startMenu.favorites")}</span>
              <span className="submenu-arrow">▶</span>
            </li>
            <li className="start-menu-item">
              <Windows98MyDocuments2 size={20} />
              <span>{t("startMenu.documents")}</span>
              <span className="submenu-arrow">▶</span>
            </li>
            <li className="start-menu-item">
              <WindowsShell32Icon22 size={20} />
              <span>
                <u>S</u>ettings
              </span>
              <span className="submenu-arrow">▶</span>
            </li>
            <li className="start-menu-item">
              <WindowsShell32Icon134 size={20} />
              <span>{t("startMenu.find")}</span>
              <span className="submenu-arrow">▶</span>
            </li>
            <li className="start-menu-item">
              <MicrosoftHelp size={20} />
              <span>{t("startMenu.help")}</span>
            </li>
            <li className="start-menu-item">
              <Windows95Run size={20} />
              <span>{t("startMenu.run")}</span>
            </li>
            <li className="start-menu-separator"></li>
            <li className="start-menu-item">
              <WindowsShell45 size={20} />
              <span>{t("startMenu.logOff")}</span>
            </li>
            <li className="start-menu-item">
              <WindowsShutDown size={20} />
              <span>{t("startMenu.shutDown")}</span>
            </li>
          </ul>
        </nav>
      )}

      {/* 작업 표시줄 */}
      <footer className="taskbar">
        <button
          className={`start-button ${showStartMenu ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setShowStartMenu(!showStartMenu);
            router.push("/");
          }}
          aria-label="Start menu"
        >
          <WindowsShell40 size={16} />
          <span>{t("taskbar.start")}</span>
        </button>
        <div className="taskbar-divider"></div>
        <button
          className={`taskbar-button ${showExplorerWindow && explorerZIndex > musicZIndex ? "active" : ""}`}
          onClick={() => {
            if (!showExplorerWindow) {
              setShowExplorerWindow(true);
            }
            bringToFront("explorer");
          }}
          aria-label="HYERYONG.DEV window"
        >
          <WindowsMyComputer2 size={14} />
          <span>{t("taskbar.hyeryongDev")}</span>
        </button>
        {musicEverOpened && (
          <button
            className={`taskbar-button ${showMusicPlayer && musicZIndex > explorerZIndex ? "active" : ""}`}
            onClick={() => {
              setShowMusicPlayer(true);
              setIsMusicPlayerMinimized(false);
              bringToFront("music");
            }}
            aria-label="Windows Media Player window"
          >
            <WindowsCDROMDrive size={14} />
            <span>{t("taskbar.windowsMediaPlayer")}</span>
          </button>
        )}
        <div className="taskbar-divider"></div>
        <div className="taskbar-right">
          <select
            className="taskbar-lang-select"
            value={locale}
            onChange={(e) => setLocale(e.target.value as "ko" | "en")}
            aria-label="Language"
          >
            <option value="en">EN</option>
            <option value="ko">KO</option>
          </select>
          <time className="clock" suppressHydrationWarning>
            <span suppressHydrationWarning>{currentTime}</span>
          </time>
        </div>
      </footer>
    </>
  );
}
