'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { EqBand, PlayerState, Track } from '@/types';
import { TRACKS } from '@/data/tracks';

const DEFAULT_EQ_BANDS: EqBand[] = [
  { label: 'PRE', gain: 0 },
  { label: '60',  gain: 3 },
  { label: '170', gain: -2 },
  { label: '310', gain: 5 },
  { label: '600', gain: 2 },
  { label: '1K',  gain: -1 },
  { label: '3K',  gain: 4 },
  { label: '6K',  gain: 3 },
  { label: '12K', gain: -2 },
  { label: '14K', gain: 1 },
  { label: '16K', gain: 2 },
];

const INIT: PlayerState = {
  status: 'stopped',
  currentTrack: 0,
  elapsed: 0,
  volume: 75,
  balance: 50,
  shuffle: true,
  repeat: false,
  eqEnabled: true,
  eqBands: DEFAULT_EQ_BANDS,
  showEq: false,
  showPlaylist: false,
  showSearch: false,
  showYtPlayer: false,
  showSettings: false,
  activeSearchTab: 'youtube',
};

export function usePlayer() {
  const [state, setState] = useState<PlayerState>(INIT);
  const [tracks, setTracks] = useState<Track[]>(TRACKS);
  const [vizData, setVizData] = useState<number[]>(new Array(20).fill(2));

  // Keep a ref to the live tracks array so callbacks always see current value
  const tracksRef = useRef<Track[]>(TRACKS);
  useEffect(() => { tracksRef.current = tracks; }, [tracks]);

  // The actual HTMLAudioElement — created once on mount
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = INIT.volume / 100;
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const stateRef = useRef<PlayerState>(INIT);
  useEffect(() => { stateRef.current = state; }, [state]);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const vizRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTick = () => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
  };

  // ── Viz animation ──────────────────────────────────────────────────────────
  useEffect(() => {
    vizRef.current = setInterval(() => {
      setVizData(prev =>
        prev.map(v => {
          if (stateRef.current.status !== 'playing') return Math.max(2, v - 3);
          const target = Math.random() * 24 + 2;
          return Math.round(v * 0.45 + target * 0.55);
        })
      );
    }, 80);
    return () => { if (vizRef.current) clearInterval(vizRef.current); };
  }, []);

  // ── Core play logic (uses refs, never stale) ───────────────────────────────
  const playTrack = useCallback((idx: number, startAt = 0) => {
    const track = tracksRef.current[idx];
    if (!track) return;

    clearTick();

    // Update state
    setState(prev => ({
      ...prev,
      status: 'playing',
      currentTrack: idx,
      elapsed: startAt,
      showYtPlayer: !!track.youtubeId,
    }));

    // Drive the elapsed timer
    let elapsed = startAt;
    tickRef.current = setInterval(() => {
      elapsed += 1;
      const duration = tracksRef.current[idx]?.duration ?? 0;

      if (elapsed >= duration) {
        clearTick();
        // Auto-advance
        const s = stateRef.current;
        if (s.repeat) {
          playTrack(idx, 0);
        } else {
          const nextIdx = s.shuffle
            ? Math.floor(Math.random() * tracksRef.current.length)
            : (idx + 1) % tracksRef.current.length;
          playTrack(nextIdx, 0);
        }
        return;
      }

      setState(prev => ({ ...prev, elapsed }));
    }, 1000);

    // Real audio element for local files
    const audio = audioRef.current;
    if (audio && track.src && !track.youtubeId) {
      audio.pause();
      audio.src = track.src;
      audio.volume = stateRef.current.volume / 100;
      audio.load();
      audio.addEventListener('canplay', () => {
        if (startAt > 0) audio.currentTime = startAt;
        audio.play().catch(err => console.warn('Audio play failed:', err));
      }, { once: true });
    } else if (audio && !track.src && !track.youtubeId) {
      audio.pause();
    }
  }, []);

  // ── Public controls ────────────────────────────────────────────────────────
  const play = useCallback((trackIndex?: number) => {
    const idx = trackIndex ?? stateRef.current.currentTrack;
    const elapsed = trackIndex !== undefined ? 0 : stateRef.current.elapsed;
    playTrack(idx, elapsed);
  }, [playTrack]);

  const pause = useCallback(() => {
    const s = stateRef.current;
    if (s.status === 'playing') {
      clearTick();
      audioRef.current?.pause();
      setState(prev => ({ ...prev, status: 'paused' }));
    } else if (s.status === 'paused') {
      playTrack(s.currentTrack, s.elapsed);
    }
  }, [playTrack]);

  const stop = useCallback(() => {
    clearTick();
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setState(prev => ({ ...prev, status: 'stopped', elapsed: 0 }));
  }, []);

  const next = useCallback(() => {
    const s = stateRef.current;
    const idx = s.shuffle
      ? Math.floor(Math.random() * tracksRef.current.length)
      : (s.currentTrack + 1) % tracksRef.current.length;
    playTrack(idx, 0);
  }, [playTrack]);

  const prev = useCallback(() => {
    const s = stateRef.current;
    if (s.elapsed > 3) {
      playTrack(s.currentTrack, 0);
      return;
    }
    const idx = (s.currentTrack - 1 + tracksRef.current.length) % tracksRef.current.length;
    playTrack(idx, 0);
  }, [playTrack]);

  const seek = useCallback((pct: number) => {
    const s = stateRef.current;
    const track = tracksRef.current[s.currentTrack];
    const newElapsed = Math.round(pct * (track?.duration ?? 0));
    if (s.status === 'playing') {
      playTrack(s.currentTrack, newElapsed);
    } else {
      setState(prev => ({ ...prev, elapsed: newElapsed }));
      if (audioRef.current) audioRef.current.currentTime = newElapsed;
    }
  }, [playTrack]);

  const setVolume = useCallback((vol: number) => {
    setState(prev => ({ ...prev, volume: vol }));
    if (audioRef.current) audioRef.current.volume = vol / 100;
  }, []);

  const setBalance = useCallback((bal: number) => {
    setState(prev => ({ ...prev, balance: bal }));
  }, []);

  const rewind = useCallback(() => {
    const s = stateRef.current;
    const newElapsed = Math.max(0, s.elapsed - 10);
    setState(prev => ({ ...prev, elapsed: newElapsed }));
    if (audioRef.current) audioRef.current.currentTime = newElapsed;
  }, []);

  const fastForward = useCallback(() => {
    const s = stateRef.current;
    const track = tracksRef.current[s.currentTrack];
    const newElapsed = Math.min((track?.duration ?? 0) - 1, s.elapsed + 10);
    setState(prev => ({ ...prev, elapsed: newElapsed }));
    if (audioRef.current) audioRef.current.currentTime = newElapsed;
  }, []);

  const jumpTo = useCallback((index: number) => {
    playTrack(index, 0);
  }, [playTrack]);

  const playYouTube = useCallback((trackIndex: number) => {
    playTrack(trackIndex, 0);
  }, [playTrack]);

  // ── Toggles ────────────────────────────────────────────────────────────────
  const toggleShuffle     = () => setState(p => ({ ...p, shuffle: !p.shuffle }));
  const toggleRepeat      = () => setState(p => ({ ...p, repeat: !p.repeat }));
  const toggleEq          = () => setState(p => ({ ...p, eqEnabled: !p.eqEnabled }));
  const toggleEqWin       = () => setState(p => ({ ...p, showEq: !p.showEq }));
  const togglePlWin       = () => setState(p => ({ ...p, showPlaylist: !p.showPlaylist }));
  const toggleSearchWin   = () => setState(p => ({ ...p, showSearch: !p.showSearch }));
  const toggleYtPlayerWin  = () => setState(p => ({ ...p, showYtPlayer: !p.showYtPlayer }));
  const toggleSettingsWin  = () => setState(p => ({ ...p, showSettings: !p.showSettings }));

  const setEqBand = (index: number, gain: number) => {
    setState(p => {
      const bands = [...p.eqBands];
      bands[index] = { ...bands[index], gain };
      return { ...p, eqBands: bands };
    });
  };

  // ── Track list management ──────────────────────────────────────────────────
  const addTracks = useCallback((newTracks: Track[]) => {
    setTracks(prev => [...prev, ...newTracks]);
  }, []);

  const removeTrack = useCallback((index: number) => {
    setTracks(prev => prev.filter((_, i) => i !== index));
    setState(p => ({
      ...p,
      currentTrack: p.currentTrack >= index && p.currentTrack > 0
        ? p.currentTrack - 1
        : p.currentTrack,
    }));
  }, []);

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => () => clearTick(), []);

  const currentTrack = tracks[state.currentTrack];

  const fmtTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return {
    state, tracks, currentTrack, vizData, audioRef, fmtTime,
    play, pause, stop, next, prev, seek,
    setVolume, setBalance, rewind, fastForward,
    toggleShuffle, toggleRepeat, toggleEq,
    toggleEqWin, togglePlWin, toggleSearchWin, toggleYtPlayerWin, toggleSettingsWin,
    playYouTube, setEqBand, addTracks, removeTrack, jumpTo,
  };
}
