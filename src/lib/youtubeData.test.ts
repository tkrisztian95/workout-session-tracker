import { describe, expect, it } from 'vitest';
import { pickVideoSnippet, dataApiErrorReason } from './youtubeData';

describe('pickVideoSnippet', () => {
  it('extracts title and description from a videos.list response', () => {
    const data = {
      items: [
        {
          snippet: { title: 'Full Body Workout', description: '3x10 Squats\n3x12 Push-ups' },
        },
      ],
    };
    expect(pickVideoSnippet(data)).toEqual({
      title: 'Full Body Workout',
      description: '3x10 Squats\n3x12 Push-ups',
    });
  });

  it('returns null when there are no items (missing/private video)', () => {
    expect(pickVideoSnippet({ items: [] })).toBeNull();
    expect(pickVideoSnippet({})).toBeNull();
    expect(pickVideoSnippet(null)).toBeNull();
  });

  it('defaults missing snippet fields to empty strings', () => {
    expect(pickVideoSnippet({ items: [{ snippet: { title: 'Only title' } }] })).toEqual({
      title: 'Only title',
      description: '',
    });
  });
});

describe('dataApiErrorReason', () => {
  it('reads the first error reason', () => {
    const data = { error: { errors: [{ reason: 'quotaExceeded' }], message: 'Quota exceeded' } };
    expect(dataApiErrorReason(data)).toBe('quotaExceeded');
  });

  it('falls back to the message when no reason is present', () => {
    expect(dataApiErrorReason({ error: { message: 'API key not valid' } })).toBe(
      'API key not valid',
    );
  });

  it('returns undefined for an unrecognized shape', () => {
    expect(dataApiErrorReason({})).toBeUndefined();
    expect(dataApiErrorReason(null)).toBeUndefined();
  });
});
