'use client';

import { useRef } from 'react';
import { usePlayer } from '@/hooks/usePlayer';
import { useApiKeys } from '@/hooks/useApiKeys';
import { Visualizer } from './Visualizer';
import { EqWindow } from './EqWindow';
import { PlaylistWindow } from './PlaylistWindow';
import { SearchWindow } from './SearchWindow';
import { SettingsWindow } from './SettingsWindow';
import { YtPlayerWindow } from './YtPlayerWindow';
import { Slider } from './Slider';
import { MenuBar } from './MenuBar';
import { Track } from '@/types';

const fmtTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

const trackLabel = (t: Track, index: number) =>
  `${String(index + 1).padStart(2, '0')}. ${t.title} — ${t.artist}`;

export function WinampPlayer() {
  const {
    state, tracks, currentTrack, vizData,
    play, pause, stop, next, prev, seek,
    setVolume, setBalance, rewind, fastForward,
    toggleShuffle, toggleRepeat, toggleEq,
    toggleEqWin, togglePlWin, toggleSearchWin, toggleYtPlayerWin, toggleSettingsWin,
    playYouTube, setEqBand, addTracks, removeTrack, jumpTo,
  } = usePlayer();

  const { keys, saveKeys } = useApiKeys();

  const openPopup = () => {
    // Width: 275px player + scroll buffer; height: grows with open panels
    const w = 295;
    const h = 420;
    const left = Math.round(window.screen.width / 2 - w / 2);
    const top  = Math.round(window.screen.height / 2 - h / 2);
    window.open(
      '/popup',
      'winamp',
      `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no`
    );
  };
  const seekRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const seekPct = currentTrack.duration > 0
    ? (state.elapsed / currentTrack.duration) * 100 : 0;

  const handleSeekClick = (e: React.MouseEvent) => {
    if (!seekRef.current) return;
    const rect = seekRef.current.getBoundingClientRect();
    seek(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
  };

  const handleAddFiles = (files: FileList) => {
    const audioExts = /\.(mp3|ogg|wav|flac|aac|m4a|opus|weba)$/i;
    const fileArr = Array.from(files).filter(
      f => f.type.startsWith('audio/') || audioExts.test(f.name)
    );
    if (!fileArr.length) return;
    const wasEmpty = tracks.every(t => !t.src && !t.youtubeId && !t.appleMusicId);
    const insertIdx = tracks.length;

    fileArr.forEach((f, i) => {
      const src = URL.createObjectURL(f);
      const name = f.name.replace(/\.[^.]+$/, '');
      const parts = name.split(/\s*-\s*/);
      const buildTrack = (duration: number): Track => ({
        id: Date.now() + i + Math.random(),
        title: parts.length >= 2 ? parts.slice(1).join(' - ') : name,
        artist: parts.length >= 2 ? parts[0] : 'Unknown Artist',
        duration, kbps: 320, khz: 44, src, source: 'local',
      });
      const tmp = new Audio();
      tmp.preload = 'metadata';
      tmp.onloadedmetadata = () => {
        addTracks([buildTrack(Math.round(tmp.duration) || 180)]);
        if (i === 0 && wasEmpty) setTimeout(() => jumpTo(insertIdx), 100);
      };
      tmp.onerror = () => {
        addTracks([buildTrack(180)]);
        if (i === 0 && wasEmpty) setTimeout(() => jumpTo(insertIdx), 100);
      };
      tmp.src = src;
    });
  };

  const handleAddFromSearch = (track: Track) => addTracks([track]);

  const handlePlayNowFromSearch = (track: Track) => {
    const idx = tracks.length;
    addTracks([track]);
    setTimeout(() => {
      if (track.youtubeId) playYouTube(idx);
      else jumpTo(idx);
    }, 60);
  };

  const handleJump = (index: number) => {
    const t = tracks[index];
    if (t.youtubeId) playYouTube(index);
    else jumpTo(index);
  };

  const sourceLabel = () => {
    if (currentTrack.youtubeId) return <span className="wa-stat wa-stat-yt">▶ YT</span>;
    if (currentTrack.appleMusicId) return <span className="wa-stat wa-stat-am">♫ AM</span>;
    return <span className="wa-stat" style={{ color: '#004400' }}>stereo</span>;
  };

  const ytTrack = tracks[state.currentTrack];

  return (
    <div className="wa-stack">
      {/* ── Main window ── */}
      <div className="wa-window" role="main" aria-label="Winamp Media Player">
        <div className="wa-titlebar">
          <span className="wa-title-text">WINAMP</span>
          <div className="wa-winbtns">
            <button className="wa-winbtn" onClick={toggleEqWin}       title="Equalizer">E</button>
            <button className="wa-winbtn" onClick={togglePlWin}       title="Playlist">P</button>
            <button className="wa-winbtn" onClick={toggleSearchWin}   title="Search">S</button>
            <button className="wa-winbtn" onClick={toggleSettingsWin} title="Settings">⚙</button>
            <button className="wa-winbtn" onClick={openPopup} title="Pop out to window">⊞</button>
            <button className="wa-winbtn" title="Minimize">_</button>
            <button className="wa-winbtn" title="Close">×</button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.ogg,.wav,.flac,.aac,.m4a"
          multiple
          style={{ display: 'none' }}
          onChange={e => { if (e.target.files?.length) handleAddFiles(e.target.files); }}
        />
        <MenuBar
          onOpenPlaylist={togglePlWin}
          onOpenEq={toggleEqWin}
          onOpenSearch={toggleSearchWin}
          onOpenSettings={toggleSettingsWin}
          onAddFiles={() => { if (fileInputRef.current) { fileInputRef.current.value=''; fileInputRef.current.click(); } }}
        />

        <div className="wa-lcd" aria-label="Now playing display">
          <div className="wa-lcd-row">
            <div className="wa-lcd-left">
              <div className="wa-scroll-wrap">
                <span className={`wa-scroll-text ${state.status === 'stopped' ? 'stopped' : ''}`}>
                  {trackLabel(currentTrack, state.currentTrack)}
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  {trackLabel(currentTrack, state.currentTrack)}
                </span>
              </div>
              <div className="wa-stats">
                <span className="wa-stat"><strong>{currentTrack.kbps}</strong> kbps</span>
                <span className="wa-stat"><strong>{currentTrack.khz}</strong> khz</span>
                {sourceLabel()}
              </div>
            </div>
            <div className="wa-lcd-right">
              <div className={`wa-time ${state.status === 'paused' ? 'paused' : ''}`} aria-live="polite">
                {fmtTime(state.elapsed)}
              </div>
              <div className="wa-badges">
                <button className={`wa-badge ${state.shuffle ? 'on' : ''}`} onClick={toggleShuffle} aria-pressed={state.shuffle}>SHF</button>
                <button className={`wa-badge ${state.repeat  ? 'on' : ''}`} onClick={toggleRepeat}  aria-pressed={state.repeat}>REP</button>
              </div>
            </div>
          </div>
        </div>

        <Visualizer data={vizData} />

        <div className="wa-seek-row">
          <div ref={seekRef} className="wa-seek" onClick={handleSeekClick}
            role="slider" aria-valuenow={Math.round(seekPct)} aria-valuemin={0} aria-valuemax={100} aria-label="Seek">
            <div className="wa-seek-fill" style={{ width: `${seekPct}%` }}>
              <div className="wa-seek-thumb" />
            </div>
          </div>
        </div>

        <div className="wa-vol-row">
          <span className="wa-vol-label">VOL</span>
          <Slider value={state.volume}  onChange={setVolume}  fillClass="green" label="Volume" />
          <span className="wa-vol-label" style={{ textAlign: 'right' }}>BAL</span>
          <Slider value={state.balance} onChange={setBalance} fillClass="blue"  label="Balance" />
        </div>

        <div className="wa-controls">
          <button className="wa-btn" onClick={prev}        aria-label="Previous">⏮</button>
          <button className="wa-btn" onClick={rewind}      aria-label="Rewind">⏪</button>
          <button className={`wa-btn ${state.status === 'playing' ? 'active' : ''}`} onClick={() => play()} aria-label="Play">▶</button>
          <button className={`wa-btn ${state.status === 'paused'  ? 'active' : ''}`} onClick={pause}        aria-label="Pause">⏸</button>
          <button className={`wa-btn ${state.status === 'stopped' ? 'active' : ''}`} onClick={stop}         aria-label="Stop">⏹</button>
          <button className="wa-btn" onClick={fastForward} aria-label="Fast Forward">⏩</button>
          <button className="wa-btn" onClick={next}        aria-label="Next">⏭</button>
          <button className="wa-btn wa-btn-open" onClick={toggleSearchWin} style={{ marginLeft: 'auto', color: '#aaa', fontSize: '8px' }}>SEARCH</button>
        </div>
      </div>

      {/* ── YouTube embed ── */}
      {state.showYtPlayer && ytTrack?.youtubeId && (
        <YtPlayerWindow videoId={ytTrack.youtubeId} volume={state.volume} onEnded={next} onClose={toggleYtPlayerWin} />
      )}

      {/* ── EQ ── */}
      {state.showEq && (
        <EqWindow bands={state.eqBands} enabled={state.eqEnabled}
          onToggleEnabled={toggleEq} onBandChange={setEqBand} onClose={toggleEqWin} />
      )}

      {/* ── Playlist ── */}
      {state.showPlaylist && (
        <PlaylistWindow tracks={tracks} currentTrack={state.currentTrack}
          onJump={handleJump} onRemove={removeTrack} onClose={togglePlWin} onAddFiles={handleAddFiles} />
      )}

      {/* ── Search ── */}
      {state.showSearch && (
        <SearchWindow
          youtubeApiKey={keys.youtubeApiKey}
          appleMusicToken={keys.appleMusicDeveloperToken}
          onAddTrack={handleAddFromSearch}
          onPlayNow={handlePlayNowFromSearch}
          onClose={toggleSearchWin}
          onOpenSettings={() => { toggleSearchWin(); toggleSettingsWin(); }}
        />
      )}

      {/* ── Settings ── */}
      {state.showSettings && (
        <SettingsWindow keys={keys} onSave={saveKeys} onClose={toggleSettingsWin} />
      )}
    </div>
  );
}
