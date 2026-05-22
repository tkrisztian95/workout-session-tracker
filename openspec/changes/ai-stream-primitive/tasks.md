## 1. Dependencies & test toolchain

- [x] 1.1 Add `ai` (Vercel AI SDK v6, latest stable) to `dependencies` in `package.json` via `npm install ai`.
- [x] 1.2 Add `@testing-library/react` and `@testing-library/dom` to `devDependencies` via `npm install -D`.
- [x] 1.3 Verify the build still passes (`npm run build`) and note the bundle-size delta from the `ai` install; if the raw delta is non-trivial, confirm it tree-shakes (type-only import) before proceeding.
- [x] 1.4 Confirm `vitest.config.ts` `jsdom` environment is sufficient for `renderHook` — add a setup file only if RTL requires one.

## 2. Build the AiStream primitive

- [x] 2.1 Create `src/components/AiStream.tsx` with a top-of-file JSDoc block containing two `@example` blocks: one Promise / one-shot fetcher, one AsyncIterable / streaming fetcher.
- [x] 2.2 Define exported types: `AiStreamState` (`'idle' | 'loading' | 'streaming' | 'done' | 'error'`), `AiStreamFetcher<T>` (receives `{ signal: AbortSignal }`, returns `Promise<T>` | `Promise<AsyncIterable<string>>` | `AsyncIterable<string>`), `UseAiStreamOptions<T>` (`fetch`, optional `parse`, `onComplete`, `onError`, `autoStart`), and `UseAiStreamReturn<T>`.
- [x] 2.3 Implement `useAiStream<T>` — internal state for `state`, `text`, `data`, `error`; an `AbortController` ref; a run-token ref so stale runs cannot write state after `cancel` / `retry`.
- [x] 2.4 Implement the run routine: invoke `fetch({ signal })`, await once, discriminate on `Symbol.asyncIterator`. Streaming branch: set `'streaming'`, iterate accumulating `text`, run `parse(text)` at end, set `data`, transition to `'done'`. One-shot branch: skip `'streaming'`, set `data` from the resolved value, transition to `'done'`.
- [x] 2.5 Implement error handling: synchronous throw, rejected Promise, iterator throw, and `parse` throw all transition to `'error'` with the value coerced to `Error`; fire `onError`. `onComplete` fires only on a clean `'done'`.
- [x] 2.6 Implement `start` (no-op unless `'idle'`), `retry` (`cancel` + clear + re-run from any state), `reset` (back to `'idle'`, clear all), `cancel` (`abort()` the controller, ignore further chunks via the run token, return to `'idle'`, clear all). Honor `autoStart` (default `true`) via `useEffect` on mount.
- [x] 2.7 Implement the `<AiStream>` wrapper component — render-prop / children-as-function over `useAiStream`, root element with `role="status"`, `aria-live="polite"`, `aria-atomic="false"`.
- [x] 2.8 Verify the file's static imports are only `react` and `type`-only `ai` — no `@/lib/*`, no `posthog-js`, no storage/env access.

## 3. Validate the primitive in isolation

- [x] 3.1 Create `src/components/AiStream.test.tsx`.
- [x] 3.2 Test: initial state with `autoStart: false` is `'idle'` with empty `text` / null `data` / null `error`.
- [x] 3.3 Test: `autoStart` default invokes `fetch` on mount and transitions to `'loading'`.
- [x] 3.4 Test: Promise fetcher resolving `v` → `'done'`, `data === v`, `onComplete(v, '')` called once.
- [x] 3.5 Test: AsyncIterable fetcher yielding chunks → `'streaming' → 'done'`, `text` accumulates, `parse` runs once, `onComplete(parsedData, fullText)` called once.
- [x] 3.6 Test: `Promise<AsyncIterable>` and bare `AsyncIterable` both dispatch to streaming mode.
- [x] 3.7 Test: fetcher throw / Promise rejection / iterator throw → `'error'`, `error` is an `Error`, `onError` called once.
- [x] 3.8 Test: `parse` throwing → `'error'`, `onComplete` not called, `onError` called.
- [x] 3.9 Test: `retry` from `'error'` and from `'done'` replays the fetcher and clears prior state.
- [x] 3.10 Test: `reset` returns to `'idle'`; `cancel` during streaming aborts, returns to `'idle'`, and ignores chunks yielded post-abort; `start` is a no-op when not `'idle'`.
- [x] 3.11 Test: fetcher receives `{ signal }` and the signal aborts when `cancel` is called.
- [x] 3.12 Run `npm test` — all new and existing tests pass.

## 4. Migrate AiPlanSuggestionModal

- [x] 4.1 Run `gitnexus_impact` on `AiPlanSuggestionModal` (and on any symbol being changed) before editing; report the blast radius.
- [x] 4.2 Replace the `View` enum (`'no-config' | 'config' | 'loading' | 'preview' | 'rejected'`) with `'no-config' | 'config'` — loading / preview / rejected all derive from the hook's `state` + error type.
- [x] 4.3 Wire `useAiStream` with a Promise fetcher that calls `suggestPlan(config, ctx, preferences)`; remove the inline `try/catch` from `handleGenerate`.
- [x] 4.4 Preserve all three PostHog events: `ai_plan_generation_started` (in `handleGenerate`, before `retry`), `ai_plan_generation_succeeded` (in `onComplete`), `ai_plan_generation_failed` (in `onError`, keeping the existing `error_type` classification).
- [x] 4.5 Keep the `AiValidationError` branch: detect it in `onError` and derive the rejected view + validation reason from `aiStream.error`; ensure no plan is created/stored.
- [x] 4.6 Wrap the loading / preview / rejected dynamic region in a `role="status"` / `aria-live="polite"` element — not the whole modal body.
- [x] 4.7 Re-wire `handleRegenerate` to call the hook's `reset` instead of manually clearing state; verify regenerate still resets the preference chips per current behavior.
- [x] 4.8 Run `npm run lint` and `npm run build` — no errors.

## 5. Verification & docs

- [ ] 5.1 Run `gitnexus_detect_changes()` to confirm only the expected symbols / flows changed.
- [ ] 5.2 Playwright MCP visual check: navigate to the dev server, open the AI Suggest modal, exercise the config → loading → preview path and the error / rejected path; screenshot each state.
- [ ] 5.3 Confirm `docs/data-structure.md` needs no update (no persisted-shape change) and `docs/ai-milestone.md` task 3 status can be ticked.
- [ ] 5.4 Run `openspec validate ai-stream-primitive --strict` and the full `npm test` suite once more before archiving.
