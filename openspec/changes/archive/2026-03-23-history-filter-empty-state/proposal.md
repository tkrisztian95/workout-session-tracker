## Why

When the date range filter is active but no sessions fall within the selected range, the History page shows the same generic "No sessions yet" empty state as when there are truly no sessions at all. This is misleading — the user may think they have no history, when in fact their filter is just too narrow. A filter-specific message avoids confusion and hints at the remedy.

## What Changes

- When `visibleGroups` is empty **and** a date range filter is active, display a distinct empty state: e.g. "No workouts in this range" with a subtitle "Try widening your date range"
- The existing "No sessions yet" empty state is unchanged for the case when there are truly no sessions
- No new UI components needed — the existing `EmptyState` component accepts different `title` and `subtitle` props

## Capabilities

### New Capabilities

- `history-filter-empty-state`: Context-aware empty state on the History page that distinguishes between "no sessions exist" and "no sessions match the active filter"

### Modified Capabilities

_(none)_

## Impact

- `src/app/history/page.tsx` — add conditional logic: if `visibleGroups.length === 0 && dateRange filter is active`, show filter-specific copy
- `src/locales/en.json`, `hu.json`, `de.json` — add two new translation keys: `history_filter_no_results_title`, `history_filter_no_results_subtitle`
- `src/lib/i18n.ts` (or equivalent type) — expose the new keys if translations are typed
