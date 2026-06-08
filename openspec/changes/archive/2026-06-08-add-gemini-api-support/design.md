## Context

All four AI features (`suggestPlan`, `importSessions`, `adjustPlan`, `swapExercise`) call a single `callOpenAI(config, systemPrompt, userMessage)` helper in `src/lib/ai/client.ts` that hits `https://api.openai.com/v1/chat/completions` with `response_format: { type: 'json_object' }` and returns the assistant message string. Each feature then `JSON.parse`s that string. Config (`provider`, `apiKey`, `model`) lives in `localStorage` under `wst_llm_config`, read/written via `getLlmConfig` / `saveLlmConfig`, with a dev/preview-only env-var fallback (`getEnvLlmConfig`). The provider field already exists in the type but is hard-coded to `'openai'` everywhere.

## Goals / Non-Goals

**Goals**

- Let users pick OpenAI or Gemini for the AI companion and have all four features use the choice.
- Keep the existing OpenAI behaviour byte-for-byte; Gemini is purely additive.
- Reuse native `fetch`, prompt-versioning, and JSON-response parsing — no new dependencies.

**Non-Goals**

- The Vercel AI Gateway / AI SDK v6 migration (#57). This change does not introduce the `ai` package.
- Streaming, tool-calling, or multi-provider fallback.
- Localising the AI Configuration card (it is currently hard-coded English; that is unchanged).

## Decisions

### 1. Provider-aware dispatcher, keep `callOpenAI`

Add `callGemini(config, systemPrompt, userMessage)` next to `callOpenAI`, and a thin `callLlm(config, systemPrompt, userMessage)` that switches on `config.provider`. The four features call `callLlm`. Both backends return a JSON string, so the downstream `JSON.parse` + normalisation code in `plan.ts` / `import.ts` / `adjust.ts` is untouched.

**Rationale:** A single contract (`string` in, JSON `string` out) means the features stay provider-agnostic and the existing parsing/validation is reused unchanged.

### 2. Gemini request shape

`POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` with the key in the `x-goog-api-key` header. Body maps the system prompt to `system_instruction.parts[].text`, the user message to a single `contents[{ role: 'user', parts: [{ text }] }]`, and sets `generationConfig.responseMimeType = 'application/json'` to get JSON back (the analogue of OpenAI's `json_object` mode). The response text is `candidates[0].content.parts[].text` joined.

**Rationale:** `responseMimeType: 'application/json'` is Gemini's structured-JSON switch, keeping the "model returns a JSON string" contract that every feature already depends on. The key goes in the `x-goog-api-key` header rather than the URL query string so it does not leak into logs.

### 3. Error mapping parallels the OpenAI path

Map Gemini failures to the same friendly messages: HTTP 400 with `API_KEY_INVALID` / 401 → "Invalid API key" pointing at Google AI Studio; 429 → quota/rate-limit guidance; otherwise a generic `Gemini API error <status>: <detail>`. Mirror the existing OpenAI helper so callers need no special-casing.

### 4. Provider selector drives model options

`AiConfigCard` gets a provider `Select` (OpenAI / Gemini). The model `Select`, "Get API key" link, key placeholder, and label switch on the selected provider. When the user switches provider, the model resets to that provider's default so an OpenAI model never gets saved under `gemini`. Defaults: OpenAI `gpt-4o-mini`, Gemini `gemini-2.5-flash`.

**Rationale:** Pairing model lists with the provider prevents invalid `{ provider, model }` combinations at the UI level, where it is cheapest to enforce.

### 5. Env-var fallback gains Gemini

`getEnvLlmConfig` checks `NEXT_PUBLIC_OPENAI_API_KEY` first (unchanged precedence), then `NEXT_PUBLIC_GEMINI_API_KEY`, applying the same non-production gate. A saved `localStorage` config still wins over any env fallback.

**Rationale:** Keeps the dev/preview convenience symmetrical across providers without weakening the production fail-closed gate.

## Risks / Trade-offs

- **Gemini JSON adherence:** `responseMimeType: 'application/json'` is reliable but the existing defensive `JSON.parse` + `valid === false` guardrails already cover malformed output, so no new validation is needed.
- **Model list drift:** Gemini model ids change over time; the selector hard-codes a small current set (flash + pro), matching how the OpenAI list is hard-coded today. Updating it later is a one-line change.

## Migration Plan

No data migration. Existing `wst_llm_config` values already carry `provider: 'openai'` and keep working. New saves simply record the selected provider. The type widening is backward compatible.

## Open Questions

None.
