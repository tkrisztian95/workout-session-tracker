import { NextResponse } from 'next/server';
import { parseYoutubeId } from '@/lib/youtube';
import { extractVideoInfo } from '@/lib/youtubeExtract';
import type { YoutubeDescriptionErrorCode, YoutubeDescriptionSuccess } from '@/lib/youtubeApi';

/** Desktop UA so YouTube serves the full watch page (with player response). */
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const FETCH_TIMEOUT_MS = 8000;

const STATUS_BY_CODE: Record<YoutubeDescriptionErrorCode, number> = {
  invalid_url: 400,
  not_found: 404,
  no_description: 422,
  fetch_failed: 502,
};

function errorResponse(code: YoutubeDescriptionErrorCode) {
  return NextResponse.json({ error: code }, { status: STATUS_BY_CODE[code] });
}

/**
 * Resolve a pasted YouTube URL (or `?v=` id) to the video's title + full
 * description, fetched server-side so the browser is never blocked by CORS.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('url') ?? searchParams.get('v') ?? '';
  const videoId = parseYoutubeId(input);
  if (!videoId) return errorResponse('invalid_url');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let html: string;
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
    });
    if (res.status === 404) return errorResponse('not_found');
    if (!res.ok) return errorResponse('fetch_failed');
    html = await res.text();
  } catch {
    return errorResponse('fetch_failed');
  } finally {
    clearTimeout(timeout);
  }

  const info = extractVideoInfo(html);
  if (!info) return errorResponse('fetch_failed');
  if (info.unavailable) return errorResponse('not_found');
  if (!info.description.trim()) return errorResponse('no_description');

  const payload: YoutubeDescriptionSuccess = {
    videoId,
    title: info.title,
    description: info.description,
  };
  return NextResponse.json(payload);
}
