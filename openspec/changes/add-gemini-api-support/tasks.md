## 1. Types & storage

- [x] 1.1 Widen `LlmConfig.provider` to `'openai' | 'gemini'` in `src/lib/types.ts`
- [x] 1.2 Extend `getEnvLlmConfig` in `src/lib/storage.ts` to fall back to `NEXT_PUBLIC_GEMINI_API_KEY` / `NEXT_PUBLIC_GEMINI_MODEL` (OpenAI keeps precedence; same non-production gate)
- [x] 1.3 Add a Gemini env-fallback test to `src/lib/storage.test.ts`

## 2. AI client

- [x] 2.1 Add `callGemini(config, systemPrompt, userMessage)` to `src/lib/ai/client.ts` (Generative Language `generateContent`, JSON response mode, friendly error mapping)
- [x] 2.2 Add a `callLlm(config, systemPrompt, userMessage)` dispatcher that routes by `config.provider`
- [x] 2.3 Point `suggestPlan`, `importSessions`, `adjustPlan`, `swapExercise` at `callLlm`
- [x] 2.4 Add a `callGemini` unit test (mocked `fetch`: success + invalid-key paths)

## 3. AI Configuration UI

- [x] 3.1 Add a provider `Select` (OpenAI / Gemini) to `src/components/AiConfigCard.tsx`
- [x] 3.2 Make model options, key placeholder, label, and "Get API key" link provider-aware; reset model to the provider default on provider change
- [x] 3.3 Persist the chosen provider via `saveLlmConfig`

## 4. Docs

- [x] 4.1 Update the `LlmConfig` shape and env-fallback note in `docs/data-structure.md`
- [x] 4.2 Add `NEXT_PUBLIC_GEMINI_API_KEY` / `NEXT_PUBLIC_GEMINI_MODEL` to `.env.example`

## 5. Verify

- [x] 5.1 `npm run lint`, `npm test`, and `npm run build` all pass
