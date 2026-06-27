import { AppleMusicResult } from '@/types';

// ── iTunes Search API (no auth needed, public) ────────────────────────────
// Used for search results & previews. MusicKit JS is used for full playback.
export async function searchAppleMusic(query: string): Promise<AppleMusicResult[]> {
  const url = new URL('https://itunes.apple.com/search');
  url.searchParams.set('term', query);
  url.searchParams.set('media', 'music');
  url.searchParams.set('entity', 'song');
  url.searchParams.set('limit', '12');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`iTunes search failed: ${res.status}`);
  const data = await res.json();

  return (data.results ?? []).map((r: any): AppleMusicResult => ({
    id: String(r.trackId),
    title: r.trackName,
    artist: r.artistName,
    album: r.collectionName,
    artwork: (r.artworkUrl100 ?? '').replace('100x100', '60x60'),
    durationMs: r.trackTimeMillis ?? 0,
    previewUrl: r.previewUrl,
  }));
}

// ── MusicKit JS integration ───────────────────────────────────────────────
declare global {
  interface Window {
    MusicKit?: any;
  }
}

let mkLoaded = false;

export async function loadMusicKit(developerToken: string): Promise<any> {
  if (!developerToken) throw new Error('NO_DEVELOPER_TOKEN');

  // Load MusicKit JS if not already loaded
  if (!mkLoaded) {
    await new Promise<void>((resolve, reject) => {
      if (window.MusicKit) { mkLoaded = true; resolve(); return; }
      const script = document.createElement('script');
      script.src = 'https://js-cdn.music.apple.com/musickit/v3/musickit.js';
      script.onload = () => { mkLoaded = true; resolve(); };
      script.onerror = () => reject(new Error('Failed to load MusicKit JS'));
      document.head.appendChild(script);
    });
  }

  const mk = await window.MusicKit.configure({
    developerToken,
    app: { name: 'Winamp', build: '1.0.0' },
  });

  return mk;
}

export async function authorizeMusicKit(mk: any): Promise<string> {
  const userToken = await mk.authorize();
  return userToken;
}

export async function playAppleMusicTrack(mk: any, id: string): Promise<void> {
  await mk.setQueue({ song: id });
  await mk.play();
}
