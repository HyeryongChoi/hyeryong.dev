# HYERYONG.DEV - Windows 98 Style Blog

A retro-inspired developer blog that recreates the Windows 98 desktop experience.

## ✨ Features

- 🪟 **Windows 98 Desktop** - Teal background with desktop icons
- 🎵 **Windows Media Player** - Built-in LUCY band playlist
- 📁 **Draggable Windows** - Move windows around like real Windows 98
- 🖱️ **Z-Index Management** - Clicked window automatically comes to front
- 📌 **Taskbar** - Persistent bottom taskbar across all pages
- 🎨 **react-old-icons** - Authentic Windows 98 icons
- ⚡ **Next.js 15 + React 19** - Modern web technology stack

## 🚀 Getting Started

### Prerequisites

- Node.js 18.18.0+ or 20.0.0+
- npm or pnpm

### Installation & Running

```bash
# Install dependencies
npm install
# or
pnpm install

# Run development server
npm run dev
# or
pnpm dev

# Build for production
npm run build

# Run production server
npm start
```

Development server: [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
hyeryong.dev/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── about/             # About page
│   │   ├── blog/              # Blog page
│   │   ├── layout.tsx         # Root layout (WindowProvider, Taskbar)
│   │   ├── page.tsx           # Home page (Windows 98 desktop)
│   │   └── globals.css        # Global styles (Windows 98 theme)
│   ├── components/            # Reusable components
│   │   ├── ExplorerWindow.tsx # HYERYONG.DEV explorer window
│   │   ├── MusicPlayerWindow.tsx # Windows Media Player window
│   │   ├── WindowManager.tsx  # Popup window manager
│   │   └── Taskbar.tsx        # Taskbar + Start menu
│   ├── contexts/              # React Context
│   │   └── WindowContext.tsx  # Global window state management
│   └── data/                  # Data
│       └── posts.ts           # Blog post data
├── public/                    # Static files
│   └── favicon.svg           # Windows logo favicon
└── package.json
```

## 🎨 Key Features

### 1. Windows 98 Desktop
- **Desktop Icons**: My Computer, My Documents, Internet Explorer, Network Neighborhood, Recycle Bin, Briefcase, Music (CD-ROM)
- **Double-click**: Open corresponding window
- **Teal Background**: Iconic Windows 98 teal color (#008080)

### 2. Draggable Popup Windows
- **Explorer Window (HYERYONG.DEV)**: About Me, Blog, Projects, Contact folders
- **Windows Media Player**: 6-song playlist of LUCY band
- **Title Bar Drag**: Move windows by dragging title bar
- **Z-Index Management**: Clicked window automatically comes to front

### 3. Taskbar
- **Start Button**: Opens Start menu + navigates to home
- **Window Buttons**: Shows open windows, click to focus
- **Clock**: Real-time clock display (12-hour format)
- **Persistent**: Taskbar persists across all pages

### 4. Start Menu
- Windows Update, Programs, Favorites, Documents, Settings, Find, Help, Run, Log Off, Shut Down
- Authentic Windows 98 icons
- Keyboard shortcut underlines

### 5. Windows Media Player
- **Playlist**: 6 songs by LUCY band
  - Flowering (개화)
  - Where's Your Love (사랑은 어쩌고)
  - You're Right (맞네)
  - PLAY (놀이)
  - Haze (아지랑이)
  - 사마죄 Challenge with 최상엽
- **Track Dropdown**: Address bar-style track selector
- **Navigation Buttons**: Back (prev track), Forward (next track), Up (first track)
- **YouTube Embed**: Plays YouTube videos for each track

### 6. Global State Management
- **WindowContext**: Manages window state via React Context API
- **Cross-Page Persistence**: Popup windows persist across page navigation
- **Automatic Z-Index**: Recently clicked windows always on top

## 🎨 Design Guide

### Color Palette

- **Teal Background**: `#008080` - Windows 98 desktop
- **Win98 Gray**: `#C0C0C0` - Default window and button color
- **Win98 Blue**: `#000080` - Title bar, selected areas
- **Win98 Dark Gray**: `#808080` - Shadow effects
- **Win98 White**: `#FFFFFF` - Highlight effects

### UI Elements

- **3D Effects**: White/gray borders for depth
- **Title Bar**: Blue gradient
- **Menu Bar**: File, Edit, View, Go, Favorites, Help
- **Toolbar**: Windows Explorer-style buttons
- **Address Bar**: Address/track display bar
- **Status Bar**: Bottom information display

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.1 (App Router, Turbopack)
- **React**: 19.1.0
- **TypeScript**: 5.8.3
- **Styling**: Tailwind CSS 4.1.5
- **Icons**: react-old-icons 1.0.2
- **Font**: VT323 (Google Fonts)

## 📝 Development Guide

### Adding a New Page

1. Create new page in `src/app/` folder
2. Access taskbar state with `useWindow()` hook
3. Use `className="desktop"` for desktop styling

```tsx
'use client';

import { useWindow } from "@/contexts/WindowContext";

export default function NewPage() {
  const { setShowStartMenu } = useWindow();

  return (
    <main className="desktop" onClick={() => setShowStartMenu(false)}>
      {/* Page content */}
    </main>
  );
}
```

### Adding a New Popup Window

1. Create component in `src/components/` folder
2. Add state to `WindowContext`
3. Add rendering to `WindowManager.tsx`
4. Add button to `Taskbar.tsx`

## 🎯 Key Components

### WindowContext
Global window state management:
- `showExplorerWindow`, `showMusicPlayer`: Window visibility
- `explorerZIndex`, `musicZIndex`: Z-index management
- `windowPosition`, `musicWindowPosition`: Window positions
- `bringToFront()`: Bring window to front

### Taskbar
Common taskbar used across all pages:
- Start button and Start menu
- Window buttons for open windows
- Clock display

### ExplorerWindow
Main explorer window:
- About Me, Blog, Projects, Contact folders
- Draggable
- Navigation buttons (Back, Forward, Up)

### MusicPlayerWindow
Music player window:
- YouTube playlist
- Track selection dropdown
- Previous/next track navigation

## 📄 License

MIT

## 👨‍💻 Developer

Hyeryong - [hyeryong.dev](https://hyeryong.dev)

---

Made with ❤️ and nostalgia for Windows 98
