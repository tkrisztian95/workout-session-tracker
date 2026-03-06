## Why

Users accumulate workout plans over time but have no way to retire plans they've finished without permanently deleting them. Marking a plan as completed lets users archive finished programs while keeping their history intact.

## What Changes

- Plans list gains a "Mark as Completed" action per plan
- Completed plans are visually distinguished (e.g., greyed out, badge) and moved to a "Completed" section or filterable state
- Completed plans cannot be used to start new sessions (they are read-only)
- Users can reactivate a completed plan back to active status

## Capabilities

### New Capabilities

- `plan-completion`: Ability to mark a workout plan as completed, view completed plans separately, and reactivate them

### Modified Capabilities

- `workout-plans`: Plans now have a `status` field (`'active'` | `'completed'`) that affects visibility and usability in the plan list and session start flow

## Impact

- `WorkoutPlan` data model gains a `status` field (non-breaking; existing plans default to `'active'`)
- Plans list UI needs filtering/sections for active vs. completed plans
- Session start flow must prevent starting a session from a completed plan
- localStorage migration: plans without `status` are treated as `'active'`
