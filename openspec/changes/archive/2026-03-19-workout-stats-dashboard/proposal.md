## Why

Users can log sessions and track exercises, but have no way to review aggregate trends across their workout history. A dedicated statistics page provides motivation and insight by surfacing volume, consistency, and progress over time.

## What Changes

- Add a new **Statistics** tab (or navigation entry) with a dedicated stats page
- Display summary stat cards: total sessions, total volume lifted, avg session duration, avg weight per exercise, workout frequency/recurrence
- Display an interactive chart showing session volume or weight trend over time
- Display a per-exercise weight progression table: for each exercise that has ever been logged with a weight, show the weight history across sessions and a trend arrow (up / flat / down)
- Pull data from existing session and exercise-set history

## Capabilities

### New Capabilities

- `workout-statistics`: Stats page displaying aggregate metrics (session count, total volume, avg duration, avg weight, recurrence), a time-series chart for session volume/weight trends, and a per-exercise weight progression table with trend indicators

### Modified Capabilities

<!-- No existing spec requirements are changing -->

## Impact

- New page/screen component wired into the app navigation
- Read-only queries over existing workout sessions and exercise set data
- No backend changes required — computed client-side from local data store
- May depend on existing `workout-sessions`, `exercise-set-logging`, `exercise-weight`, and `workout-history` capabilities for data access patterns
