## 1. Storage Layer

- [ ] 1.1 Add `updateSession(session: WorkoutSession): void` to `src/lib/storage.ts` — finds the session by `id` and replaces it in the stored array, mirroring the `savePlan` pattern

## 2. Edit Mode — Session Detail Page

- [ ] 2.1 Add `isEditing` boolean state and `draft` session state to `src/app/history/[id]/page.tsx`
- [ ] 2.2 Add Edit button to the page header (read mode only) that sets `isEditing = true` and copies session into `draft`
- [ ] 2.3 Add Save and Cancel buttons to the page header (edit mode only); Cancel restores original state; Save calls `updateSession(draft)` then exits edit mode
- [ ] 2.4 In edit mode, render numeric `<input type="number">` fields for sets/reps/duration per exercise (conditional on `exercise.type`), wired to update `draft`
- [ ] 2.5 In edit mode, make the completion indicator tappable to toggle `completed`/`dismissed` on the draft exercise
- [ ] 2.6 Ensure NaN inputs from empty fields are coerced to `undefined` (not `0`) before saving

## 3. Read Mode — Reflect Updated Data

- [ ] 3.1 After saving, verify the detail view re-renders with updated exercise data from the new `draft` (now the live session state)
- [ ] 3.2 Manually verify that returning to the history list shows the same updated data (list reinitialises on remount)
