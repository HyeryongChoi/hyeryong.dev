'use client';

import { useWindow } from "@/contexts/WindowContext";

export default function BlogPage() {
  const { setShowStartMenu } = useWindow();

  return (
    <main className="desktop" onClick={() => setShowStartMenu(false)}>
      <div className="text-center mt-20">
        <h1 className="text-4xl font-bold text-white mb-4">Blog Page</h1>
        <p className="text-xl text-white">Coming soon...</p>
      </div>
    </main>
  );
}
