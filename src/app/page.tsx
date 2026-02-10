"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useWindow } from "@/contexts/WindowContext";
import { 
  WindowsMyComputer2, 
  Windows98MyDocuments2, 
  InternetExplorer10, 
  WindowsRecycleBin, 
  WindowsNetworkNeighborhood3,
  WindowsBriefcase,
  WindowsCDROMDrive
} from "react-old-icons";

export default function Home() {
  const pathname = usePathname();
  const { setShowExplorerWindow, setShowMusicPlayer, setMusicEverOpened, bringToFront, setShowStartMenu } = useWindow();
  const [isMobile, setIsMobile] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  useEffect(() => {
    if (pathname === "/") {
      setShowExplorerWindow(true);
    }
  }, [pathname, setShowExplorerWindow]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMyComputerClick = () => {
    setShowExplorerWindow(true);
    bringToFront('explorer');
  };

  const handleMusicClick = () => {
    setShowMusicPlayer(true);
    setMusicEverOpened(true);
    bringToFront('music');
  };

  return (
    <>
      {/* Windows 98 바탕화면 */}
      <main className="desktop" onClick={() => {
        setShowStartMenu(false);
        setSelectedIcon(null);
      }}>
        {/* 바탕화면 아이콘들 */}
        <nav aria-label="Desktop icons">
          <button 
            className={`desktop-icon ${selectedIcon === "mycomputer" ? "selected" : ""}`}
            onDoubleClick={handleMyComputerClick}
            onClick={(e) => {
              e.stopPropagation();
              if (isMobile) {
                handleMyComputerClick();
              } else {
                setSelectedIcon("mycomputer");
              }
            }}
            onBlur={() => setSelectedIcon(null)}
          >
            <div className="icon-image flex items-center justify-center">
              <WindowsMyComputer2 size={32} />
            </div>
            <div className="icon-label">My Computer</div>
          </button>

          <button
            className={`desktop-icon ${selectedIcon === "mydocuments" ? "selected" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIcon("mydocuments");
            }}
            onBlur={() => setSelectedIcon(null)}
          >
            <div className="icon-image flex items-center justify-center">
              <Windows98MyDocuments2 size={32} />
            </div>
            <div className="icon-label">My Documents</div>
          </button>

          <button
            className={`desktop-icon ${selectedIcon === "ie" ? "selected" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIcon("ie");
            }}
            onBlur={() => setSelectedIcon(null)}
          >
            <div className="icon-image flex items-center justify-center">
              <InternetExplorer10 size={32} />
            </div>
            <div className="icon-label">Internet Explorer</div>
          </button>

          <button
            className={`desktop-icon ${selectedIcon === "network" ? "selected" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIcon("network");
            }}
            onBlur={() => setSelectedIcon(null)}
          >
            <div className="icon-image flex items-center justify-center">
              <WindowsNetworkNeighborhood3 size={32} />
            </div>
            <div className="icon-label">Network Neighborhood</div>
          </button>

          <button
            className={`desktop-icon ${selectedIcon === "recycle" ? "selected" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIcon("recycle");
            }}
            onBlur={() => setSelectedIcon(null)}
          >
            <div className="icon-image flex items-center justify-center">
              <WindowsRecycleBin size={32} />
            </div>
            <div className="icon-label">Recycle Bin</div>
          </button>

          <button
            className={`desktop-icon ${selectedIcon === "briefcase" ? "selected" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIcon("briefcase");
            }}
            onBlur={() => setSelectedIcon(null)}
          >
            <div className="icon-image flex items-center justify-center">
              <WindowsBriefcase size={32} />
            </div>
            <div className="icon-label">Briefcase</div>
          </button>

          <button 
            className={`desktop-icon ${selectedIcon === "music" ? "selected" : ""}`}
            onDoubleClick={handleMusicClick}
            onClick={(e) => {
              e.stopPropagation();
              if (isMobile) {
                handleMusicClick();
              } else {
                setSelectedIcon("music");
              }
            }}
            onBlur={() => setSelectedIcon(null)}
          >
            <div className="icon-image flex items-center justify-center">
              <WindowsCDROMDrive size={32} />
            </div>
            <div className="icon-label">Music</div>
          </button>
        </nav>
      </main>

    </>
  );
}
