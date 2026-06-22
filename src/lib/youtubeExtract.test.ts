import { describe, expect, it } from 'vitest';
import { extractVideoInfo, infoFromPlayerObject } from './youtubeExtract';

function pageWithPlayerResponse(details: object, playabilityStatus = 'OK'): string {
  const player = JSON.stringify({
    playabilityStatus: { status: playabilityStatus },
    videoDetails: details,
  });
  return `<!DOCTYPE html><html><head><title>x</title></head><body>
    <script>var ytInitialPlayerResponse = ${player};</script>
    </body></html>`;
}

describe('extractVideoInfo', () => {
  it('extracts title and full description from the player response', () => {
    const description = 'Full Body Workout\n\n3x10 Squats\n3x12 Push-ups\n3x15 Lunges';
    const html = pageWithPlayerResponse({ title: 'Day 1 Workout', shortDescription: description });
    const info = extractVideoInfo(html);
    expect(info).not.toBeNull();
    expect(info?.title).toBe('Day 1 Workout');
    expect(info?.description).toBe(description);
    expect(info?.unavailable).toBe(false);
  });

  it('handles braces and quotes inside the description without truncating', () => {
    const description = 'Notes: {sets: 3} say "go" then \\ rest';
    const html = pageWithPlayerResponse({ title: 'T', shortDescription: description });
    expect(extractVideoInfo(html)?.description).toBe(description);
  });

  it('marks the video unavailable when playability status is not OK', () => {
    const html = pageWithPlayerResponse({ title: '', shortDescription: '' }, 'LOGIN_REQUIRED');
    expect(extractVideoInfo(html)?.unavailable).toBe(true);
  });

  it('reports an empty description when the player response lacks one', () => {
    const html = pageWithPlayerResponse({ title: 'No desc', shortDescription: '' });
    const info = extractVideoInfo(html);
    expect(info?.title).toBe('No desc');
    expect(info?.description).toBe('');
  });

  it('falls back to meta tags when there is no player response', () => {
    const html = `<html><head>
      <meta property="og:title" content="Meta Title">
      <meta name="description" content="Short meta description &amp; more">
      </head><body></body></html>`;
    const info = extractVideoInfo(html);
    expect(info?.title).toBe('Meta Title');
    expect(info?.description).toBe('Short meta description & more');
  });

  it('returns null when nothing usable is present', () => {
    expect(extractVideoInfo('<html><body>nothing here</body></html>')).toBeNull();
  });
});

describe('infoFromPlayerObject', () => {
  it('extracts title and description from an InnerTube player response', () => {
    const player = {
      playabilityStatus: { status: 'OK' },
      videoDetails: { title: 'Leg Day', shortDescription: '5x5 Squats\n3x8 Lunges' },
    };
    const info = infoFromPlayerObject(player);
    expect(info).toEqual({
      title: 'Leg Day',
      description: '5x5 Squats\n3x8 Lunges',
      unavailable: false,
    });
  });

  it('marks unavailable when status is not OK', () => {
    const player = {
      playabilityStatus: { status: 'LOGIN_REQUIRED' },
      videoDetails: {},
    };
    expect(infoFromPlayerObject(player)?.unavailable).toBe(true);
  });

  it('returns null when there is no title, description, or status', () => {
    expect(infoFromPlayerObject({})).toBeNull();
  });
});
