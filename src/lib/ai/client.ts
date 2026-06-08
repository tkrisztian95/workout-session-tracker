import type { LlmConfig } from '../types';

export async function callOpenAI(
  config: LlmConfig,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    let code = '';
    let detail = '';
    try {
      const err = await response.json();
      code = err?.error?.code ?? '';
      detail = err?.error?.message ?? '';
    } catch {
      // ignore
    }
    if (code === 'insufficient_quota') {
      throw new Error(
        'Your OpenAI account has no credits. https://platform.openai.com/settings/organization/billing/overview',
      );
    }
    if (response.status === 401) {
      throw new Error('Invalid API key. Check your key at https://platform.openai.com/api-keys.');
    }
    throw new Error(`OpenAI API error ${response.status}${detail ? `: ${detail}` : ''}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('Unexpected response format from OpenAI API');
  }
  return content;
}

export async function callGemini(
  config: LlmConfig,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      config.model,
    )}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Header rather than the URL query string so the key doesn't leak into logs.
        'x-goog-api-key': config.apiKey,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        // Gemini's structured-JSON switch — the analogue of OpenAI's json_object mode.
        generationConfig: { responseMimeType: 'application/json' },
      }),
    },
  );

  if (!response.ok) {
    let status = '';
    let detail = '';
    try {
      const err = await response.json();
      status = err?.error?.status ?? '';
      detail = err?.error?.message ?? '';
    } catch {
      // ignore
    }
    if (response.status === 429 || status === 'RESOURCE_EXHAUSTED') {
      throw new Error(
        'Your Gemini quota is exhausted or rate-limited. https://aistudio.google.com/app/apikey',
      );
    }
    if (response.status === 400 || response.status === 401 || response.status === 403) {
      throw new Error('Invalid API key. Check your key at https://aistudio.google.com/app/apikey.');
    }
    throw new Error(`Gemini API error ${response.status}${detail ? `: ${detail}` : ''}`);
  }

  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts;
  const content = Array.isArray(parts)
    ? parts.map((p: { text?: unknown }) => (typeof p?.text === 'string' ? p.text : '')).join('')
    : undefined;
  if (typeof content !== 'string' || content.length === 0) {
    throw new Error('Unexpected response format from Gemini API');
  }
  return content;
}

/**
 * Provider-agnostic entry point. Routes to the backend named by
 * `config.provider` and returns the model's raw JSON-string response, so every
 * AI feature can stay provider-agnostic and reuse the same `JSON.parse` path.
 */
export function callLlm(
  config: LlmConfig,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  switch (config.provider) {
    case 'gemini':
      return callGemini(config, systemPrompt, userMessage);
    case 'openai':
    default:
      return callOpenAI(config, systemPrompt, userMessage);
  }
}
