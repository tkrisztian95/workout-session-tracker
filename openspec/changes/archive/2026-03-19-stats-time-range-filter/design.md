## Context

The stats page (`src/app/stats/page.tsx`) loads all sessions from localStorage and passes them directly to `computeStats`, `getWeeklyVolumeChartData`, and `getExerciseWeightProgression`. All three functions accept a `WorkoutSession[]` array and do their own filtering internally. There is no concept of a date range today.

The UI is a single client component with no routing or query params — state lives in React local state.

## Goals / Non-Goals

**Goals:**

- Add a time range selector (1 Day, This Week, This Month, 90 Days, All) above the stat cards
- Filter the session list passed to all three stat functions based on the selected range
- Selection persists for the lifetime of the page (no localStorage persistence needed)
- All labels translated via the existing locale system

**Non-Goals:**

- Custom date range picker
- Persisting the selected range across page reloads
- Changing the chart granularity (chart stays weekly regardless of range)
- Server-side filtering

## Decisions

### Filter at the page level, not inside utilities

Pass a pre-filtered `filteredSessions` array to all three utility functions rather than adding a range parameter to each function.

**Why**: The utilities already accept `WorkoutSession[]`. Filtering at the call site is simpler, keeps the utilities generic, and avoids coupling them to a specific range concept. The alternative — adding `dateRange` params to each utility — would require touching more code and makes the utilities less reusable.

### Compute range boundaries with plain Date arithmetic

Define a `getDateBoundary(range)` helper that returns a `Date | null` (null = All). Filter sessions where `completedAt >= boundary`.

**Why**: No new dependencies. The ranges are calendar-aligned (start of today, start of this week/month) which is straightforward with `setHours(0,0,0,0)` and `setDate`/`setMonth`.

### Range selector as a horizontal pill/tab strip

Render the five options as a row of tappable chips above the stat cards, styled consistently with the app's existing pill patterns.

**Why**: 5 short labels fit on one row on mobile. A dropdown adds an extra tap. Tabs/chips give immediate visual feedback on the active selection.

### Weeks for "This Week" = Monday-to-now

Align with the existing `getWeeklyVolumeChartData` logic which already uses Monday as week start.

## Risks / Trade-offs

- **Sparse data for short ranges**: Selecting "1 Day" or "This Week" with no sessions in that window will show zeros rather than the empty state. This is correct behavior — the empty state is reserved for all-time zero sessions.
- **Weekly frequency metric with short ranges**: `weeklyFrequency` divides sessions by weeks elapsed since the first session in the filtered set. For "1 Day" this could show inflated numbers. Acceptable for now; the metric is labeled clearly.

## Migration Plan

No migration needed. All changes are additive UI and client-side filtering. No data model or API changes.
