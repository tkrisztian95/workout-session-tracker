## Why

When a user picks an exercise from wger suggestions, the category is displayed transiently below the input but is never saved, so it vanishes after the exercise is added. Users who want to see exercise categories on their plans have no way to do so, and users entering custom exercise names have no way to assign a category at all.

## What Changes

- Add an optional `category` field to the `PlanExercise` data model so category can be persisted alongside the exercise name.
- When a user selects a wger suggestion, auto-populate the category and persist it when the exercise is saved.
- Add a manual category selector (dropdown) beneath the exercise name input in `AddPlanExerciseModal` and `AddExerciseModal`. It appears after the wger suggestion area so the user can pick or override a category when no suggestion was chosen or the suggestion had no category.
- Display the persisted category label on exercises in the plan detail view wherever exercises are listed (shared exercises, day core/optional lists).

## Capabilities

### New Capabilities

- `plan-exercise-category`: Optional category field on plan exercises — persisted when selected from suggestions or chosen manually, and displayed in plan views.

### Modified Capabilities

- `exercise-lookup-wger`: Category selected from a suggestion is now persisted to the exercise record (previously only shown transiently). The manual category selector is a fallback that co-exists with the suggestion flow.
- `workout-plans`: `PlanExercise` gains an optional `category` field; plan views render it when present.

## Impact

- `src/lib/types.ts`: `PlanExercise` gains `category?: string`
- `src/components/AddPlanExerciseModal.tsx`: persist `selectedCategory` in `onAdd` payload; add manual category selector
- `src/components/AddExerciseModal.tsx`: same as above
- `src/app/plans/[id]/page.tsx` (plan detail): render category badge/label on each exercise row
- Locale strings: new key for category selector label and placeholder
- No external API or dependency changes
