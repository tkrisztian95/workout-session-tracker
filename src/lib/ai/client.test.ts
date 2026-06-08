import { afterEach, describe, expect, it, vi } from 'vitest';
import type { LlmConfig } from '../types';
import { callGemini, callLlm } from './client';

const geminiConfig: LlmConfig = {
  provider: 'gemini',
  apiKey: 'AIza-test-key',
  model: 'gemini-2.5-flash',
};

function mockFetch(impl: (url: string, init: RequestInit) => Response) {
  const fn = vi.fn((url: string, init: RequestInit) => Promise.resolve(impl(url, init)));
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('callGemini', () => {
  it('hits the generateContent endpoint with the key header and JSON mode', async () => {
    const fetchMock = mockFetch(
      () =>
        new Response(
          JSON.stringify({ candidates: [{ content: { parts: [{ text: '{"ok":true}' }] } }] }),
          { status: 200 },
        ),
    );

    const out = await callGemini(geminiConfig, 'system', 'user message');

    expect(out).toBe('{"ok":true}');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain(
      'generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    );
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('AIza-test-key');
    const body = JSON.parse(init.body as string);
    expect(body.generationConfig.responseMimeType).toBe('application/json');
    expect(body.system_instruction.parts[0].text).toBe('system');
    expect(body.contents[0].parts[0].text).toBe('user message');
  });

  it('joins multi-part responses', async () => {
    mockFetch(
      () =>
        new Response(
          JSON.stringify({
            candidates: [{ content: { parts: [{ text: '{"a":' }, { text: '1}' }] } }],
          }),
          { status: 200 },
        ),
    );
    expect(await callGemini(geminiConfig, 's', 'u')).toBe('{"a":1}');
  });

  it('maps a 400 invalid-key error to a friendly message', async () => {
    mockFetch(
      () =>
        new Response(
          JSON.stringify({ error: { status: 'INVALID_ARGUMENT', message: 'bad key' } }),
          {
            status: 400,
          },
        ),
    );
    await expect(callGemini(geminiConfig, 's', 'u')).rejects.toThrow(/Invalid API key/);
  });

  it('maps a 429 to a quota message', async () => {
    mockFetch(
      () =>
        new Response(
          JSON.stringify({ error: { status: 'RESOURCE_EXHAUSTED', message: 'slow down' } }),
          {
            status: 429,
          },
        ),
    );
    await expect(callGemini(geminiConfig, 's', 'u')).rejects.toThrow(/quota/i);
  });

  it('throws on an unexpected response shape', async () => {
    mockFetch(() => new Response(JSON.stringify({ candidates: [] }), { status: 200 }));
    await expect(callGemini(geminiConfig, 's', 'u')).rejects.toThrow(/Unexpected response format/);
  });
});

describe('callLlm', () => {
  it('routes gemini configs to the Gemini endpoint', async () => {
    const fetchMock = mockFetch(
      () =>
        new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: '{}' }] } }] }), {
          status: 200,
        }),
    );
    await callLlm(geminiConfig, 's', 'u');
    expect(fetchMock.mock.calls[0][0]).toContain('generativelanguage.googleapis.com');
  });

  it('routes openai configs to the OpenAI endpoint', async () => {
    const fetchMock = mockFetch(
      () =>
        new Response(JSON.stringify({ choices: [{ message: { content: '{}' } }] }), {
          status: 200,
        }),
    );
    await callLlm({ provider: 'openai', apiKey: 'sk-x', model: 'gpt-4o-mini' }, 's', 'u');
    expect(fetchMock.mock.calls[0][0]).toContain('api.openai.com');
  });
});
