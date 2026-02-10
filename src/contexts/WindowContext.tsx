"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface WindowContextType {
  showExplorerWindow: boolean;
  setShowExplorerWindow: (show: boolean) => void;
  showMusicPlayer: boolean;
  setShowMusicPlayer: (show: boolean) => void;
  isMusicPlayerMinimized: boolean;
  setIsMusicPlayerMinimized: (minimized: boolean) => void;
  showStartMenu: boolean;
  setShowStartMenu: (show: boolean) => void;
  musicEverOpened: boolean;
  setMusicEverOpened: (opened: boolean) => void;
  showAlert: boolean;
  setShowAlert: (show: boolean) => void;
  alertMessage: string;
  setAlertMessage: (message: string) => void;
  windowPosition: { x: number; y: number };
  setWindowPosition: (pos: { x: number; y: number }) => void;
  musicWindowPosition: { x: number; y: number };
  setMusicWindowPosition: (pos: { x: number; y: number }) => void;
  explorerZIndex: number;
  setExplorerZIndex: (z: number) => void;
  musicZIndex: number;
  setMusicZIndex: (z: number) => void;
  topZIndex: number;
  setTopZIndex: (z: number) => void;
  currentTrackIndex: number;
  setCurrentTrackIndex: (index: number) => void;
  bringToFront: (window: 'explorer' | 'music') => void;
}

const WindowContext = createContext<WindowContextType | undefined>(undefined);

export function WindowProvider({ children }: { children: ReactNode }) {
  const [showExplorerWindow, setShowExplorerWindow] = useState(false);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [isMusicPlayerMinimized, setIsMusicPlayerMinimized] = useState(false);
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [musicEverOpened, setMusicEverOpened] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [windowPosition, setWindowPosition] = useState({ x: 0, y: 0 });
  const [musicWindowPosition, setMusicWindowPosition] = useState({ x: 0, y: 0 });
  const [explorerZIndex, setExplorerZIndex] = useState(101);
  const [musicZIndex, setMusicZIndex] = useState(100);
  const [topZIndex, setTopZIndex] = useState(101);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const bringToFront = (window: 'explorer' | 'music') => {
    const newZIndex = topZIndex + 1;
    setTopZIndex(newZIndex);
    if (window === 'explorer') {
      setExplorerZIndex(newZIndex);
    } else {
      setMusicZIndex(newZIndex);
    }
  };

  return (
    <WindowContext.Provider
      value={{
        showExplorerWindow,
        setShowExplorerWindow,
        showMusicPlayer,
        setShowMusicPlayer,
        isMusicPlayerMinimized,
        setIsMusicPlayerMinimized,
        showStartMenu,
        setShowStartMenu,
        musicEverOpened,
        setMusicEverOpened,
        showAlert,
        setShowAlert,
        alertMessage,
        setAlertMessage,
        windowPosition,
        setWindowPosition,
        musicWindowPosition,
        setMusicWindowPosition,
        explorerZIndex,
        setExplorerZIndex,
        musicZIndex,
        setMusicZIndex,
        topZIndex,
        setTopZIndex,
        currentTrackIndex,
        setCurrentTrackIndex,
        bringToFront,
      }}
    >
      {children}
    </WindowContext.Provider>
  );
}

export function useWindow() {
  const context = useContext(WindowContext);
  if (context === undefined) {
    throw new Error('useWindow must be used within a WindowProvider');
  }
  return context;
}
