## 1. Types & formatting core

- [x] 1.1 Add `repsPerSet?: number[]` to `Exercise` and `PlanExercise` in `src/lib/types.ts`, documenting that it is mutually exclusive with `reps`
- [x] 1.2 Add `formatRepsTarget(ex)` to `src/lib/sessionUtils.ts` returning `"10"` for uniform reps or `"15/12/8/4"` for a scheme
- [x] 1.3 Update `formatExerciseDetail` to render `sets-reps` as the scheme (`15/12/8/4`) when `repsPerSet` is present, and `sets×reps` otherwise
- [x] 1.4 Add a `parseRepScheme(text)` helper (accepts comma/space/slash separators, returns a positive-integer array) — colocate in `sessionUtils.ts`

## 2. Authoring UI

- [ ] 2.1 Add a Fixed / Per-set toggle to `AddPlanExerciseModal` for `sets-reps`; in per-set mode replace the Reps field with a scheme text field and hide the Sets field
- [ ] 2.2 On submit in `AddPlanExerciseModal`, build `repsPerSet` (+ `sets = length`, omit `reps`) when per-set yields ≥2 numbers, else save fixed; open in per-set mode when `initialValues.repsPerSet` exists
- [ ] 2.3 Apply the same toggle, fields, and submit logic to `AddExerciseModal`
- [ ] 2.4 Carry `repsPerSet` through the history-picker prefill (`applyHistoryEntry`) in both modals

## 3. Display surfaces

- [ ] 3.1 Update `ExerciseCard` `exerciseDetail` to show the scheme for variable exercises
- [ ] 3.2 In `ExerciseCard`, show each set slot's individual rep target when `repsPerSet` is present
- [ ] 3.3 Prefill the set-logging form (`openSetForm`) with `repsPerSet[loggedCount]`, falling back to the last entry
- [ ] 3.4 Update `OptionalPickerScreen` rep target rendering to use the scheme
- [ ] 3.5 Update `HistoryExerciseEditor.formatTarget` to render the scheme; in `HistoryExerciseEditorContent` seed the rep rows from `repsPerSet` when there are no logged sets

## 4. AI & history round-trip

- [ ] 4.1 Update `summariseExercise` and `summariseSession` in `src/lib/ai/plan.ts` to render a scheme as `15/12/8/4`
- [ ] 4.2 Normalise `repsPerSet` in `plan.ts` (`normalizePlanExerciseMuscle` path / `ensureIds`) and `import.ts` (`normalizeAiExerciseMuscle`): keep a valid array, set `sets`, drop `reps`
- [ ] 4.3 Update the plan prompt (`src/lib/ai/prompts/plan/v1.ts`) and import prompts (`import/v1.ts`, `v2.ts`) to describe `repsPerSet` and when to use it
- [ ] 4.4 Add `repsPerSet` to `HistoryEntry` / `ExerciseCandidate` and capture/restore it in `src/lib/exerciseHistory.ts`
- [ ] 4.5 Carry `repsPerSet` in the `NewHistorySessionSheet` plan-exercise prefill
- [ ] 4.6 Handle `repsPerSet` in the `AiImportReviewView` exercise editor

## 5. Localization

- [ ] 5.1 Add keys for the Fixed / Per-set toggle and the scheme field label/placeholder/hint to `en.json`, `de.json`, `hu.json`

## 6. Verification

- [ ] 6.1 Run `npm run lint` and `npx tsc --noEmit` (or the project's typecheck) clean
- [ ] 6.2 Run `npm test` (Vitest) and confirm existing suites still pass
- [ ] 6.3 Visual sanity check: create a plan exercise with a `15/12/8/4` scheme, start a session, confirm slot targets and logging prefill
