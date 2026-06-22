/**
 * Shared types + client helper for the `/api/youtube-description` route, so the
 * route and the UI agree on the response/error shapes.
 */
import { parseYoutubeId } from './youtube';

export type YoutubeDescriptionErrorCode =
  | 'invalid_url'
  | 'not_found'
  | 'no_description'
  | 'fetch_failed';

export type YoutubeDescriptionSuccess = {
  videoId: string;
  title: string;
  description: string;
};

export type YoutubeDescriptionResponse =
  | YoutubeDescriptionSuccess
  | { error: YoutubeDescriptionErrorCode };

/** Error thrown by `fetchYoutubeDescription`, carrying the structured code. */
export class YoutubeDescriptionError extends Error {
  code: YoutubeDescriptionErrorCode;
  constructor(code: YoutubeDescriptionErrorCode) {
    super(code);
    this.code = code;
    this.name = 'YoutubeDescriptionError';
  }
}

/**
 * Call the server route to resolve a YouTube URL to its title + description.
 * Throws `YoutubeDescriptionError` with a structured code on failure.
 */
export async function fetchYoutubeDescription(url: string): Promise<YoutubeDescriptionSuccess> {
  // Validate client-side first so an obviously bad link never hits the network.
  if (!parseYoutubeId(url)) throw new YoutubeDescriptionError('invalid_url');

  let res: Response;
  try {
    res = await fetch(`/api/youtube-description?url=${encodeURIComponent(url)}`);
  } catch {
    throw new YoutubeDescriptionError('fetch_failed');
  }

  let body: YoutubeDescriptionResponse;
  try {
    body = (await res.json()) as YoutubeDescriptionResponse;
  } catch {
    throw new YoutubeDescriptionError('fetch_failed');
  }

  if (!res.ok || 'error' in body) {
    const code = 'error' in body ? body.error : 'fetch_failed';
    throw new YoutubeDescriptionError(code);
  }
  return body;
}
