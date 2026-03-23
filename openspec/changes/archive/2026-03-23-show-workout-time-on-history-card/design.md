## Context

The history page (`src/app/history/page.tsx`) renders workout sessions grouped by date. Each card shows the plan name, rating emoji, exercise count, and duration. Sessions are fetched and sorted globally by `completedAt` descending, so same-day ordering is implicitly by completion time. The `startedAt` field is available on every session but not surfaced in the UI.

## Goals / Non-Goals

**Goals:**

- Display the workout start time on each history card
- Sort sessions within a day by start time, latest first

**Non-Goals:**

- Changing the global sort order (still sorted by `completedAt` descending for cross-day grouping)
- Adding timezone selection or conversion beyond the device's local time
- Modifying the detail view (`/history/[id]`)

## Decisions

**Start time vs. completion time display**
Show `startedAt` rather than `completedAt`. The start time is when the user thinks of the workout as having happened and is more natural to display.

**Time formatting**
Use `Date.toLocaleTimeString` with `{ hour: '2-digit', minute: '2-digit' }` so the format respects the user's locale (12h vs. 24h). No new locale string key is needed.

**Within-day sort**
Change the within-day sort to order by `startedAt` descending (latest start first). The global sort by `completedAt` already groups days correctly; we only need to re-sort within each day group after grouping.

**Placement on card**
Append the start time to the existing subtitle line (`"3 exercises · 42 min"` → `"3 exercises · 42 min · 14:32"`), keeping the card compact and consistent with existing metadata formatting.

## Risks / Trade-offs

- [Edge case: sessions with missing `startedAt`] → `startedAt` is set on session creation, so this should never be null for valid sessions. Guard with a fallback to an empty string if needed.
- [Within-day sort change] → Previously within-day order depended on the global sort by `completedAt`. Switching to `startedAt` could reorder cards for sessions where start order differs from completion order (e.g., overlapping sessions). This is acceptable since start time is what we display.
