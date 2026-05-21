## Context

The current AI surface consists of four entry points, each reading from `localStorage` (via `src/lib/storage.ts`) independently:

| Feature         | Module                                    | Inputs assembled today                                                                                                      |
| --------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Plan suggestion | `src/lib/ai/plan.ts` → `suggestPlan`      | `plans`, `sessions` (passed in), `preferences`, `language`, plus `sex`/`age`/`heightCm`/`weightKg` read inline from storage |
| Exercise swap   | `src/lib/ai/adjust.ts` → `swapExercise`   | `plan`, `target`, `dayName`, `instruction`, `language` (no body metrics, no history)                                        |
| Plan adjust     | `src/lib/ai/adjust.ts` → `adjustPlan`     | `plan`, `instruction`, `language` (no body metrics, no history)                                                             |
| Notes import    | `src/lib/ai/import.ts` → `importSessions` | `notes`, `language`, `existingExerciseNames`, no metrics, no history                                                        |

This produces three concrete pain points:

1. **Asymmetric context.** `swapExercise` has zero knowledge of the user's history or progression — the LLM picks substitutes blind. `suggestPlan` knows everything. The asymmetry is not a deliberate design choice; it is a side-effect of independent feature evolution.
2. **Drift on changes.** When a new field (e.g. body weight) is added, only the feature that the author was thinking about is updated. Adding `preferences`, `evaluation`, or `likes` later would multiply this drift unless the envelope arrives first.
3. **Storage reads scattered across the AI module.** `src/lib/ai/plan.ts` imports `getSex` / `getAge` / `getHeightCm` / `getWeightKg` directly. This works today but conflicts with the forward-compat rule in [docs/ai-milestone.md](../../../docs/ai-milestone.md) that says **all persistence goes through `src/lib/storage.ts`** because at M5 it will swap to Atlas — we should not have any AI feature re-implementing storage reads.

This change introduces a single typed envelope and reroutes all four features through it. No behavior changes; no prompt changes; no model changes.

## Goals / Non-Goals

**Goals:**

- One typed `AiContext` interface, declared in `src/lib/ai/context.ts`, listing every field any AI feature could ever want.
- One `buildAiContext(feature, options?)` factory that reads through `storage.ts` only and returns a populated envelope. Feature parameter exists so future budget-guard / context-shaping logic ([#62](https://github.com/tkrisztian95/workout-session-tracker/issues/62)) can vary inclusion per use case.
- The four AI feature modules consume `AiContext` instead of ad-hoc positional args + inline storage reads.
- Deferred fields (`preferences`, `evaluation`, `likes`) are declared in the type with `?:` and tolerated by every consumer as `undefined` today. Each one becomes a one-line addition to `buildAiContext` when its feeder issue ships, no consumer changes required.
- Existing helper functions (`summarisePlan`, `summariseExercise`, `summariseSession`) remain available but become reusable across features rather than duplicated.
- New unit tests cover empty-state envelope, deferred-field tolerance, and shape stability.

**Non-Goals:**

- **No AI SDK migration.** This change keeps `callOpenAI` and the OpenAI REST shape exactly as they are. The Gateway / AI SDK v6 migration is [#57](https://github.com/tkrisztian95/workout-session-tracker/issues/57).
- **No new context budget enforcement.** The envelope may exceed model context windows for power users; truncation is [#62](https://github.com/tkrisztian95/workout-session-tracker/issues/62).
- **No new telemetry.** Token / cost tracking is [#61](https://github.com/tkrisztian95/workout-session-tracker/issues/61).
- **No tool calling.** Structured tool-call mutations are [#60](https://github.com/tkrisztian95/workout-session-tracker/issues/60).
- **No new persisted shape.** `localStorage` keys, migrations, and the export payload are untouched.
- **No prompt rewording.** System prompts in `src/lib/ai/prompts/` are not edited.

## Decisions

### Decision 1 — Single function entry point, not a class or builder

`buildAiContext(feature, options?)` is a plain function returning a plain object. No class hierarchy, no fluent builder, no DI container.

**Rationale:** the envelope is data, not behavior. Per-feature variations (different fields, different limits) are handled by switching on the `feature` parameter inside the function. A builder would optimize for a flexibility we do not need at this scale (four call sites).

**Alternative considered:** a `ContextBuilder` class with `withProfile()` / `withSessions()` / `build()`. Rejected — adds ceremony, makes the inclusion rules per feature implicit (visible only by reading each call site instead of one function), and would later need refactoring once `feature` becomes the actual switch.

### Decision 2 — `feature` is an explicit literal union, not a free-form string

```ts
type AiFeature = 'plan-suggest' | 'exercise-swap' | 'plan-adjust' | 'notes-import';
```

**Rationale:** new features get a compile-time slot rather than a hidden ad-hoc string. Future budget-guard logic ([#62](https://github.com/tkrisztian95/workout-session-tracker/issues/62)) can be exhaustively switched.

**Alternative considered:** a string with documentation. Rejected on the same grounds — explicit unions are why we use TypeScript.

### Decision 3 — `SessionSummary` is a new, narrow type — `WorkoutSession` is not sent

The envelope's `recentSessions: SessionSummary[]` field carries a compressed shape, not the raw `WorkoutSession`. `SessionSummary` includes only fields needed by current AI prompts:

```ts
interface SessionSummary {
  id: string;
  completedAt: string;
  planId?: string;
  planDayName?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  durationMin?: number;
  totalVolumeKg?: number;
  exerciseCount: number;
  /** Compact exercise rollup: name + sets + best weight in this session. */
  topExercises: Array<{ name: string; muscle?: Muscle; bestWeightKg?: number; sets: number }>;
}
```

**Rationale:** raw sessions carry per-set logs that explode token cost; AI features today already throw most of it away via `summariseSession`. Make the throwaway explicit at the type boundary.

**Alternative considered:** send `WorkoutSession[]` as-is and let consumers compress. Rejected — duplication of `summariseSession`-style logic across features is exactly the drift this change exists to eliminate. Centralize once.

### Decision 4 — `progression` reuses `ExerciseProgression` from `statsUtils.ts`

Re-export the existing `ExerciseProgression` interface and the existing `getExerciseWeightProgression` function from a single place. The envelope's `progression` field is `ExerciseProgression[]`.

**Rationale:** the type already exists, is already battle-tested by the stats page, and follows the same "last N appearances" trimming that AI features want.

**Trade-off:** the `sessionDates` strings are localized for the stats page (`'short'` month / `'numeric'` day). For AI prompts, ISO dates would be more model-friendly. Mitigation: format inside the prompt builder when the field is consumed, not when it's built. Don't fork the type.

### Decision 5 — Deferred fields are declared, never auto-injected

```ts
interface AiContext {
  // ... populated today
  profile: ContextProfile;
  activePlans: WorkoutPlan[];
  recentSessions: SessionSummary[];
  progression: ExerciseProgression[];
  // ... deferred (declared, always undefined in Phase 1)
  preferences?: ContextPreferences; // populated by #53
  evaluation?: SessionEvaluation[]; // populated by #54
  likes?: ContextLikes; // populated by #52
}
```

In Phase 1 `buildAiContext` never populates the deferred fields — they will be `undefined` at runtime. Consumers must handle `undefined` already since the types say `?:`.

**Rationale:** when a feeder issue lands, the change is purely additive (one read in `buildAiContext`, no consumer signatures change). This is the entire point of Phase 1.

**Alternative considered:** omit the deferred fields from the type until they exist. Rejected — would require a type change in every consumer when the field is added later. Defeats the purpose of writing the envelope first.

### Decision 6 — `getRecentExerciseNames` migration

`importSessions` accepts an `existingExerciseNames: string[]` argument today. The envelope subsumes this — `recentSessions[*].topExercises[*].name` plus a derived `exerciseHistoryNames: string[]` field in the envelope (cheap to compute, useful for notes-import disambiguation).

**Rationale:** notes-import already wants exactly this; centralizing it removes one ad-hoc parameter.

**Trade-off:** small expansion of the envelope. Mitigation: limit to ~100 names by frequency in `buildAiContext` (same cap notes-import uses today).

### Decision 7 — `recentSessions` is sorted newest-first, capped to 20

Matches current `suggestPlan` behavior. Cap is a hard-coded constant exported from `context.ts` (`RECENT_SESSIONS_LIMIT`) so [#62](https://github.com/tkrisztian95/workout-session-tracker/issues/62) can tighten it without grepping.

**Alternative considered:** make the cap configurable per call. Rejected — adds knobs nobody needs and pre-empts #62's job.

## Risks / Trade-offs

- **Risk:** changing the entry-point signature of four features could break the four modal callers. **Mitigation:** the modals are the only callers; covered in tasks (Section 5) with explicit migration steps and a "build + run vitest + manual smoke" gate.
- **Risk:** `summarisePlan` and `summariseExercise` currently live in `plan.ts` and are imported by `adjust.ts`. Moving them risks a circular-import surprise. **Mitigation:** the refactor leaves these in `plan.ts` for now; `context.ts` only imports them. If a circular import shows up, extract to a new `src/lib/ai/summaries.ts`.
- **Risk:** `swapExercise` and `adjustPlan` will start receiving body metrics + history that they were not getting before. The LLM may behave differently on existing prompts. **Mitigation:** the system prompts for these features are not modified; the user message just contains more context blocks. If quality regresses, the system prompt can be trimmed in a follow-up PR. Evaluation is qualitative (manual + the existing `npm run eval` harness in `evals/`).
- **Trade-off:** dragging `getRecentExerciseNames` into the envelope makes the envelope mildly larger for features that don't use it. Acceptable; trimming happens in #62.
- **Trade-off:** the envelope is built fresh on every AI call. No memoization. For a single user clicking once per minute this is fine; if the in-session coach ([#63](https://github.com/tkrisztian95/workout-session-tracker/issues/63)) runs once per set, memoization may become useful — out of scope here.

## Migration Plan

This is internal refactor only — no user-facing migration. The deployment plan is the standard PR flow:

1. Land this change on `main` via PR.
2. Vercel preview builds verify the four features still work end-to-end.
3. Once merged, no rollback complexity: `git revert` of the merge commit restores prior behavior because no persisted shape changed.

## Open Questions

- **Should `recentSessions` exclude sessions whose `completedAt` is missing?** Today some callers filter them out (stats), others don't (plan suggestion). Resolution proposal: filter out by default inside `buildAiContext`, document the filter in the function JSDoc.
- **Should the envelope include the user's locale / language?** Today each feature accepts `language` as a separate arg used only for the response language instruction. Resolution proposal: add `language: Locale | null` to the envelope, drop the separate `language` arg from feature signatures. If consensus disagrees, leave `language` out and keep the param.
- **Where do `summariseExercise` / `summarisePlan` belong long-term?** Currently in `plan.ts`. They are now used by `context.ts`, `plan.ts`, and `adjust.ts`. Resolution proposal: leave them in `plan.ts` until a third caller appears, then move to `summaries.ts`. Tracked as a follow-up.
