import { describe, it, expect, vi, afterEach } from 'vitest';
import { callOpenAI } from './client';
import type { LlmConfig } from '../types';

const config: LlmConfig = { provider: 'openai', apiKey: 'sk-test', model: 'gpt-4o-mini' };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('callOpenAI', () => {
  it('maps a network-level fetch failure to a friendly message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    );
    await expect(callOpenAI(config, 'system', 'user')).rejects.toThrow(
      /Could not reach the OpenAI API/,
    );
  });

  it('returns the message content on a successful response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({ choices: [{ message: { content: '{"ok":true}' } }] }), {
            status: 200,
          }),
        ),
      ),
    );
    await expect(callOpenAI(config, 'system', 'user')).resolves.toBe('{"ok":true}');
  });

  it('maps a 401 response to the invalid-API-key message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response('{}', { status: 401 }))),
    );
    await expect(callOpenAI(config, 'system', 'user')).rejects.toThrow(/Invalid API key/);
  });
});
