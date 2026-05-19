## Why

Today a `sets-reps` exercise carries a single `reps` value, so every set of that exercise targets the same number of reps (e.g. `4×10`). Real training plans frequently use a descending (or otherwise varying) rep scheme — a hypertrophy/strength pyramid like `15, 12, 8, 4` — where each set has its own target. There is no way to express that, forcing users to either flatten the scheme to one number or split one movement into several fake exercises.

## What Changes

- Add an optional `repsPerSet: number[]` field to `Exercise` and `PlanExercise`. When present it holds the per-set rep targets and is the source of truth for the set count; `reps` continues to cover the uniform case. The two are mutually exclusive.
- Let the user choose between a fixed rep count and a per-set scheme when adding or editing an exercise — in the plan editor (`AddPlanExerciseModal`) and in an active session (`AddExerciseModal`).
- Show the scheme wherever an exercise target is rendered: plan rows, the session exercise card (including per-set slot targets), the optional-exercise picker, and the history editors.
- Prefill the in-session set-logging form with the target for the _next_ set rather than a single fixed value.
- Teach the AI plan-suggestion and notes-import flows to emit and parse `repsPerSet`, and include it in the human-readable summaries sent to the model.
- Carry `repsPerSet` through the exercise-history picker and the "new history session" prefill so a varying scheme round-trips.

## Capabilities

### New Capabilities

- `variable-exercise-reps`: an exercise may define a per-set rep scheme (`repsPerSet`) instead of a single fixed rep count, and that scheme is authored, displayed, logged against, and carried through AI and history flows.

### Modified Capabilities

- None — existing capabilities keep their behaviour for the uniform-reps case; the new field is additive and optional.

## Impact

- **Types**: `Exercise` and `PlanExercise` gain `repsPerSet?: number[]`; `exerciseHistory` `HistoryEntry`/`ExerciseCandidate` gain the same.
- **UI**: `AddPlanExerciseModal`, `AddExerciseModal`, `ExerciseCard`, `PlanExerciseRow`, `HistoryExerciseEditor`, `AiImportReviewView`, `OptionalPickerScreen`.
- **Logic**: `sessionUtils.formatExerciseDetail`, a new `formatRepsTarget` helper, `exerciseHistory` capture, `NewHistorySessionSheet` prefill.
- **AI**: `src/lib/ai/plan.ts` + `src/lib/ai/import.ts` summaries and normalisation; plan/import prompt files.
- **i18n**: new keys for the fixed/per-set toggle and scheme labels in `en`, `de`, `hu`.
- **Storage**: no migration — old data has no `repsPerSet` and behaves exactly as before.
- **Dependencies**: none.
