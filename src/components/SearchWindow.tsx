'use client';

import { useState, useRef, useCallback } from 'react';
import { YouTubeResult, AppleMusicResult, Track } from '@/types';
import { searchYouTube } from '@/lib/youtube';
import { searchAppleMusic, loadMusicKit, authorizeMusicKit } from '@/lib/appleMusic';

interface SearchWindowProps {
  youtubeApiKey: string;
  appleMusicToken: string;
  onAddTrack: (track: Track) => void;
  onPlayNow: (track: Track) => void;
  onClose: () => void;
  onOpenSettings: () => void;
}

const fmtTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function decodeHtml(html: string) {
  if (typeof document === 'undefined') return html;
  const t = document.createElement('textarea');
  t.innerHTML = html;
  return t.value;
}

export function SearchWindow({
  youtubeApiKey, appleMusicToken,
  onAddTrack, onPlayNow, onClose, onOpenSettings,
}: SearchWindowProps) {
  const [tab, setTab] = useState<'youtube' | 'apple'>('youtube');
  const [query, setQuery] = useState('');
  const [ytResults, setYtResults] = useState<YouTubeResult[]>([]);
  const [amResults, setAmResults] = useState<AppleMusicResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [mkInstance, setMkInstance] = useState<any>(null);
  const [mkAuthed, setMkAuthed] = useState(false);
  const [mkLoading, setMkLoading] = useState(false);
  const previewRef = useRef<HTMLAudioElement | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  const doSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setYtResults([]);
    setAmResults([]);

    try {
      if (tab === 'youtube') {
        if (!youtubeApiKey) {
          setError('NO_API_KEY');
          return;
        }
        const results = await searchYouTube(query.trim(), youtubeApiKey);
        setYtResults(results);
        if (!results.length) setError('No results found.');
      } else {
        const results = await searchAppleMusic(query.trim());
        setAmResults(results);
        if (!results.length) setError('No results found.');
      }
    } catch (e: any) {
      setError(e.message ?? 'Search failed.');
    } finally {
      setLoading(false);
    }
  }, [query, tab, youtubeApiKey]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') doSearch();
  };

  // ── YouTube track helpers ───────────────────────────────────────────────
  const ytToTrack = (r: YouTubeResult): Track => ({
    id: Date.now() + Math.random(),
    title: decodeHtml(r.title),
    artist: r.channelTitle,
    duration: r.durationSeconds,
    kbps: 128, khz: 44,
    youtubeId: r.videoId,
    source: 'youtube',
  });

  // ── Apple Music helpers ─────────────────────────────────────────────────
  const amToTrack = (r: AppleMusicResult): Track => ({
    id: Date.now() + Math.random(),
    title: r.title,
    artist: r.artist,
    album: r.album,
    artwork: r.artwork,
    duration: Math.round(r.durationMs / 1000),
    kbps: 256, khz: 44,
    appleMusicId: r.id,
    src: r.previewUrl, // 30-sec preview as fallback
    source: 'apple',
  });

  const handlePreview = (r: AppleMusicResult) => {
    if (!r.previewUrl) return;
    if (previewingId === r.id) {
      previewRef.current?.pause();
      setPreviewingId(null);
      return;
    }
    if (previewRef.current) {
      previewRef.current.pause();
    }
    previewRef.current = new Audio(r.previewUrl);
    previewRef.current.volume = 0.8;
    previewRef.current.play().catch(() => {});
    previewRef.current.onended = () => setPreviewingId(null);
    setPreviewingId(r.id);
  };

  const handleAuthMusicKit = async () => {
    if (!appleMusicToken) { onOpenSettings(); return; }
    setMkLoading(true);
    try {
      const mk = await loadMusicKit(appleMusicToken);
      await authorizeMusicKit(mk);
      setMkInstance(mk);
      setMkAuthed(true);
    } catch (e: any) {
      setError('Apple Music auth failed: ' + e.message);
    } finally {
      setMkLoading(false);
    }
  };

  const markAdded = (id: string) => setAdded(prev => new Set(prev).add(id));

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="wa-window wa-search-win" role="region" aria-label="Search">
      <div className="wa-titlebar">
        <span className="wa-title-text">WINAMP — SEARCH</span>
        <div className="wa-winbtns">
          <button className="wa-winbtn" onClick={onOpenSettings} title="Settings">⚙</button>
          <button className="wa-winbtn" onClick={onClose} aria-label="Close">×</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="wa-search-tabs">
        <button
          className={`wa-search-tab ${tab === 'youtube' ? 'active' : ''}`}
          onClick={() => { setTab('youtube'); setError(''); setAmResults([]); setYtResults([]); }}
        >
          ▶ YOUTUBE
        </button>
        <button
          className={`wa-search-tab ${tab === 'apple' ? 'active' : ''}`}
          onClick={() => { setTab('apple'); setError(''); setAmResults([]); setYtResults([]); }}
        >
          ♫ APPLE MUSIC
        </button>
      </div>

      {/* Apple Music auth bar */}
      {tab === 'apple' && (
        <div className="wa-am-bar">
          {mkAuthed ? (
            <span className="wa-am-status on">✓ APPLE MUSIC CONNECTED — FULL PLAYBACK ENABLED</span>
          ) : (
            <>
              <span className="wa-am-status">PREVIEW MODE (30 SEC) —</span>
              <button className="wa-pl-btn wa-am-connect" onClick={handleAuthMusicKit} disabled={mkLoading}>
                {mkLoading ? 'CONNECTING...' : appleMusicToken ? 'CONNECT APPLE MUSIC' : 'ADD TOKEN IN SETTINGS'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Search bar */}
      <div className="wa-search-bar">
        <span className="wa-search-icon" style={{ color: tab === 'apple' ? '#fc3c44' : '#cc0000' }}>
          {tab === 'apple' ? '♫' : '▶'}
        </span>
        <input
          className="wa-search-input"
          type="text"
          placeholder={tab === 'youtube' ? 'SEARCH YOUTUBE...' : 'SEARCH APPLE MUSIC...'}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKey}
          autoFocus
        />
        <button className="wa-pl-btn" onClick={doSearch} disabled={loading}>
          {loading ? '...' : 'GO'}
        </button>
      </div>

      {/* Results */}
      <div className="wa-search-results">
        {loading && <div className="wa-search-status">SEARCHING...</div>}

        {!loading && error === 'NO_API_KEY' && (
          <div className="wa-search-error-box">
            <div className="wa-search-error-title">NO YOUTUBE API KEY</div>
            <div className="wa-search-error-body">
              Click the ⚙ button above to open Settings and add your key.
              <br /><br />
              Get one free at{' '}
              <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="wa-settings-link">
                console.cloud.google.com ↗
              </a>
              <br />
              Enable "YouTube Data API v3" → Credentials → Create API key
            </div>
            <button className="wa-pl-btn" style={{ marginTop: '8px' }} onClick={onOpenSettings}>
              OPEN SETTINGS
            </button>
          </div>
        )}

        {!loading && error && error !== 'NO_API_KEY' && (
          <div className="wa-search-status" style={{ color: '#884444' }}>{error}</div>
        )}

        {/* YouTube results */}
        {tab === 'youtube' && !loading && ytResults.map(r => (
          <div key={r.videoId} className="wa-search-result">
            <img className="wa-result-thumb" src={r.thumbnail} alt="" width={60} height={45} />
            <div className="wa-result-info">
              <div className="wa-result-title" title={decodeHtml(r.title)}>{decodeHtml(r.title)}</div>
              <div className="wa-result-meta">{r.channelTitle} · {fmtTime(r.durationSeconds)}</div>
            </div>
            <div className="wa-result-actions">
              <button className={`wa-pl-btn ${added.has(r.videoId) ? 'wa-added' : ''}`}
                onClick={() => { onAddTrack(ytToTrack(r)); markAdded(r.videoId); }}>
                {added.has(r.videoId) ? '✓' : '+ ADD'}
              </button>
              <button className="wa-pl-btn wa-play-now"
                onClick={() => { onPlayNow(ytToTrack(r)); markAdded(r.videoId); }}>
                ▶ PLAY
              </button>
            </div>
          </div>
        ))}

        {/* Apple Music results */}
        {tab === 'apple' && !loading && amResults.map(r => (
          <div key={r.id} className="wa-search-result">
            {r.artwork
              ? <img className="wa-result-thumb" src={r.artwork} alt="" width={60} height={60} />
              : <div className="wa-result-thumb wa-result-thumb-placeholder">♫</div>
            }
            <div className="wa-result-info">
              <div className="wa-result-title" title={r.title}>{r.title}</div>
              <div className="wa-result-meta">{r.artist} · {r.album}</div>
              <div className="wa-result-meta">{fmtTime(Math.round(r.durationMs / 1000))}</div>
            </div>
            <div className="wa-result-actions">
              {r.previewUrl && (
                <button
                  className={`wa-pl-btn ${previewingId === r.id ? 'wa-play-now' : ''}`}
                  onClick={() => handlePreview(r)}
                  title="30-sec preview"
                >
                  {previewingId === r.id ? '⏸ PREV' : '▶ PREV'}
                </button>
              )}
              <button className={`wa-pl-btn ${added.has(r.id) ? 'wa-added' : ''}`}
                onClick={() => { onAddTrack(amToTrack(r)); markAdded(r.id); }}>
                {added.has(r.id) ? '✓' : '+ ADD'}
              </button>
              {mkAuthed && (
                <button className="wa-pl-btn wa-play-now"
                  onClick={() => { onPlayNow(amToTrack(r)); markAdded(r.id); }}>
                  ▶ PLAY
                </button>
              )}
            </div>
          </div>
        ))}

        {!loading && !error && ytResults.length === 0 && amResults.length === 0 && (
          <div className="wa-search-status">ENTER A QUERY AND PRESS GO</div>
        )}
      </div>
    </div>
  );
}
