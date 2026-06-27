# 🎵 Winamp — Next.js + TypeScript

Classic Winamp 2.x media player, rebuilt with Next.js 14 and TypeScript.

## Features

- 🎨 Pixel-perfect Winamp 2.9 titanium skin
- 📊 Animated spectrum visualizer
- 📋 Playlist editor (drag & drop MP3 files!)
- 🎚 11-band equalizer with draggable knobs
- ⏭ Full transport controls (play, pause, stop, seek, rewind, FF)
- 🔀 Shuffle & repeat modes
- 🔊 Volume & balance sliders
- 📂 Load your own local MP3 files via the playlist

## Quick Start

### Prerequisites
- Node.js 18+ installed ([nodejs.org](https://nodejs.org))

### Install & run

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open your browser
#    → http://localhost:3000
```

### Production build

```bash
npm run build
npm start
```

## Playing Your Own Music

1. Click the **P** button (top-right of the player) to open the Playlist
2. Click **+ FILE** or drag & drop MP3/audio files into the playlist
3. Double-click any track to play it

> **Note:** The player ships with a demo playlist of classic late-90s tracks  
> (no audio files included — add your own!). When you load your own files,  
> actual audio playback is supported via the Web Audio API.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx       # Root layout + CSS import
│   ├── page.tsx         # Entry point
│   └── winamp.css       # Full retro skin styles
├── components/
│   ├── WinampPlayer.tsx # Main player window
│   ├── EqWindow.tsx     # Equalizer
│   ├── PlaylistWindow.tsx
│   ├── Visualizer.tsx
│   └── Slider.tsx
├── hooks/
│   └── usePlayer.ts     # All state & audio logic
├── data/
│   └── tracks.ts        # Demo track list
└── types/
    └── index.ts         # TypeScript types
```

## Keyboard Shortcuts (coming soon)

| Key | Action |
|-----|--------|
| Space | Play / Pause |
| Z | Previous |
| X | Play |
| C | Pause |
| V | Stop |
| B | Next |

---

Built with ❤️ and nostalgia. *It really whips the llama's ass.*
