## Why

Users have no way to manually log a past workout that was not tracked in the app, and the existing history edit experience reuses the plan exercise modal (which edits target values) rather than letting users record what they actually did — per-set weight, reps, and duration as executed.

## What Changes

- Add a "New session" entry point on the History page to create a past workout record manually, including date, duration, and exercises with actual execution data.
- Replace the `AddExerciseModal` in history edit mode with a dedicated **history exercise editor** that captures per-set logged data (`loggedSets`: weight × reps) and actual duration, not plan targets.
- The new editor shows inline set rows (weight + reps inputs per set) for `sets-reps` exercises and a single duration input for `duration`/`sets-duration` exercises, matching the session logging UX.

## Capabilities

### New Capabilities

- `history-manual-record`: Create a new past workout session from the History page with a chosen date, total duration, and exercises populated via the history exercise editor.
- `history-exercise-execution-edit`: Dedicated editor for editing an exercise's actual execution data in a history session — per-set logged sets (weight × reps) for sets-reps, and actual duration for other types — distinct from the plan-target-oriented AddExerciseModal.

### Modified Capabilities

- `session-history-editing`: The exercise edit action in history edit mode will open the new history exercise execution editor instead of `AddExerciseModal`.

## Impact

- `src/app/history/page.tsx` — add "New session" button and creation flow.
- `src/app/history/[id]/page.tsx` — wire exercise edit to new history editor; support newly created sessions.
- New component `src/components/HistoryExerciseEditor.tsx` (or similar) for the per-set execution edit sheet.
- `src/lib/types.ts` — no schema changes needed; reuses existing `Exercise` and `LoggedSet` types.
- `src/lib/storage.ts` — reuses `addSession` / `updateSession`.
