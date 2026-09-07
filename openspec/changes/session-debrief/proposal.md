## Why

When a session finishes, the celebration screen is a high-attention, post-workout dopamine moment — and right now it says nothing specific about the workout just done. The persisted `SessionEvaluation` strip (from `session-evaluation-meta`) already contains the raw signal — _1 overdone, 3 on target, 1 underperformed, on track_ — but nothing turns it into a sentence a human reads.

This adds a short AI debrief: one observation + one concrete next-session change, generated once from the just-finished session's evaluation plus the AI context envelope, shown inline on the celebration screen and re-readable in history.

Closes [#64](https://github.com/tkrisztian95/workout-session-tracker/issues/64). Picks M2.B over M2.A ([#63](https://github.com/tkrisztian95/workout-session-tracker/issues/63), in-session coach) — one inference per session, not per set.

## What Changes

- **New persisted shape** `WorkoutSession.debrief?: { text: string; generatedAt: string; model: string }` — written once, never regenerated. Re-reading a session in history shows the same text.
- **New setting** `wst_ai_debrief_enabled` (default on) with a getter/setter and a toggle row in `AiConfigCard`. When off, or when no LLM config is saved, the finish flow behaves exactly as today.
- **New prompt** `src/lib/ai/prompts/session-debrief/` (`index.ts` + `v1.ts`) — explicit "max 3 sentences, one observation + one concrete change, no 'great job'" constraint; returns `{ "debrief": string }`.
- **New feature module** `src/lib/ai/debrief.ts` — `generateSessionDebrief(ctx, finishedSession)`: one `callLlm` JSON call, parse + validate, defensively trims to 3 sentences. No new HTTP client — reuses `callLlm`.
- **`AiFeature` union** gains `'session-debrief'`.
- **`saveSession`** returns the stored `WorkoutSession` (so the finish flow can generate against the persisted record + its `evaluation`).
- **Finish flow** — `SessionCompleteOverlay` gains a third view after `rating`: it fires the debrief call, shows a short skeleton, renders the paragraph inline (not a modal), and persists it via `updateSession` on success. Failure degrades silently to the plain "done" state — no retry nagging.
- **History detail** — the persisted debrief renders in a card above the Exercises / Timeline / vs Plan tabs (`src/app/history/[id]/page.tsx`), hidden while editing.
- **i18n** — new `en` / `hu` strings for the debrief heading, loading, and failure states.
- **Docs** — `docs/data-structure.md` gains `debrief` on `WorkoutSession` and the `wst_ai_debrief_enabled` key.
- No-plan sessions (`evaluation.overall === 'no-plan'`) still get a debrief — the prompt is told to focus on volume / rating / progression instead of plan deviation.

## Capabilities

### New Capabilities

- `ai-session-debrief`: A one-paragraph AI debrief generated once when a session is finished, from the session's evaluation meta plus the AI context envelope; persisted on the session, shown inline on the celebration screen and in history, and skippable from settings.

### Modified Capabilities

- `ai-context-envelope`: `AiFeature` gains a `'session-debrief'` member.

## Impact

- **Types** — `src/lib/types.ts`: `SessionDebrief` interface + `WorkoutSession.debrief?`.
- **Storage** — `src/lib/storage.ts`: `saveSession` returns the record; `KEYS.aiDebriefEnabled` + `isAiDebriefEnabled` / `setAiDebriefEnabled`; `docs/data-structure.md` sync.
- **AI** — `src/lib/ai/context.ts` (`AiFeature`), `src/lib/ai/debrief.ts` (new), `src/lib/ai/prompts/session-debrief/` (new), `src/lib/ai/index.ts` (exports).
- **UI** — `src/components/SessionCompleteOverlay.tsx` (third view + props), `src/app/_views/SessionView.tsx` (wire save→debrief→dismiss), `src/app/page.tsx` (`handleFinish` returns/holds the record), `src/components/AiConfigCard.tsx` (toggle), `src/app/history/[id]/page.tsx` (debrief card), `src/components/SessionDebriefCard.tsx` (new, shared).
- **i18n** — `src/locales/en.json`, `src/locales/hu.json`.
- **Cost** — one `gpt-4o-mini` call per finished session, envelope + strip in, ≤ ~120 tokens out. Well under the $0.003/session target.
- No new dependencies. No breaking changes — `debrief` is optional; the flow is a no-op without a config or with the toggle off.
