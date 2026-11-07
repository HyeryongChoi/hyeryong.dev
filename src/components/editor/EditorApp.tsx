"use client";

import EditorWindow from "./EditorWindow";

interface EditorAppProps {
  login: string;
}

export default function EditorApp({ login }: EditorAppProps) {
  return (
    <EditorWindow
      title="Untitled"
      login={login}
      status={<div className="status-section" style={{ flex: 1 }}>Ready</div>}
    />
  );
}
