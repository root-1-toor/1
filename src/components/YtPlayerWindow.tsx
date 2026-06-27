'use client';

import { useEffect, useRef } from 'react';

interface YtPlayerProps {
  videoId: string;
  volume: number; // 0–100
  onEnded: () => void;
  onClose: () => void;
}

export function YtPlayerWindow({ videoId, volume, onEnded, onClose }: YtPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Send volume via postMessage when it changes
  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func: 'setVolume', args: [volume] }),
      '*'
    );
  }, [volume]);

  // Listen for video ended event from YT iframe API
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        // YT iframe API sends playerState: 0 = ended
        if (data?.event === 'onStateChange' && data?.info === 0) {
          onEnded();
        }
      } catch {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onEnded]);

  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}&modestbranding=1&rel=0`;

  return (
    <div className="wa-window wa-yt-win" role="region" aria-label="YouTube Player">
      <div className="wa-titlebar">
        <span className="wa-title-text">NOW PLAYING — YOUTUBE</span>
        <div className="wa-winbtns">
          <button className="wa-winbtn" onClick={onClose} aria-label="Close player">×</button>
        </div>
      </div>
      <div className="wa-yt-body">
        <iframe
          ref={iframeRef}
          src={src}
          className="wa-yt-iframe"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="YouTube player"
        />
      </div>
    </div>
  );
}
