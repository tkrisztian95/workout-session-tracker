## Why

Every AI feature in the app (plan suggestion, exercise swap, plan adjust, notes import) reaches independently into `localStorage` for its prompt context. Each builds its own subset, with slightly different formatting and inclusion rules — drift is inevitable and already visible (e.g. only `suggestPlan` reads body metrics; `swapExercise` does not). The four feature modules also re-derive shared transforms (`summarisePlan`, `summariseSession`) and pass the same loose positional arguments through several layers.

A single typed context envelope, built once and shared, removes this drift, simplifies feature signatures, and prepares the codebase for the upcoming AI infrastructure work (#57 AI Gateway migration, #60 tool calling, #61 telemetry, #62 budget guard) — all of which need a stable shape to operate on.

This change is the first phase of milestone [#1 "AI: Context-aware coach"](https://github.com/tkrisztian95/workout-session-tracker/milestone/1), tracked by [issue #58](https://github.com/tkrisztian95/workout-session-tracker/issues/58).

## What Changes

- Introduce `src/lib/ai/context.ts` exporting a typed `AiContext` interface and a `buildAiContext(feature, options?)` function that reads through `src/lib/storage.ts` (never `localStorage` directly) and returns the envelope.
- Phase 1 envelope fields (populated): `profile`, `activePlans`, `recentSessions` (compressed `SessionSummary` shape), `progression` (reuses existing `ExerciseProgression` from `statsUtils.ts`).
- Phase 1 envelope fields (declared optional, undefined at runtime): `preferences`, `evaluation`, `likes`. Each will be populated by its feeder issue ([#52](https://github.com/tkrisztian95/workout-session-tracker/issues/52) / [#53](https://github.com/tkrisztian95/workout-session-tracker/issues/53) / [#54](https://github.com/tkrisztian95/workout-session-tracker/issues/54)) as a one-line addition; no consumer breakage required.
- Migrate the four AI feature modules (`suggestPlan`, `swapExercise`, `adjustPlan`, `importSessions`) so their entry points accept `AiContext` instead of loose positional args + ad-hoc storage reads.
- Add a `SessionSummary` helper next to `WorkoutSession` (compact shape used inside the envelope and accessible to telemetry / debugging).
- No change to system prompts, model calls, response parsing, or the `callOpenAI` client — pure refactor of input plumbing.

## Capabilities

### New Capabilities

- `ai-context-envelope`: The shared, typed `AiContext` envelope and the `buildAiContext` factory that powers every AI feature's prompt construction. Defines what training-context data is collected, in what shape, and which fields are tolerated as undefined (placeholders for future feeders).

### Modified Capabilities

_None._ The four existing AI feature capabilities (`ai-plan-suggestion`, `ai-plan-preferences`, `ai-import-from-notes`, etc.) keep their behavior unchanged at the user-visible / prompt level. Only the internal plumbing for assembling input changes — that detail is not at the spec layer.

## Impact

- **New file:** `src/lib/ai/context.ts`.
- **Modified:** `src/lib/ai/plan.ts`, `src/lib/ai/adjust.ts`, `src/lib/ai/import.ts`, `src/lib/ai/index.ts`.
- **Modified callers** (consume the new entry-point signatures): `src/components/AiPlanSuggestionModal.tsx`, `src/components/AiExerciseSwapModal.tsx`, `src/components/AiPlanAdjustModal.tsx`, `src/components/NewHistorySessionSheet.tsx`.
- **Types:** `AiContext`, `SessionSummary`, and re-export of `ExerciseProgression` from a single location.
- **No persisted shape changes.** `localStorage` keys, migrations, and the export payload are untouched.
- **No new runtime dependencies.** No SDK migration (that is [#57](https://github.com/tkrisztian95/workout-session-tracker/issues/57)).
- **Test impact:** new unit tests for `buildAiContext` covering empty-state, deferred-field tolerance, and shape stability. Existing AI module tests, if any, retarget the new entry-point signature.
