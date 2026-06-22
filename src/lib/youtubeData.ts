/**
 * Pure parsing of the YouTube Data API v3 `videos.list?part=snippet` response.
 * Kept side-effect free so it can be unit-tested without a network call.
 */

export type DataApiVideo = {
  title: string;
  description: string;
};

/**
 * Pick the title + description from a `videos.list` response. Returns `null`
 * when the response has no items (video missing, private, or deleted).
 */
export function pickVideoSnippet(data: unknown): DataApiVideo | null {
  const items = (data as { items?: unknown })?.items;
  if (!Array.isArray(items) || items.length === 0) return null;

  const snippet = (items[0] as { snippet?: { title?: unknown; description?: unknown } })?.snippet;
  if (!snippet) return null;

  return {
    title: typeof snippet.title === 'string' ? snippet.title : '',
    description: typeof snippet.description === 'string' ? snippet.description : '',
  };
}

/**
 * Extract a human-readable error reason from a Data API error body, for logging.
 * Returns `undefined` when the shape isn't recognized.
 */
export function dataApiErrorReason(data: unknown): string | undefined {
  const error = (data as { error?: { errors?: Array<{ reason?: unknown }>; message?: unknown } })
    ?.error;
  const reason = error?.errors?.[0]?.reason;
  if (typeof reason === 'string') return reason;
  if (typeof error?.message === 'string') return error.message;
  return undefined;
}
