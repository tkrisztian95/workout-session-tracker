import type { LlmConfig } from '../types';

export async function callOpenAI(
  config: LlmConfig,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  let response: Response;
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
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
  } catch {
    // fetch() rejects (rather than resolving non-ok) only on network-level
    // failures — offline, DNS, CORS. Surface friendly copy instead of the
    // raw "TypeError: Failed to fetch".
    throw new Error(
      'Could not reach the OpenAI API. Check your internet connection and try again.',
    );
  }

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
