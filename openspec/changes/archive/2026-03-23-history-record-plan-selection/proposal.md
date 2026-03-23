## Why

The new manual history record feature always creates a free session, so past workouts done from a plan cannot be logged retroactively with the correct plan/day association — they appear without a plan name and don't contribute to plan-level stats or progression tracking.

## What Changes

- The `NewHistorySessionSheet` gains a **session type step**: the user first picks "From a plan" or "Free session" before entering the rest of the details.
- For **plan-based records**: the user selects a plan and one of its days; the exercise list is pre-populated with the day's core exercises (optional exercises remain opt-in). The saved session carries `planId` and `planDayId`.
- For **free sessions**: the existing flow is unchanged — exercises are added manually and the session has no plan association.
- The history list and detail view already handle `planId`/`planDayId` display correctly; no changes needed there.

## Capabilities

### New Capabilities

- `history-record-session-type`: Step in the new history record sheet that lets the user choose between a plan-based record and a free session before filling in date, duration, and exercises.
- `history-record-plan-prefill`: When the user selects a plan and day for a new history record, the exercise list is pre-populated with the day's core exercises (as incomplete/uncompleted), ready to have their execution details filled in.

### Modified Capabilities

- `history-manual-record`: The new session sheet now requires a session-type selection step before the date/duration/exercise form. The save path for plan-based records sets `planId` and `planDayId` on the `WorkoutSession`.

## Impact

- `src/components/NewHistorySessionSheet.tsx` — add session-type selection step and plan/day picker; thread `planId`/`planDayId` into the saved session for plan-based records.
- `src/lib/storage.ts` — no changes; `getPlans()` already available.
- `src/lib/types.ts` — no changes; `WorkoutSession.planId` and `planDayId` already exist.
