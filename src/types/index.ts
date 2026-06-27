export interface Track {
  id: number;
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  duration: number;
  kbps: number;
  khz: number;
  src?: string;
  youtubeId?: string;
  appleMusicId?: string;
  source?: 'local' | 'youtube' | 'apple';
}

export interface YouTubeResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  duration: string;
  durationSeconds: number;
}

export interface AppleMusicResult {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  durationMs: number;
  previewUrl?: string;
}

export type PlayerStatus = 'stopped' | 'playing' | 'paused';

export interface EqBand {
  label: string;
  gain: number;
}

export interface ApiKeys {
  youtubeApiKey: string;
  appleMusicDeveloperToken: string;
}

export interface PlayerState {
  status: PlayerStatus;
  currentTrack: number;
  elapsed: number;
  volume: number;
  balance: number;
  shuffle: boolean;
  repeat: boolean;
  eqEnabled: boolean;
  eqBands: EqBand[];
  showEq: boolean;
  showPlaylist: boolean;
  showSearch: boolean;
  showYtPlayer: boolean;
  showSettings: boolean;
  activeSearchTab: 'youtube' | 'apple';
}
