## Context

`Exercise` (used in sessions) and `PlanExercise` (used in plans) both model a `sets-reps` movement with a scalar `sets` and a scalar `reps`. A lot of code reads those two numbers directly: target formatting (`sessionUtils.formatExerciseDetail`, `ExerciseCard`, `HistoryExerciseEditor.formatTarget`, `OptionalPickerScreen`), set-slot rendering, the set-logging prefill, AI summaries, and the exercise-history picker. There is no per-set granularity for the *target* (actual logged sets already store per-set `weight`/`reps` in `loggedSets`).

## Goals / Non-Goals

**Goals:**

- Allow an exercise to declare a per-set rep scheme such as `15/12/8/4`.
- Keep the uniform-reps path unchanged for existing data and for users who don't need a scheme.
- Make the scheme visible everywhere a target is shown, and use it to drive set-slot count and the logging prefill.
- Round-trip the scheme through AI suggestion/import and exercise history.

**Non-Goals:**

- Per-set *weight* targets — only reps vary. Weight stays a single optional `weightKg`.
- Variable schemes for `sets-duration` / `duration` exercises.
- A storage migration — old sessions/plans are valid as-is.
- Changing how *logged* sets work; `loggedSets` already captures actual per-set performance.

## Decisions

### `repsPerSet?: number[]` alongside `reps`, mutually exclusive

A new optional `repsPerSet: number[]` is added to `Exercise` and `PlanExercise`.

- **Uniform (existing):** `reps` is set, `repsPerSet` is absent.
- **Variable (new):** `repsPerSet` is set (e.g. `[15, 12, 8, 4]`), `reps` is absent.

In the variable case `sets` is still written and kept equal to `repsPerSet.length`, so every existing consumer of `sets` (set-slot count, `calcSessionStats`) keeps working without change. An exercise SHALL NOT carry both `reps` and `repsPerSet`.

Rationale: an additive optional field needs no migration and no feature flag, and keeping `sets` populated means only code that renders the *rep target* needs to change — not code that counts sets.

### One helper, `formatRepsTarget`

A single helper in `sessionUtils` produces the rep portion of a target string:

```
formatRepsTarget(ex): "10"          // uniform
formatRepsTarget(ex): "15/12/8/4"   // variable
```

`formatExerciseDetail` uses it so `sets-reps` renders `4×10` (uniform) or `15/12/8/4` (variable — the set count is implied by the scheme and the `4×` prefix is dropped to avoid redundancy). All other call sites (`ExerciseCard`, `HistoryExerciseEditor.formatTarget`, `OptionalPickerScreen`) route through the same helper.

### Authoring UI: a Fixed / Per-set toggle

`AddPlanExerciseModal` and `AddExerciseModal` get a small segmented toggle shown only for `type === 'sets-reps'`:

- **Fixed** — current behaviour: a `Sets` number field and a `Reps` number field.
- **Per set** — the `Reps` field is replaced by a single text field where the user types the scheme (`15, 12, 8, 4` — commas, spaces or slashes accepted). The separate `Sets` field is hidden; the set count is the number of parsed entries.

On submit, per-set mode parses the text into a positive-integer array; if it yields fewer than 2 numbers it falls back to fixed mode using the first value. Editing an exercise that already has `repsPerSet` opens directly in per-set mode.

Rationale: a free-text scheme field is compact (good on mobile), naturally variable-length, and matches how lifters write schemes ("15/12/8/4"). Deriving the set count removes a field that could disagree with the scheme.

### Set logging prefills the next set's target

`ExerciseCard.openSetForm` currently prefills `reps` with `exercise.reps`. With a scheme it prefills with `repsPerSet[loggedCount]` (the target for the set about to be logged), falling back to the last scheme entry once all targeted sets are logged. Set-slot placeholders also show their individual target (`#2 · 12`) when a scheme is present.

### AI emits and parses `repsPerSet`

`summariseExercise` / `summariseSession` render a scheme as `15/12/8/4` instead of `sets×reps`. The plan and import prompts are told the field exists and when to use it. `plan.ts` / `import.ts` normalisation: if `repsPerSet` is a non-empty numeric array, keep it and set `sets` to its length and drop `reps`; otherwise leave the uniform fields. Malformed entries are coerced/filtered defensively, consistent with existing muscle normalisation.

## Risks / Trade-offs

- **A consumer reads `reps` without falling back to `repsPerSet`.** Mitigated by routing every target render through `formatRepsTarget` and auditing the grep of `.reps` / `sets-reps` call sites listed in `tasks.md`.
- **Free-text scheme parsing ambiguity.** Mitigated by accepting common separators, ignoring empties, and falling back to fixed mode when the input isn't a real scheme.
- **AI may emit both `reps` and `repsPerSet`.** Normalisation prefers `repsPerSet` when valid and drops `reps`, guaranteeing the mutual-exclusion invariant regardless of model output.

## Migration

None. `repsPerSet` is optional; absent on all existing stored plans and sessions, which therefore keep using `reps`. No version bump, no data rewrite.
