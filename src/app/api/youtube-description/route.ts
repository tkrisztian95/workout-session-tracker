import { NextResponse } from 'next/server';
import { parseYoutubeId } from '@/lib/youtube';
import { extractVideoInfo, infoFromPlayerObject, type VideoInfo } from '@/lib/youtubeExtract';
import type { YoutubeDescriptionErrorCode, YoutubeDescriptionSuccess } from '@/lib/youtubeApi';

/** Desktop UA for the watch-page fallback. */
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

/** UA for the InnerTube ANDROID client request. */
const ANDROID_UA = 'com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip';

/**
 * Public InnerTube API key for the web client. This is the same key shipped in
 * youtube.com's own page source — not a secret — and is what tools like yt-dlp
 * use to call the player endpoint.
 */
const INNERTUBE_KEY = 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8';

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

function withTimeout(): { signal: AbortSignal; done: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return { signal: controller.signal, done: () => clearTimeout(timer) };
}

/**
 * Primary source: YouTube's InnerTube player API. The ANDROID client returns the
 * full `videoDetails.shortDescription` as JSON and sidesteps the consent wall and
 * bot checks that a plain watch-page fetch hits. Returns `null` on any failure so
 * the caller can fall back to HTML scraping.
 */
async function fetchFromInnerTube(videoId: string): Promise<VideoInfo | null> {
  const { signal, done } = withTimeout();
  try {
    const res = await fetch(
      `https://www.youtube.com/youtubei/v1/player?key=${INNERTUBE_KEY}&prettyPrint=false`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': ANDROID_UA },
        body: JSON.stringify({
          videoId,
          context: {
            client: {
              clientName: 'ANDROID',
              clientVersion: '19.09.37',
              androidSdkVersion: 30,
              hl: 'en',
              gl: 'US',
            },
          },
        }),
        signal,
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    return infoFromPlayerObject(data);
  } catch {
    return null;
  } finally {
    done();
  }
}

/** Fallback source: scrape the watch-page HTML. */
async function fetchFromHtml(videoId: string): Promise<VideoInfo | null> {
  const { signal, done } = withTimeout();
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en-US,en;q=0.9',
        // Pre-set consent so EU requests aren't bounced to the consent wall.
        Cookie: 'CONSENT=YES+1; SOCS=CAI',
      },
      signal,
    });
    if (!res.ok) return null;
    return extractVideoInfo(await res.text());
  } catch {
    return null;
  } finally {
    done();
  }
}

/**
 * Resolve a pasted YouTube URL (or `?v=` id) to the video's title + full
 * description, fetched server-side so the browser is never blocked by CORS.
 *
 * Tries the InnerTube player API first (most reliable), then falls back to
 * scraping the watch page. Among whatever sources respond, prefers one that
 * actually carries a description.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('url') ?? searchParams.get('v') ?? '';
  const videoId = parseYoutubeId(input);
  if (!videoId) return errorResponse('invalid_url');

  const candidates: VideoInfo[] = [];

  const fromApi = await fetchFromInnerTube(videoId);
  if (fromApi) candidates.push(fromApi);

  // Only spend a second request when the API gave us nothing usable.
  if (!fromApi || !fromApi.description.trim()) {
    const fromHtml = await fetchFromHtml(videoId);
    if (fromHtml) candidates.push(fromHtml);
  }

  const usable = candidates.find((c) => c.description.trim() && !c.unavailable);
  if (usable) {
    const payload: YoutubeDescriptionSuccess = {
      videoId,
      title: usable.title,
      description: usable.description,
    };
    return NextResponse.json(payload);
  }

  if (candidates.length === 0) return errorResponse('fetch_failed');
  if (candidates.some((c) => c.unavailable)) return errorResponse('not_found');
  return errorResponse('no_description');
}
