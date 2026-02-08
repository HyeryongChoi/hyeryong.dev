"use client";

import { useState, useEffect } from "react";
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
  const { setShowExplorerWindow, setShowMusicPlayer, setMusicEverOpened, bringToFront, setShowStartMenu } = useWindow();
  const [isMobile, setIsMobile] = useState(false);

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
      <main className="desktop" onClick={() => setShowStartMenu(false)}>
        {/* 바탕화면 아이콘들 */}
        <nav aria-label="Desktop icons">
          <button 
            className="desktop-icon"
            onDoubleClick={handleMyComputerClick}
            onClick={isMobile ? handleMyComputerClick : undefined}
          >
            <div className="icon-image flex items-center justify-center">
              <WindowsMyComputer2 size={32} />
            </div>
            <div className="icon-label">My Computer</div>
          </button>

          <div className="desktop-icon">
            <div className="icon-image flex items-center justify-center">
              <Windows98MyDocuments2 size={32} />
            </div>
            <div className="icon-label">My Documents</div>
          </div>

          <div className="desktop-icon">
            <div className="icon-image flex items-center justify-center">
              <InternetExplorer10 size={32} />
            </div>
            <div className="icon-label">Internet Explorer</div>
          </div>

          <div className="desktop-icon">
            <div className="icon-image flex items-center justify-center">
              <WindowsNetworkNeighborhood3 size={32} />
            </div>
            <div className="icon-label">Network Neighborhood</div>
          </div>

          <div className="desktop-icon">
            <div className="icon-image flex items-center justify-center">
              <WindowsRecycleBin size={32} />
            </div>
            <div className="icon-label">Recycle Bin</div>
          </div>

          <div className="desktop-icon">
            <div className="icon-image flex items-center justify-center">
              <WindowsBriefcase size={32} />
            </div>
            <div className="icon-label">Briefcase</div>
          </div>

          <button 
            className="desktop-icon"
            onDoubleClick={handleMusicClick}
            onClick={isMobile ? handleMusicClick : undefined}
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
