import { describe, expect, it } from 'vitest';
import { parseYoutubeId, isYoutubeUrl } from './youtube';

const ID = 'dQw4w9WgXcQ';

describe('parseYoutubeId', () => {
  it('returns a bare 11-char id unchanged', () => {
    expect(parseYoutubeId(ID)).toBe(ID);
  });

  it('parses a standard watch URL', () => {
    expect(parseYoutubeId(`https://www.youtube.com/watch?v=${ID}`)).toBe(ID);
  });

  it('parses a watch URL with extra query params and order', () => {
    expect(parseYoutubeId(`https://youtube.com/watch?list=PL123&v=${ID}&t=42s`)).toBe(ID);
  });

  it('parses a youtu.be short link', () => {
    expect(parseYoutubeId(`https://youtu.be/${ID}?t=10`)).toBe(ID);
  });

  it('parses a shorts URL', () => {
    expect(parseYoutubeId(`https://www.youtube.com/shorts/${ID}`)).toBe(ID);
  });

  it('parses an embed URL', () => {
    expect(parseYoutubeId(`https://www.youtube.com/embed/${ID}`)).toBe(ID);
  });

  it('parses /v/ URL', () => {
    expect(parseYoutubeId(`https://www.youtube.com/v/${ID}`)).toBe(ID);
  });

  it('parses mobile and music host variants', () => {
    expect(parseYoutubeId(`https://m.youtube.com/watch?v=${ID}`)).toBe(ID);
    expect(parseYoutubeId(`https://music.youtube.com/watch?v=${ID}`)).toBe(ID);
  });

  it('tolerates a scheme-less host', () => {
    expect(parseYoutubeId(`youtu.be/${ID}`)).toBe(ID);
  });

  it('trims surrounding whitespace', () => {
    expect(parseYoutubeId(`  https://youtu.be/${ID}  `)).toBe(ID);
  });

  it('returns null for non-YouTube hosts', () => {
    expect(parseYoutubeId(`https://vimeo.com/${ID}`)).toBeNull();
    expect(parseYoutubeId('https://example.com/watch?v=short')).toBeNull();
  });

  it('returns null for a watch URL with a malformed id', () => {
    expect(parseYoutubeId('https://www.youtube.com/watch?v=tooshort')).toBeNull();
  });

  it('returns null for empty or junk input', () => {
    expect(parseYoutubeId('')).toBeNull();
    expect(parseYoutubeId('   ')).toBeNull();
    expect(parseYoutubeId('not a url at all')).toBeNull();
    // @ts-expect-error guard against non-string input at runtime
    expect(parseYoutubeId(null)).toBeNull();
  });
});

describe('isYoutubeUrl', () => {
  it('is true for a valid link and false otherwise', () => {
    expect(isYoutubeUrl(`https://youtu.be/${ID}`)).toBe(true);
    expect(isYoutubeUrl('https://example.com')).toBe(false);
  });
});
