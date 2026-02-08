'use client';

import { useEffect, useState } from 'react';

export default function TerminalHeader() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border-b-4 border-crt-green p-6 bg-black bg-opacity-30">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-4xl font-pixel text-crt-green text-glow">
            HYERYONG.DEV
          </span>
          <span className="text-2xl font-retro text-crt-cyan cursor-blink">█</span>
        </div>
        <div className="text-xl font-retro text-crt-amber">
          {time}
        </div>
      </div>
      <div className="mt-4 text-xl font-retro text-crt-cyan">
        &gt; SYSTEM READY_
      </div>
    </div>
  );
}
