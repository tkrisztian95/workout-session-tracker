## Why

Every AI modal in the app re-implements the same loading → streaming → done → error → retry state machine. [`AiPlanSuggestionModal.tsx`](../../../src/components/AiPlanSuggestionModal.tsx) carries five-`view` enum (`'no-config' | 'config' | 'loading' | 'preview' | 'rejected'`), an `error` string, validation reason, and a manually orchestrated `handleGenerate` / `handleRegenerate` pair. [`AiExerciseSwapModal.tsx`](../../../src/components/AiExerciseSwapModal.tsx), [`AiPlanAdjustModal.tsx`](../../../src/components/AiPlanAdjustModal.tsx), and [`AiImportReviewView.tsx`](../../../src/components/AiImportReviewView.tsx) carry similar but subtly different copies. Drift is already visible (different retry semantics, different a11y treatments — none currently use `role="status"` / `aria-live="polite"` on the streaming region). Adding a new AI feature means rebuilding the same state machine for the fifth time.

This change is task 3 of the M1 — AI Infrastructure milestone (see [`docs/ai-milestone.md`](../../../docs/ai-milestone.md) and [issue #59](https://github.com/tkrisztian95/workout-session-tracker/issues/59)). It lands after the `ai-context-envelope` change ([#58](https://github.com/tkrisztian95/workout-session-tracker/issues/58)) and before the Vercel AI Gateway migration ([#57](https://github.com/tkrisztian95/workout-session-tracker/issues/57)), per the milestone's `2 → 3 → 1` recommended ordering. The `<AiStream>` primitive is the UI counterpart to the envelope: envelope shapes input, primitive shapes output state.

## What Changes

- Add `ai` (Vercel AI SDK v6) as a runtime dependency. The package is required to type the primitive's streaming-mode return shape (`AsyncIterable<string>` of text deltas, matching `streamText().textStream`). No `streamText` call is actually wired up in this change — the migrated modal continues to consume the existing one-shot `callOpenAI` path via the hook's Promise-returning fetcher overload. Streaming mode is exercised only by unit tests with a fake `AsyncIterable`. M1.1 (#57) is the change that swaps `callOpenAI` for real `streamText` / `generateText`.
- New file `src/components/AiStream.tsx` exporting:
  - `useAiStream<T>(options)` hook — state machine `'idle' | 'loading' | 'streaming' | 'done' | 'error'`, accumulated `text`, parsed `data`, `error`, plus imperative `start` / `retry` / `reset` / `cancel`. Accepts either a Promise-returning fetcher (one-shot) or an `AsyncIterable<string>`-returning fetcher (streaming). Streaming mode uses an `AbortController` so `cancel()` actually stops the iteration. Optional `parse(text) => T` runs on the final accumulated text; thrown errors transition to `'error'`.
  - `<AiStream>` thin wrapper component — renders an accessible `role="status"` / `aria-live="polite"` region around its children and exposes the hook's return value via a render-prop / children-as-function pattern. Default loading and error renderers are provided but overridable.
  - JSDoc at the top of the file with two usage examples (one-shot Promise + streaming AsyncIterable).
- Migrate [`AiPlanSuggestionModal.tsx`](../../../src/components/AiPlanSuggestionModal.tsx) to consume `useAiStream` as the proof of concept. The five-view enum collapses to `'no-config' | 'config' | 'preview' | 'rejected'` (the loading view becomes the hook's `'loading'` state); `error` / `setError` and the inline `try/catch` in `handleGenerate` disappear. PostHog telemetry (`ai_plan_generation_started/succeeded/failed`) is preserved by wiring it through the hook's `onComplete` / `onError` callbacks. The `AiValidationError` branch stays — `parse` throws it and the modal renders the rejected view in response.
- **Out of scope** (deferred to M1.1 / #57):
  - Migrating `AiExerciseSwapModal`, `AiPlanAdjustModal`, `AiImportReviewView` to the primitive.
  - Replacing `callOpenAI` with `streamText` / `generateText` from the `ai` package.
  - Changing any prompt, response shape, or `JSON.parse` path.
- **Out of scope** (deferred to M1.4 / #60):
  - Structured output via `generateObject` / Zod schemas. The primitive's `parse(text) => T` overload is the future seam for this, but the schema-validated tool-calling path is its own change.

## Capabilities

### New Capabilities

- `ai-stream-primitive`: The shared client-side state machine and accessible UI surface for any AI inference call — covers idle / loading / streaming / done / error transitions, retry & cancel semantics, accumulated text buffer, optional post-stream parsing, and the `role="status"` / `aria-live="polite"` region every AI modal must render. Defines the contract every future AI feature in `src/components/` builds on; M1.1 (#57) will port the other three modals onto this capability.

### Modified Capabilities

- `ai-plan-suggestion`: The Plan Suggestion modal's internal state-machine plumbing moves onto `ai-stream-primitive`. User-visible behavior is unchanged (same loading spinner, same preview card, same error and validation copy, same PostHog events, same retry semantics) — but the spec must record the new accessibility requirement that the loading region announces via `role="status"` / `aria-live="polite"`, because that is a user-visible (assistive-tech-visible) behavior change.

## Impact

- **New file:** `src/components/AiStream.tsx`.
- **New file:** `src/components/AiStream.test.tsx` — unit tests for the hook's state machine (idle → loading → done, loading → error, retry, cancel, streaming via fake `AsyncIterable`, `parse` throwing transitions to error).
- **Modified:** `src/components/AiPlanSuggestionModal.tsx` (re-wires onto `useAiStream`, drops the local view/error state machine, preserves all PostHog events and the validation/rejection branch).
- **Modified:** `package.json` — add `ai` to `dependencies`. No version pin opinion; latest v6 stable at the time of apply. `package-lock.json` updates accordingly.
- **Modified:** `vitest.config.ts` and `package.json` (`devDependencies`) — add `@testing-library/react` and matching `@types` so `renderHook` is available. (The project has `jsdom` configured but no React testing library yet; we need it to validate the hook in isolation.)
- **Modified:** `src/lib/ai/client.ts` — `callOpenAI` wraps its `fetch()` call so a network-level failure surfaces friendly copy instead of the raw `TypeError: Failed to fetch`. This is a contract-preserving bug fix (still throws an `Error`, still returns a `string`), not the SDK migration deferred to M1.1 (#57). It benefits all four AI features. New `src/lib/ai/client.test.ts` covers the network-failure, 401, and success paths.
- **Unchanged:** `src/lib/ai/plan.ts` (`suggestPlan` signature stays), all prompts, all persisted shapes (`localStorage`, `ExportPayload`, `schemaVersion`), and the three non-migrated AI modals.
- **Tests:** existing test suite must still pass. New tests live under `src/components/AiStream.test.tsx`.
- **No env-var changes**, no `process.env.NEXT_PUBLIC_*` reads added, BYOK API-key handling stays purely client-side per the M1–M4 forward-compat rules in `docs/ai-milestone.md`.
- **No persisted-shape changes** — `docs/data-structure.md` does not need an update.
