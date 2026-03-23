## Why

When a user taps an activity tile with multiple sessions, the app currently navigates to the history screen without any filtering, forcing the user to manually scroll to find that day. This change makes tile taps immediately surface the relevant day by filtering the history list and scrolling to it.

## What Changes

- Tapping an activity tile with multiple sessions navigates to `/history?date=YYYY-MM-DD` instead of plain `/history`
- The History page reads the `date` query param on mount and filters the displayed sessions to only that date
- A visible filter indicator/badge is shown when a date filter is active, with a clear/dismiss button
- When a date filter is active, the activity tiles on the history page highlight the selected day
- Tapping a tile with exactly one session continues to navigate directly to `/history/[id]` (unchanged)

## Capabilities

### New Capabilities

- `history-date-filter`: Filter the history list by a specific date, driven by a URL query param (`?date=YYYY-MM-DD`), with a dismissible filter badge and scroll-to-date behavior

### Modified Capabilities

- `activity-tiles`: Navigation behavior for multi-session tiles changes from `/history` to `/history?date=YYYY-MM-DD`

## Impact

- `src/components/ActivityTiles.tsx` — update `handleTileTap` for multi-session case
- `src/app/history/page.tsx` — read `?date` param, filter grouped sessions, show active filter UI
- `openspec/specs/activity-tiles/spec.md` — delta to clarify the multi-session navigation target
