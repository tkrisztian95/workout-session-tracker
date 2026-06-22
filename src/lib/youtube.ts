/**
 * Pure helpers for working with YouTube links. Shared between the server route
 * (`/api/youtube-description`) and the client so both validate ids the same way.
 */

/** A YouTube video id is exactly 11 chars from this alphabet. */
const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/;

/**
 * Extract a YouTube video id from any of the common URL forms, or from a bare
 * id. Returns the 11-character id, or `null` when nothing recognizable is found.
 *
 * Supported inputs:
 * - `https://www.youtube.com/watch?v=<id>` (with any extra query params)
 * - `https://youtu.be/<id>`
 * - `https://www.youtube.com/shorts/<id>`
 * - `https://www.youtube.com/embed/<id>`
 * - `https://www.youtube.com/v/<id>`
 * - `https://m.youtube.com/...` and `music.youtube.com/...` variants
 * - a bare `<id>`
 */
export function parseYoutubeId(input: string): string | null {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (trimmed === '') return null;

  // Bare id.
  if (VIDEO_ID_RE.test(trimmed)) return trimmed;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    // Tolerate scheme-less input like "youtu.be/<id>".
    try {
      url = new URL(`https://${trimmed}`);
    } catch {
      return null;
    }
  }

  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  const isYoutubeHost =
    host === 'youtube.com' ||
    host === 'm.youtube.com' ||
    host === 'music.youtube.com' ||
    host === 'youtube-nocookie.com' ||
    host === 'youtu.be';
  if (!isYoutubeHost) return null;

  // youtu.be/<id>
  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    return id && VIDEO_ID_RE.test(id) ? id : null;
  }

  // watch?v=<id>
  const v = url.searchParams.get('v');
  if (v && VIDEO_ID_RE.test(v)) return v;

  // /shorts/<id>, /embed/<id>, /v/<id>
  const segments = url.pathname.split('/').filter(Boolean);
  if (segments.length >= 2 && ['shorts', 'embed', 'v'].includes(segments[0])) {
    const id = segments[1];
    if (VIDEO_ID_RE.test(id)) return id;
  }

  return null;
}

/** True when `input` resolves to a usable YouTube video id. */
export function isYoutubeUrl(input: string): boolean {
  return parseYoutubeId(input) !== null;
}
