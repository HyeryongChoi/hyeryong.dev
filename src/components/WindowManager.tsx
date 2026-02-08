"use client";

import { useWindow } from "@/contexts/WindowContext";
import { ExplorerWindow } from "./ExplorerWindow";
import { MusicPlayerWindow } from "./MusicPlayerWindow";
import { AlertWindow } from "./AlertWindow";

export function WindowManager() {
  const { showExplorerWindow, showMusicPlayer } = useWindow();

  return (
    <>
      {showExplorerWindow && <ExplorerWindow />}
      {showMusicPlayer && <MusicPlayerWindow />}
      <AlertWindow />
    </>
  );
}
