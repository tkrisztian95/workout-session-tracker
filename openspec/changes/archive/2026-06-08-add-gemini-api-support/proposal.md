## Why

The app's AI features (plan suggestion, exercise swap, plan adjust, notes import) only work with an OpenAI API key. Users who already have a Google Gemini key — or who prefer Gemini's free tier — have no way to use the AI companion. Adding Gemini as a second bring-your-own-key provider lowers the barrier to trying the AI features without changing the privacy model (the key still lives only in the user's browser).

A broader AI SDK / Vercel Gateway migration is tracked in #57, but that is a large refactor of the whole AI layer. This change is deliberately smaller and independent: it extends the existing native-`fetch` client with a Gemini path so users get provider choice today, without blocking on the Gateway work. Checked the open issues — no dedicated Gemini issue exists; #57 (Gateway migration) is related but out of scope here.

## What Changes

- Widen `LlmConfig.provider` from `'openai'` to `'openai' | 'gemini'` and persist the chosen provider alongside the key and model.
- Add a Gemini call path to the AI client (Google Generative Language `generateContent` REST API, JSON response mode) and a provider-aware dispatcher so the four existing AI features route to the right backend.
- Add a provider selector to the AI Configuration card with provider-specific model options, API-key link, and key placeholder.
- Extend the dev/preview env-var fallback so a `NEXT_PUBLIC_GEMINI_API_KEY` works the same way the OpenAI one does.
- Keep the OpenAI path, storage keys, and privacy model unchanged.

## Capabilities

### Modified Capabilities

- `ai-settings-config`: the AI Configuration section gains a provider selector; the saved config records which provider (`openai` or `gemini`) the key and model belong to.

## Impact

- **Types**: `LlmConfig.provider` widened in `src/lib/types.ts`.
- **AI client**: `src/lib/ai/client.ts` gains `callGemini` plus a `callLlm` dispatcher; `plan.ts`, `import.ts`, `adjust.ts` call the dispatcher instead of `callOpenAI`.
- **Storage**: `getEnvLlmConfig` in `src/lib/storage.ts` learns the Gemini env vars.
- **UI**: `src/components/AiConfigCard.tsx` adds a provider `Select` and provider-aware fields.
- **Docs**: `docs/data-structure.md` (`LlmConfig` shape + env fallback) and `.env.example` updated.
- **Dependencies**: none — reuses native `fetch`.
- **Privacy**: unchanged — data is sent to the chosen provider only on explicit user action, using the user's own locally-stored key.
