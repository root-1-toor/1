'use client';

import { Track } from '@/types';

interface PlaylistProps {
  tracks: Track[];
  currentTrack: number;
  onJump: (index: number) => void;
  onRemove: (index: number) => void;
  onClose: () => void;
  onAddFiles: (files: FileList) => void;
}

const fmtTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function PlaylistWindow({ tracks, currentTrack, onJump, onRemove, onClose, onAddFiles }: PlaylistProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) onAddFiles(e.dataTransfer.files);
  };

  const totalDuration = tracks.reduce((s, t) => s + t.duration, 0);

  return (
    <div
      className="wa-window"
      role="region"
      aria-label="Playlist"
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="wa-titlebar">
        <span className="wa-title-text">
          WINAMP PLAYLIST — {tracks.length} tracks / {fmtTime(totalDuration)}
        </span>
        <div className="wa-winbtns">
          <button className="wa-winbtn" onClick={onClose} aria-label="Close Playlist">×</button>
        </div>
      </div>

      <div className="wa-pl-body" role="listbox" aria-label="Tracks">
        {tracks.map((t, i) => (
          <div
            key={t.id}
            className={`wa-pl-item ${i === currentTrack ? 'active' : ''}`}
            onDoubleClick={() => onJump(i)}
            onClick={() => onJump(i)}
            role="option"
            aria-selected={i === currentTrack}
          >
            <span className="wa-pl-num">{String(i + 1).padStart(2, '0')}.</span>
            <span className="wa-pl-name" style={{ opacity: t.src || t.youtubeId ? 1 : 0.35 }}>
              {t.artist} - {t.title}
            </span>
            <span className="wa-pl-dur">{fmtTime(t.duration)}</span>
          </div>
        ))}

        {tracks.length === 0 && (
          <label className="wa-drop-hint wa-drop-label">
            [ CLICK OR DRAG MP3 FILES HERE ]
            <input
              type="file"
              accept="audio/*,.mp3,.ogg,.wav,.flac,.aac,.m4a"
              multiple
              style={{ display: 'none' }}
              onChange={e => e.target.files?.length && onAddFiles(e.target.files)}
            />
          </label>
        )}
      </div>

      <div className="wa-pl-controls">
        {/* Use <label> wrapping the input — guaranteed to open file picker */}
        <label className="wa-pl-btn" style={{ cursor: 'pointer' }}>
          + FILE
          <input
            type="file"
            accept="audio/*,.mp3,.ogg,.wav,.flac,.aac,.m4a"
            multiple
            style={{ display: 'none' }}
            onChange={e => e.target.files?.length && onAddFiles(e.target.files)}
          />
        </label>
        <button className="wa-pl-btn" onClick={() => onRemove(currentTrack)}>REM</button>
        <button className="wa-pl-btn">SEL ALL</button>
        <button className="wa-pl-btn">SORT</button>
        <button className="wa-pl-btn">CLR</button>
      </div>
    </div>
  );
}
