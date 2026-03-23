## Why

History cards currently show duration but not the start time, making it hard to distinguish multiple sessions on the same day or recall when a workout happened. Users need to see the start time at a glance and have same-day sessions ordered with the most recent on top.

## What Changes

- Display the workout start time (e.g., "14:32") on each history card
- Order sessions within each day by start time, latest first

## Capabilities

### New Capabilities

- `history-card-start-time`: Show the formatted start time on each history card and sort same-day sessions by start time descending

### Modified Capabilities

(none)

## Impact

- `src/app/history/page.tsx`: Add start time display to the card subtitle line; change within-day sort to use `startedAt` descending
- Locale strings may need a new key for formatting context if needed
