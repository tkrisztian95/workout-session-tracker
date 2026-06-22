import { NextResponse } from 'next/server';
import { parseYoutubeId } from '@/lib/youtube';
import { extractVideoInfo, infoFromPlayerObject, type VideoInfo } from '@/lib/youtubeExtract';
import type { YoutubeDescriptionErrorCode, YoutubeDescriptionSuccess } from '@/lib/youtubeApi';

/** Desktop UA for the watch-page fallback. */
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

/**
 * Public InnerTube API key for the web client. This is the same key shipped in
 * youtube.com's own page source — not a secret — and is what tools like yt-dlp
 * use to call the player endpoint.
 */
const INNERTUBE_KEY = 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8';

const FETCH_TIMEOUT_MS = 8000;

/**
 * InnerTube clients to try, in order. Different clients have different
 * anti-bot behavior; the iOS/Android player clients reliably include
 * `videoDetails.shortDescription` even when playback is otherwise restricted.
 */
const INNERTUBE_CLIENTS = [
  {
    name: 'IOS',
    userAgent: 'com.google.ios.youtube/19.45.4 (iPhone16,2; U; CPU iOS 18_1_0 like Mac OS X)',
    context: {
      clientName: 'IOS',
      clientVersion: '19.45.4',
      deviceModel: 'iPhone16,2',
      hl: 'en',
      gl: 'US',
    },
  },
  {
    name: 'ANDROID',
    userAgent: 'com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip',
    context: {
      clientName: 'ANDROID',
      clientVersion: '19.09.37',
      androidSdkVersion: 30,
      hl: 'en',
      gl: 'US',
    },
  },
] as const;

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

/** One InnerTube player request for the given client. */
async function fetchFromInnerTube(
  videoId: string,
  client: (typeof INNERTUBE_CLIENTS)[number],
): Promise<VideoInfo | null> {
  const { signal, done } = withTimeout();
  try {
    const res = await fetch(
      `https://www.youtube.com/youtubei/v1/player?key=${INNERTUBE_KEY}&prettyPrint=false`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': client.userAgent },
        body: JSON.stringify({ videoId, context: { client: client.context } }),
        signal,
      },
    );
    if (!res.ok) {
      console.warn(`[youtube-description] InnerTube ${client.name} HTTP ${res.status}`);
      return null;
    }
    const data = (await res.json()) as Record<string, unknown>;
    const status = (data.playabilityStatus as { status?: string } | undefined)?.status;
    const info = infoFromPlayerObject(data);
    console.warn(
      `[youtube-description] InnerTube ${client.name} status=${status} descLen=${info?.description.length ?? 0}`,
    );
    return info;
  } catch (err) {
    console.warn(`[youtube-description] InnerTube ${client.name} error:`, (err as Error).message);
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
    if (!res.ok) {
      console.warn(`[youtube-description] HTML HTTP ${res.status}`);
      return null;
    }
    const info = extractVideoInfo(await res.text());
    console.warn(`[youtube-description] HTML descLen=${info?.description.length ?? 0}`);
    return info;
  } catch (err) {
    console.warn(`[youtube-description] HTML error:`, (err as Error).message);
    return null;
  } finally {
    done();
  }
}

/**
 * Resolve a pasted YouTube URL (or `?v=` id) to the video's title + full
 * description, fetched server-side so the browser is never blocked by CORS.
 *
 * Tries the InnerTube player API across a couple of clients, then falls back to
 * scraping the watch page. A description is used whenever one is present — even
 * if `playabilityStatus` is not `OK`, because YouTube still returns the public
 * description for age/region-restricted videos.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('url') ?? searchParams.get('v') ?? '';
  const videoId = parseYoutubeId(input);
  if (!videoId) return errorResponse('invalid_url');

  const candidates: VideoInfo[] = [];

  for (const client of INNERTUBE_CLIENTS) {
    const info = await fetchFromInnerTube(videoId, client);
    if (info) candidates.push(info);
    // Stop as soon as we have an actual description.
    if (info?.description.trim()) break;
  }

  if (!candidates.some((c) => c.description.trim())) {
    const fromHtml = await fetchFromHtml(videoId);
    if (fromHtml) candidates.push(fromHtml);
  }

  // Use any description we found, regardless of playability status.
  const usable = candidates.find((c) => c.description.trim());
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
