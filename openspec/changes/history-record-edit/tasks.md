## 1. HistoryExerciseEditor Component

- [x] 1.1 Create `src/components/HistoryExerciseEditor.tsx` as a bottom sheet component accepting an `Exercise` (with optional `loggedSets`) and callbacks `onConfirm` / `onCancel`
- [x] 1.2 For `sets-reps` exercises: render one editable row per `loggedSets` entry (weight kg + reps inputs), defaulting to one empty row if none exist
- [x] 1.3 Add "Add set" button that appends a new empty row, and a remove button per row
- [x] 1.4 For `duration` / `sets-duration` exercises: render a single duration-in-seconds numeric input pre-filled from `exercise.duration`
- [x] 1.5 Show plan-target values (sets, reps, duration goal) as read-only context text (e.g., "Target: 3×10")
- [x] 1.6 Confirm button calls `onConfirm` with updated `loggedSets` (sets-reps) or updated `duration` (other types); Cancel calls `onCancel` without changes

## 2. Wire History Exercise Editor into Session Detail Edit Mode

- [x] 2.1 In `src/app/history/[id]/page.tsx`, replace the `AddExerciseModal` used for editing existing exercises (`editingExercise`) with `HistoryExerciseEditor`
- [x] 2.2 Update `handleEditExercise` (or replace with a new handler) to apply `loggedSets` / `duration` patch from `HistoryExerciseEditor` onto the draft exercise
- [x] 2.3 Keep `AddExerciseModal` only for adding new exercises to the draft (the "Add exercise" button flow)

## 3. New Manual Session Record — Creation Sheet

- [x] 3.1 Create `src/components/NewHistorySessionSheet.tsx` as a bottom sheet with: date picker (defaults to today), duration-in-minutes input, exercise list (initially empty), and Save / Cancel actions
- [x] 3.2 Render exercise list in the sheet using the same card style as the detail view; each exercise shows an edit icon wired to `HistoryExerciseEditor`
- [x] 3.3 Add an "Add exercise" button inside the sheet that opens `AddExerciseModal` to pick name/type/category, then immediately opens `HistoryExerciseEditor` for execution details
- [x] 3.4 Disable the Save button when the exercise list is empty
- [x] 3.5 On Save: construct a `WorkoutSession` object (new `crypto.randomUUID()` id, `startedAt` / `completedAt` derived from chosen date and duration, `exercises`, no `planId`), call `saveSession`, close the sheet, and refresh the history list

## 4. New Session Entry Point on History Page

- [x] 4.1 Add a "+" / "New session" button to the History page header (`src/app/history/page.tsx`)
- [x] 4.2 On tap, open `NewHistorySessionSheet`
- [x] 4.3 After sheet saves, re-read sessions from storage and update the list state so the new record appears immediately

## 5. Localization

- [x] 5.1 Add translation keys for new UI strings: new session button label, sheet title, date label, duration label, target context pattern, set row labels (weight, reps), add set / remove set actions
- [x] 5.2 Apply translation keys in all new components; ensure keys exist in all supported locale files
