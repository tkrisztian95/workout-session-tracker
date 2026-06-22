import { NextResponse } from 'next/server';
import { parseYoutubeId } from '@/lib/youtube';
import { pickVideoSnippet, dataApiErrorReason } from '@/lib/youtubeData';
import type { YoutubeDescriptionErrorCode, YoutubeDescriptionSuccess } from '@/lib/youtubeApi';

const FETCH_TIMEOUT_MS = 8000;

const STATUS_BY_CODE: Record<YoutubeDescriptionErrorCode, number> = {
  invalid_url: 400,
  not_configured: 500,
  not_found: 404,
  no_description: 422,
  fetch_failed: 502,
};

function errorResponse(code: YoutubeDescriptionErrorCode) {
  return NextResponse.json({ error: code }, { status: STATUS_BY_CODE[code] });
}

/**
 * Resolve a pasted YouTube URL (or `?v=` id) to the video's title + full
 * description via the YouTube Data API v3.
 *
 * The API key lives in the server-only `YOUTUBE_API_KEY` env var, so it is never
 * shipped to the browser. The route exists to keep the key server-side; the Data
 * API itself is CORS-enabled.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('url') ?? searchParams.get('v') ?? '';
  const videoId = parseYoutubeId(input);
  if (!videoId) return errorResponse('invalid_url');

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn('[youtube-description] YOUTUBE_API_KEY is not set');
    return errorResponse('not_configured');
  }

  const endpoint = new URL('https://www.googleapis.com/youtube/v3/videos');
  endpoint.searchParams.set('part', 'snippet');
  endpoint.searchParams.set('id', videoId);
  endpoint.searchParams.set('key', apiKey);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let data: unknown;
  try {
    const res = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    data = await res.json().catch(() => undefined);
    if (!res.ok) {
      console.warn(
        `[youtube-description] Data API HTTP ${res.status} reason=${dataApiErrorReason(data) ?? 'unknown'}`,
      );
      return errorResponse('fetch_failed');
    }
  } catch (err) {
    console.warn('[youtube-description] Data API request failed:', (err as Error).message);
    return errorResponse('fetch_failed');
  } finally {
    clearTimeout(timeout);
  }

  const video = pickVideoSnippet(data);
  if (!video) return errorResponse('not_found');
  if (!video.description.trim()) return errorResponse('no_description');

  const payload: YoutubeDescriptionSuccess = {
    videoId,
    title: video.title,
    description: video.description,
  };
  return NextResponse.json(payload);
}
