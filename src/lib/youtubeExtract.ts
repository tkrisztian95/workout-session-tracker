/**
 * Server-side extraction of a YouTube video's title and description from the
 * watch-page HTML. Kept pure (no network, no node APIs) so it can be unit-tested
 * against captured fixtures. Used only by the `/api/youtube-description` route.
 */

export type VideoInfo = {
  title: string;
  description: string;
  /** True when the page indicates the video is private/removed/unplayable. */
  unavailable: boolean;
};

/**
 * Scan from the first `{` at/after `markerEnd` and return the balanced JSON
 * object substring, respecting strings and escapes. Returns null if no
 * balanced object is found.
 */
function readBalancedObject(html: string, markerEnd: number): string | null {
  const start = html.indexOf('{', markerEnd);
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
    } else if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) return html.slice(start, i + 1);
    }
  }
  return null;
}

/**
 * Parse the `ytInitialPlayerResponse` object embedded in the watch page. This
 * carries the full, untruncated description (`videoDetails.shortDescription`).
 */
function parsePlayerResponse(html: string): Record<string, unknown> | null {
  const marker = 'ytInitialPlayerResponse';
  const idx = html.indexOf(marker);
  if (idx === -1) return null;
  const eq = html.indexOf('=', idx);
  if (eq === -1) return null;
  const json = readBalancedObject(html, eq);
  if (!json) return null;
  try {
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function metaContent(html: string, attr: 'name' | 'property', key: string): string | undefined {
  const re = new RegExp(`<meta[^>]+${attr}=["']${key}["'][^>]*content=["']([^"']*)["']`, 'i');
  const m = html.match(re);
  if (m?.[1]) return decodeHtmlEntities(m[1]);
  // Try the reverse attribute order (content before name/property).
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*${attr}=["']${key}["']`, 'i');
  const m2 = html.match(re2);
  return m2?.[1] ? decodeHtmlEntities(m2[1]) : undefined;
}

/**
 * Extract the video title + description from watch-page HTML.
 *
 * Strategy: prefer the embedded player-response JSON (full description); fall
 * back to `og:`/meta tags (truncated). Returns `null` only when neither the
 * player response nor any title/description metadata can be found at all.
 */
export function extractVideoInfo(html: string): VideoInfo | null {
  const player = parsePlayerResponse(html);

  if (player) {
    const playability = player.playabilityStatus as { status?: string } | undefined;
    const status = playability?.status;
    const unavailable = typeof status === 'string' && status !== 'OK';

    const details = player.videoDetails as
      | { title?: string; shortDescription?: string }
      | undefined;
    const title = typeof details?.title === 'string' ? details.title : '';
    const description =
      typeof details?.shortDescription === 'string' ? details.shortDescription : '';

    if (title || description || unavailable) {
      return { title, description, unavailable };
    }
  }

  // Fallback to meta tags.
  const metaTitle = metaContent(html, 'property', 'og:title') ?? metaContent(html, 'name', 'title');
  const metaDescription =
    metaContent(html, 'property', 'og:description') ?? metaContent(html, 'name', 'description');

  if (metaTitle || metaDescription) {
    return {
      title: metaTitle ?? '',
      description: metaDescription ?? '',
      unavailable: false,
    };
  }

  return null;
}
