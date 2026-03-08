## Why

Completed workout sessions are currently read-only. Users have no way to correct mistakes made during logging — wrong reps, forgotten exercises, or accidentally skipped sets — which erodes trust in their historical data over time.

## What Changes

- The session detail view (`/history/[id]`) gains an edit mode toggle
- In edit mode, users can update sets/reps/duration values on each exercise
- In edit mode, users can toggle an exercise's completed/dismissed state
- Edits are persisted back to localStorage via the existing storage layer
- The history list view reflects updated data immediately on return

## Capabilities

### New Capabilities

- `session-history-editing`: Allows users to enter an edit mode on a completed session detail view and modify exercise data (sets, reps, duration) and completion state, with changes persisted to storage

### Modified Capabilities

- `workout-history`: The session detail view now supports editing in addition to read-only display — requirements for the detail screen change to include an edit/save flow

## Impact

- `src/app/history/[id]/page.tsx` — primary change surface; adds edit mode UI and save logic
- `src/lib/storage.ts` — needs an `updateSession` (or equivalent) write function if one doesn't already exist
- `src/lib/types.ts` — no type changes expected; existing `WorkoutSession` shape covers editable fields
- No new dependencies required
