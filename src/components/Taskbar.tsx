"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWindow } from "@/contexts/WindowContext";
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
  WindowsShutDown
} from "react-old-icons";

export function Taskbar() {
  const router = useRouter();
  const { showExplorerWindow, setShowExplorerWindow, showMusicPlayer, bringToFront, explorerZIndex, musicZIndex, showStartMenu, setShowStartMenu } = useWindow();
  const [currentTime, setCurrentTime] = useState("");

  // 시간 업데이트
  useEffect(() => {
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
  }, []);

  return (
    <>
      {/* 시작 메뉴 */}
      {showStartMenu && (
        <nav className="start-menu" aria-label="Start menu">
          <div className="start-menu-banner">
            <span>Windows 98</span>
          </div>
          <ul className="start-menu-items">
            <li className="start-menu-item">
              <WindowsShell47 size={20} />
              <span><u>W</u>indows Update</span>
            </li>
            <li className="start-menu-separator"></li>
            <li className="start-menu-item">
              <WindowsProgramGroup3 size={20} />
              <span><u>P</u>rograms</span>
              <span className="submenu-arrow">▶</span>
            </li>
            <li className="start-menu-item">
              <Windows95StartupDiskWizard size={20} />
              <span>F<u>a</u>vorites</span>
              <span className="submenu-arrow">▶</span>
            </li>
            <li className="start-menu-item">
              <Windows98MyDocuments2 size={20} />
              <span><u>D</u>ocuments</span>
              <span className="submenu-arrow">▶</span>
            </li>
            <li className="start-menu-item">
              <WindowsShell32Icon22 size={20} />
              <span><u>S</u>ettings</span>
              <span className="submenu-arrow">▶</span>
            </li>
            <li className="start-menu-item">
              <WindowsShell32Icon134 size={20} />
              <span><u>F</u>ind</span>
              <span className="submenu-arrow">▶</span>
            </li>
            <li className="start-menu-item">
              <MicrosoftHelp size={20} />
              <span><u>H</u>elp</span>
            </li>
            <li className="start-menu-item">
              <Windows95Run size={20} />
              <span><u>R</u>un...</span>
            </li>
            <li className="start-menu-separator"></li>
            <li className="start-menu-item">
              <WindowsShell45 size={20} />
              <span>Log O<u>f</u>f...</span>
            </li>
            <li className="start-menu-item">
              <WindowsShutDown size={20} />
              <span>S<u>h</u>ut Down...</span>
            </li>
          </ul>
        </nav>
      )}

      {/* 작업 표시줄 */}
      <footer className="taskbar">
        <button
          className={`start-button ${showStartMenu ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setShowStartMenu(!showStartMenu);
            router.push('/');
          }}
          aria-label="Start menu"
        >
          <WindowsShell40 size={16} />
          <span>Start</span>
        </button>
        <div className="taskbar-divider"></div>
        <button 
          className={`taskbar-button ${showExplorerWindow && explorerZIndex > musicZIndex ? 'active' : ''}`}
          onClick={() => {
            if (!showExplorerWindow) {
              setShowExplorerWindow(true);
            }
            bringToFront('explorer');
          }}
          aria-label="HYERYONG.DEV window"
        >
          <WindowsMyComputer2 size={14} />
          <span>HYERYONG.DEV</span>
        </button>
        {showMusicPlayer && (
          <button 
            className={`taskbar-button ${musicZIndex > explorerZIndex ? 'active' : ''}`}
            onClick={() => bringToFront('music')}
            aria-label="Windows Media Player window"
          >
            <WindowsCDROMDrive size={14} />
            <span>Windows Media Player</span>
          </button>
        )}
        <time className="clock">
          <span>{currentTime}</span>
        </time>
      </footer>
    </>
  );
}
