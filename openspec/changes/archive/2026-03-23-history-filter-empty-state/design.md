## Context

`HistoryContent` in `src/app/history/page.tsx` already has two empty state branches:

1. `sessions.length === 0` → no sessions at all
2. `visibleGroups.length === 0` → currently shows the same generic copy

Branch 2 is only reachable when a `dateRange` filter is active (if no filter is active, `visibleGroups === grouped` which cannot be empty when `sessions.length > 0`). The fix is to pass different copy to the `EmptyState` component in branch 2.

## Goals / Non-Goals

**Goals:**

- Branch 2 of the empty state check shows filter-specific title + subtitle
- All three locales (en, hu, de) have translations for the new keys
- Zero new components, zero new state

**Non-Goals:**

- A "Clear filter" shortcut button inside the empty state (could be added later)
- Distinguishing between `?date` scroll-navigation and manual range filter (both use the same `visibleGroups` path)

## Decisions

### Reuse `EmptyState` with different props

The simplest approach — no new component. The condition `dateRange.from && dateRange.to` already determines whether a range is active. Branch 2 is only hit when both are true and no groups match, so no additional guards are needed.

### Add translation keys rather than hardcode strings

The app has full i18n support across en/hu/de. Hardcoding English strings in the component would be inconsistent. Adding `history_filter_no_results_title` / `history_filter_no_results_subtitle` keeps the pattern uniform.
