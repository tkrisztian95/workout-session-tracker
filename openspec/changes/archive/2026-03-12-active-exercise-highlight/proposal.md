## Why

During an active workout session, all remaining exercises are displayed in a flat, uniform list with no visual distinction between the exercise being performed and those yet to come. Users need quick access to details (target weight, scaling notes) while performing an exercise, and need control over execution order without being forced to follow the predefined sequence.

## What Changes

- The first remaining exercise is visually separated as the "active" exercise with a prominent card (larger text, brand-color border, expanded padding)
- Target weight (`weightKg`) is surfaced on the active card — it was previously never shown during a session
- Scaling notes (`scalingNote`) are shown with higher contrast on the active card
- Queue exercises ("Up Next") display a play button allowing the user to promote any queued exercise to active position
- Session exercise order can be reordered at runtime without modifying the plan

## Capabilities

### New Capabilities

- `active-exercise-highlight`: Separates the currently executing exercise from the upcoming queue, surfaces plan details on the active card, and allows the user to select any queued exercise as the next to execute.

### Modified Capabilities

## Impact

- `src/components/ExerciseCard.tsx`: New `isActive`, `targetWeightLabel`, and `onSetActive` props
- `src/app/page.tsx` (`SessionView`): Splits `remaining` into `activeExercise` + `queue`; adds `handleSetActive` reorder logic
- `src/locales/*.json`: Three new translation keys (`active_exercise_section`, `upcoming_section`, `target_weight`)
