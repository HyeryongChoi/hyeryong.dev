import type { Metadata } from "next";
import { VT323 } from "next/font/google";
import "./globals.css";
import { WindowProvider } from "@/contexts/WindowContext";
import { WindowManager } from "@/components/WindowManager";
import { Taskbar } from "@/components/Taskbar";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
});

export const metadata: Metadata = {
  title: "HYERYONG.DEV",
  description:
    "Hi there, I'm Hyeryong Choi. Welcome to my blog - thanks for stopping by!",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "HYERYONG.DEV",
    description:
      "Hi there, I'm Hyeryong Choi. Welcome to my blog - thanks for stopping by!",
    url: "https://hyeryongdev.vercel.app",
    siteName: "HYERYONG.DEV",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HYERYONG.DEV",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HYERYONG.DEV",
    description:
      "Hi there, I'm Hyeryong Choi. Welcome to my blog - thanks for stopping by!",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
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
