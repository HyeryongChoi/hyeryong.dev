"use client";

import { useWindow } from "@/contexts/WindowContext";
import { ExplorerWindow } from "./ExplorerWindow";
import { MusicPlayerWindow } from "./MusicPlayerWindow";

export function WindowManager() {
  const { showExplorerWindow, showMusicPlayer } = useWindow();

  return (
    <>
      {showExplorerWindow && <ExplorerWindow />}
      {showMusicPlayer && <MusicPlayerWindow />}
    </>
  );
}
