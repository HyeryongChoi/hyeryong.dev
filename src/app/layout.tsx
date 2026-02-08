import type { Metadata } from 'next';
import { VT323 } from 'next/font/google';
import './globals.css';
import { WindowProvider } from '@/contexts/WindowContext';
import { WindowManager } from '@/components/WindowManager';
import { Taskbar } from '@/components/Taskbar';

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-vt323',
});

export const metadata: Metadata = {
  title: 'HYERYONG.DEV - Windows 98',
  description: 'Windows 98 스타일의 개발 블로그입니다',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ko'>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={vt323.variable}>
        <WindowProvider>
          {children}
          <WindowManager />
          <Taskbar />
        </WindowProvider>
      </body>
    </html>
  );
}
