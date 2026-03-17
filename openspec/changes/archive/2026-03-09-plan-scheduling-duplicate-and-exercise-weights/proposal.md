## Why

Plans currently have no concept of a time horizon, making it impossible to commit to a program for a fixed period (e.g., "run this 4-week block"). There is also no way to reuse an existing plan as a template, forcing users to rebuild similar programs from scratch. Finally, exercises carry no weight information, which is the most fundamental load-tracking data in strength training.

## What Changes

- `WorkoutPlan` gains an optional `scheduledWeeks?: number` field — the intended duration of the plan in weeks. Shown and editable in the plan editor; displayed on the plan card and detail page.
- The plan list (and/or detail page) gains a "Duplicate" action that creates a copy of any plan with a new id and a "(copy)" name suffix, then navigates to the duplicate.
- `PlanExercise` gains an optional `weightKg?: number` field. The exercise add/edit form in plans gains a weight input (visible only for `sets-reps` and `sets-duration` types). `Exercise` (session tracking) also gains `weightKg?: number` so the target weight is carried into the session.

## Capabilities

### New Capabilities

- `plan-scheduled-duration`: Plans can carry an optional number-of-weeks goal; shown in the UI wherever the plan is listed or edited.
- `plan-duplicate`: Users can duplicate any plan, producing an editable copy.
- `exercise-weight`: Plan exercises and in-session exercises support an optional target weight (kg).

### Modified Capabilities

- `workout-plans`: `WorkoutPlan` type gains `scheduledWeeks?`; `PlanExercise` type gains `weightKg?`; plan editor form gains corresponding inputs. These are additive, non-breaking changes.
- `session-exercise-tracking`: `Exercise` (session model) gains `weightKg?` so target weight flows into active sessions.

## Impact

- `src/lib/types.ts` — `WorkoutPlan` + `PlanExercise` + `Exercise` type extensions.
- `src/app/plans/page.tsx` — duplicate action in `PlanCard`; display `scheduledWeeks` on card.
- `src/app/plans/[id]/page.tsx` — `scheduledWeeks` input in plan editor.
- `src/components/AddPlanExerciseModal.tsx` — weight field in exercise form.
- `src/components/PlanDayEditor.tsx` — display weight in exercise list items.
- `src/lib/storage.ts` — `duplicatePlan` helper (read plan, clone with new id/name, save).
- No external dependencies. No migration needed (all new fields are optional).
