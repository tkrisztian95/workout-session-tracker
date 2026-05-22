## Context

Four AI features ship today: plan suggestion, exercise swap, plan adjust, notes import. Each modal embeds its own state machine over the same five logical states (no-config / config / loading / preview / rejected, or near-equivalents). The shapes have drifted: error semantics differ, retry resets different sub-state, and none currently announce the in-flight state to assistive tech (no `role="status"` / `aria-live="polite"`). The `ai-context-envelope` change ([#58](https://github.com/tkrisztian95/workout-session-tracker/issues/58), archived 2026-05-21) consolidated the input side of every AI call; this change consolidates the output state side.

Constraints carried over from `docs/ai-milestone.md`:

- AI requests stay client-side until the M5 Auth0 + Atlas pivot. The hook MUST NOT introduce a server-side proxy or assume one exists.
- BYOK key is read via `getLlmConfig()` from `src/lib/storage.ts`. The hook itself MUST NOT read storage or env vars — it accepts a fetcher function injected by the caller, keeping the M5 server-swap clean.
- No persisted-shape changes; `schemaVersion` does not move.
- The `ai` package is the SDK we will standardise on (Vercel AI SDK v6) for the M1.1 migration. Installing it here unlocks `streamText`'s `textStream` (`AsyncIterable<string>`) as the streaming-mode contract — even though no `streamText` call is wired up in this change.

The migrated modal — `AiPlanSuggestionModal` — currently calls `suggestPlan(config, ctx, prefs)` which uses `callOpenAI`'s one-shot JSON response. We keep that path. The hook treats the call as a Promise<T> in this change; streaming is exercised only via tests with a fake `AsyncIterable`. M1.1 will replace `callOpenAI` with `streamText` / `generateObject` and at that point real streaming flows through the same hook.

## Goals / Non-Goals

**Goals:**

- One state-machine implementation for every AI feature: idle / loading / streaming / done / error.
- Inject the inference call; hook owns no storage, no env, no model knowledge.
- Support both shapes the AI SDK exposes: Promise-returning calls (`generateText`, `generateObject`) and AsyncIterable-returning calls (`streamText().textStream`). Discriminate by `Symbol.asyncIterator`, not by an option flag.
- First-class cancel via `AbortController`. `cancel()` must actually halt an in-progress streaming call.
- Accessible by default: the wrapper component renders the live region; consumers can override the contents but not opt out of the announcement role.
- Idempotent retry: retrying after error or after done returns to `'loading'` and replays the fetcher with a fresh `AbortController`. Tokens / data / error from the previous run are cleared.
- Proof migration of `AiPlanSuggestionModal` with zero user-visible regressions (same copy, same PostHog events, same retry semantics).
- Validate in isolation: the streaming code path is covered by unit tests with a fake `AsyncIterable` — no real API call required to test the primitive.

**Non-Goals:**

- Migrating the other three modals (M1.1 / #57).
- Replacing `callOpenAI` (M1.1 / #57).
- Structured output via Zod schemas / `generateObject` (M1.4 / #60).
- Token-budget enforcement (M1.6 / #62).
- Token telemetry wrapper (M1.5 / #61) — PostHog events stay where they are (in the modal) for this change. The hook exposes `onComplete(data, text)` and `onError(err)` so the wrapper from #61 has a clean attachment point later.
- Server-side proxy / Vercel Functions for AI calls — that's M5.
- Storybook / dev playground route. Validation is via unit tests.

## Decisions

### Hook-first, thin wrapper component

The issue offered both shapes. We pick hook-first because the state-machine logic is the substance and is the only thing worth testing in isolation; the wrapper component is a 20-line render-prop that adds the accessibility region.

```ts
const { state, text, data, error, retry, reset, cancel, start } = useAiStream<T>({
  fetch,
  parse,
  onComplete,
  onError,
  autoStart,
});
```

```tsx
<AiStream fetch={...} parse={...} onComplete={...}>
  {({ state, text, data, error, retry }) => (...)}
</AiStream>
```

**Alternative considered:** component-with-render-prop-only (no public hook). Rejected because the migrated modal already owns four other pieces of state (focus chip, daysPerWeek chip, goal chip, reasoning open) that need to compose with the AI-call state. A render-prop wrapper around the whole modal body would force those into the render-prop's scope. The hook lets `AiPlanSuggestionModal` keep its own state structure and just inject the AI piece.

### Fetcher overload — Promise OR AsyncIterable, discriminated at runtime

```ts
type AiStreamFetcher<T> =
  | (() => Promise<T>)
  | (() => Promise<AsyncIterable<string>>)
  | (() => AsyncIterable<string>);
```

The hook calls the fetcher, awaits the result if it's a Promise, then checks for `Symbol.asyncIterator` on the resolved value:

- If iterable → `state = 'streaming'`, iterate, accumulate `text`, run `parse(text)` at the end, transition to `'done'`.
- If not iterable → treat the resolved value as `T` directly, transition `'loading' → 'done'`. `text` stays `''`. `parse` is not called in this branch (the Promise already returned `T`).

**Alternative considered:** separate `fetchText` and `fetchStream` options. Rejected — forces the caller to know upfront which mode they're in, even though the AI SDK lets you swap `generateObject` for `streamObject` without a state-shape change. Runtime discrimination matches the SDK's own ergonomics.

**Alternative considered:** require AsyncIterable always; one-shot callers wrap in `async function* () { yield await call() }`. Rejected — adds boilerplate to every non-streaming consumer (including the migrated modal in this PR) for no testability win.

### Cancel via AbortController; consumer wires it in

The hook creates a fresh `AbortController` on `start()` / `retry()`. It exposes `controller.signal` only via the fetcher invocation pattern: the fetcher receives `{ signal }` as its first argument.

```ts
type AiStreamFetcher<T> = (args: {
  signal: AbortSignal;
}) => Promise<T> | Promise<AsyncIterable<string>> | AsyncIterable<string>;
```

Calling `cancel()` aborts the controller. The fetcher is responsible for honoring `signal` (the AI SDK `streamText` does this natively; `callOpenAI` does not today — but the migrated modal doesn't expose a cancel button anyway, so this is a future-proofing seam, not a behavior promised in this change). On abort, the hook resets to `'idle'` and clears `text` / `data` / `error`.

**Alternative considered:** no cancel in this change; add later. Rejected — adding `AbortController` later means changing the fetcher signature, breaking the migration M1.1 will do. Cheaper to add it now even if `cancel()` is a no-op for the one-shot Promise mode.

### `parse(text)` runs only in streaming mode

In Promise mode the fetcher already returns `T`. In streaming mode the fetcher yields strings; `parse` reduces the final accumulated text to `T`. Throwing inside `parse` transitions the hook to `'error'` with the thrown value. This is the seam `AiValidationError` flows through during the migrated modal's plan-suggestion path: when M1.1 swaps the fetcher to `streamObject`, `parse` becomes the JSON / Zod boundary.

For this change, since the migrated modal uses Promise mode, `parse` is not called on the real path. It's exercised in tests.

**Alternative considered:** call `parse` in both modes (so `parse` always runs on a `string`). Rejected — Promise mode's fetcher already returns `T`. Requiring callers to thread a `string` intermediate is artificial.

### Accessibility lives in the wrapper component, not the hook

Hooks can't render. The wrapper component renders a `<div role="status" aria-live="polite" aria-atomic="false">` around its render-prop output. The migrated modal wraps only the dynamic region (loading spinner / preview / rejected card), not the entire modal body — wrapping the whole sheet would announce static form fields as if they changed.

`aria-atomic="false"` so screen readers announce the streaming token deltas as additions, not as a full re-read. Today the migrated path doesn't stream tokens to the user (JSON output), so `aria-atomic` is academically correct but not user-visible. When M1.1 lands real streaming, this matters.

### Reset semantics: clear everything except controller

`reset()` returns the hook to `'idle'`, `text = ''`, `data = null`, `error = null`. It does NOT abort an in-flight controller (use `cancel()` for that, then `reset()` if needed). Calling `reset()` mid-stream is a caller bug — we don't defend against it because every other React state hook works the same way.

`retry()` = `cancel()` + `start()`. `start()` is a no-op if `state !== 'idle'` unless called after `reset()`.

### Preserve PostHog events at the call site, not in the hook

The migrated modal keeps its three PostHog calls:

- `ai_plan_generation_started` — fired in the wrapped fetcher, before delegating to `suggestPlan`.
- `ai_plan_generation_succeeded` — fired inside `onComplete`.
- `ai_plan_generation_failed` — fired inside `onError`, with the same `error_type` classification logic that exists today.

The hook does not know about PostHog. M1.5 (#61) introduces a generic telemetry wrapper around the fetcher; this change deliberately keeps the call sites unchanged so #61 can refactor them uniformly later.

### Where the file lives

`src/components/AiStream.tsx` matches the issue's API proposal and sits next to the four modals that will eventually consume it. Not `src/lib/ai/` because the file owns React state and JSX; not `src/components/ui/` because it isn't a visual primitive at the design-system layer.

## Risks / Trade-offs

- **Risk:** Installing `ai` adds bundle weight even though we don't import from it in production paths yet. → Mitigation: `ai` is tree-shakable; the only file that types against it is `AiStream.tsx`, which imports `type { ... }` only. Verify after install that the build size delta is < 50 KB raw / negligible after minify+gzip; if not, defer the install to M1.1 and type the streaming shape with a local `AsyncIterable<string>` until then.
- **Risk:** Adding `@testing-library/react` widens the test toolchain for one hook. → Mitigation: the project already has `jsdom` configured in `vitest.config.ts`; adding RTL is one dependency line. Hook tests are the cleanest way to validate the state machine and will pay off as the rest of the modals migrate in M1.1.
- **Risk:** The runtime `Symbol.asyncIterator` check fails for callers that return a Thenable-wrapped iterable mid-flight (`Promise<AsyncIterable<string>>`). → Mitigation: the hook explicitly awaits the fetcher's return value once before discriminating; this handles both `Promise<AsyncIterable>` and `AsyncIterable` correctly. Pure `T` results that happen to implement `Symbol.asyncIterator` (extremely rare in our domain — no current type does) would mis-dispatch. Documented in JSDoc; will not fail any real caller in this codebase.
- **Risk:** Hook owns no PostHog; if a future migration forgets to wire `onError`, telemetry silently breaks. → Mitigation: M1.5 (#61) is the change that adds a wrapper / lint check; until then this is no worse than today (where every modal's `try/catch` carries the PostHog logic anyway).
- **Trade-off:** The `parse` callback in streaming mode means errors thrown during JSON parse look identical to network/API errors at the consumer level (`state === 'error'`). The migrated modal already classifies error types via `err.message.includes(...)`; this stays unchanged. M1.4 (#60) replaces both with typed Zod errors.
- **Trade-off:** `cancel()` is a no-op when the underlying call doesn't honor `AbortSignal` (which `callOpenAI` does not today). The state machine transitions correctly back to `'idle'`, but the in-flight network request still completes in the background. Acceptable until M1.1 swaps the client.

## Migration Plan

Single in-place migration of `AiPlanSuggestionModal`. No feature flag, no parallel implementations.

1. Land the primitive + tests in the first commit (proposal already committed separately per AGENTS.md).
2. Migrate `AiPlanSuggestionModal` in the next commit. PostHog events preserved byte-for-byte.
3. Manual verification via Playwright MCP per AGENTS.md (navigate, screenshot, exercise the loading / preview / rejected paths).
4. If a regression surfaces, revert the migration commit; the primitive and its tests stay landed for M1.1 to consume.

Rollback strategy: revert the migration commit (single file change). The primitive can remain in the tree harmlessly since no other modal imports it yet.

## Open Questions

None blocking. The `Symbol.asyncIterator` discrimination edge case (a `T` that happens to be an async iterable) is theoretically possible but not present in any current or planned consumer; documented in JSDoc rather than guarded against.
