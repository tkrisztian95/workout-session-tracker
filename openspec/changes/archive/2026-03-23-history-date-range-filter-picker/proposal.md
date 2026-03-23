## Why

The history screen currently shows a text badge when navigating from an activity tile, but the badge is redundant — scrolling to the day is sufficient feedback. Additionally, there is no way for users to filter the history list by a custom date range, making it hard to browse older sessions. A dedicated date range picker built in a mobile-native style fills this gap.

## What Changes

- **BREAKING**: Remove the filter badge UI added to `HistoryPage` — when a `?date` param is present the page simply scrolls to that day group and shows all sessions (no filtering, no badge)
- Add a calendar icon button in the History page header (next to the `+` button) that opens a bottom-sheet date range picker
- The picker lets the user choose a **from** and **to** date via a three-column drum/scroll picker: year → month → day, styled for mobile
- When a date range is active, the history list is filtered to sessions within that range; the list is otherwise unchanged
- An active range indicator (compact, e.g. "Mar 1 – Mar 23") with a clear button is shown in the header only when a range filter is active (separate from tile-navigation scrolling)
- Tapping an activity tile still scrolls to that day (existing behaviour), no filtering applied

## Capabilities

### New Capabilities

- `history-date-range-filter`: A date range filter on the History page — a bottom-sheet picker with mobile drum-scroll column selectors for year/month/day (from & to), which filters the session list and shows a dismissible active-range label

### Modified Capabilities

- `history-date-filter`: The `?date` query param now only triggers a scroll-to-day; it no longer filters the visible session list or shows a filter badge

## Impact

- `src/app/history/page.tsx` — remove badge UI, remove `visibleGroups` filtering by `dateFilter`; add range filter state, calendar button, and range filter label
- New component `src/components/DateRangePicker.tsx` — bottom-sheet with two drum pickers (From / To), each with year/month/day columns
- No new dependencies required (pure CSS/React scroll snap columns)
