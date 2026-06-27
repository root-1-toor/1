import { YouTubeResult } from '@/types';

export function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return (parseInt(match[1] ?? '0') * 3600) +
         (parseInt(match[2] ?? '0') * 60) +
          parseInt(match[3] ?? '0');
}

export async function searchYouTube(query: string, apiKey: string): Promise<YouTubeResult[]> {
  if (!apiKey) throw new Error('NO_API_KEY');

  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
  searchUrl.searchParams.set('part', 'snippet');
  searchUrl.searchParams.set('type', 'video');
  searchUrl.searchParams.set('videoCategoryId', '10');
  searchUrl.searchParams.set('maxResults', '12');
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('key', apiKey);

  const res = await fetch(searchUrl.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `YouTube API error ${res.status}`);
  }
  const data = await res.json();
  const ids: string[] = data.items.map((i: any) => i.id?.videoId).filter(Boolean);
  if (!ids.length) return [];

  const videoUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
  videoUrl.searchParams.set('part', 'contentDetails');
  videoUrl.searchParams.set('id', ids.join(','));
  videoUrl.searchParams.set('key', apiKey);
  const vRes = await fetch(videoUrl.toString());
  const vData = await vRes.json();

  const durations: Record<string, string> = {};
  for (const v of vData.items ?? []) durations[v.id] = v.contentDetails?.duration ?? 'PT0S';

  return data.items
    .filter((item: any) => item.id?.videoId)
    .map((item: any): YouTubeResult => {
      const id = item.id.videoId;
      return {
        videoId: id,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails?.default?.url ?? '',
        duration: durations[id] ?? 'PT0S',
        durationSeconds: parseDuration(durations[id] ?? 'PT0S'),
      };
    });
}
