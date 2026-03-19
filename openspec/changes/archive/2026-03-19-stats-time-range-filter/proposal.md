## Why

The statistics tab currently shows aggregate data over all time, giving users no way to see recent trends or progress over a specific period. Adding time range filtering lets users understand their fitness trajectory and compare performance across different windows.

## What Changes

- Add a time range selector to the statistics tab with options: **1 Day**, **This Week**, **This Month**, **90 Days**, **All**
- The `computeStats` utility will accept an optional time range filter to scope the sessions used in calculations
- All stat values (sessions, volume, duration, frequency, avg weight) will update reactively when the range changes
- The selected range will persist in local state for the current session

## Capabilities

### New Capabilities

- `stats-time-range-filter`: Time range selector on the stats tab that filters all displayed statistics to sessions within the chosen window (1 day, this week, this month, 90 days, all time)

### Modified Capabilities

- `workout-sessions`: Stats computation now accepts a date range parameter to filter sessions before aggregation

## Impact

- `src/app/stats/page.tsx` — add range selector UI and filter logic
- `src/lib/statsUtils.ts` — extend `computeStats` to accept a date range or filtered session list
- No new dependencies required; uses native `Date` arithmetic
