## Why

Users who have completed workout plans and sessions accumulate a personal vocabulary of exercises (custom names, categories they actually use). The current "add exercise" flow forces them to retype names or rely on the wger online suggestions, which return generic, often-irrelevant entries. A personal history picker — like a contact book — lets returning users pick from exercises they have already done, faster and with their own naming. It also paves the way for retiring the wger integration, which has proven low-value.

## What Changes

- Add an "Pick from history" entry point in the in-session add-exercise flow that opens a picker showing the user's previously used exercises.
- Add the same picker as an alternative entry point when adding an exercise to a workout plan day or to a plan's shared exercises.
- Build the history list from the user's local data (completed sessions + saved plans), de-duplicated by exercise name + category, sorted by most-recently-used.
- Provide a search/filter input over the history list for users with long histories.
- Allow the user to remove an entry from the history picker (a "forget this exercise" action) without affecting the original session/plan records that produced it.
- Persist removed entries in a per-user "hidden from history" set so removed exercises do not reappear after future sessions.
- Selecting a history entry pre-fills the exercise name and category in the existing add-exercise form, where the user can still adjust sets/reps/weight before confirming.
- **Non-goal (this change)**: removing the wger integration. The wger lookup remains for now and will be retired in a follow-up change once history picker adoption is verified.

## Capabilities

### New Capabilities
- `exercise-history-picker`: lets users browse, search, select, and forget exercises from their own past sessions and plans, as an alternative to typing a name or using wger suggestions.

### Modified Capabilities
- (none — the history picker is additive; the existing add-exercise form, wger lookup, and shared-exercise behaviors are unchanged)

## Impact

- Affected UI: `AddExerciseModal`, `AddPlanExerciseModal`, the session add-exercise entry points, and the plan editor's shared/day exercises sections.
- New data: a derived "exercise history" view computed from `storage.ts` (sessions + plans), plus a new persisted "hidden exercises" list in local storage.
- New components/hooks: `ExerciseHistoryPicker` component and a `useExerciseHistory` hook (deriving + filtering + hiding).
- No backend, no schema migration — local-only feature.
- Sets the stage for a future change to remove `exercise-lookup-wger` and `src/lib/wgerClient.ts`.
