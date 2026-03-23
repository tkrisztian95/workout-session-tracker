## Context

The History page was recently updated to support a `?date` query param that filtered the list and showed a badge. This change reverts the filtering/badge behaviour and replaces it with a richer interaction:

1. `?date` navigations from activity tiles only scroll-to-day — no list filtering, no badge.
2. A new calendar icon button in the header opens a `BottomSheet` with a **date range picker**, letting users filter by a custom from/to window.

The app is a Next.js App Router project with no date/calendar library currently installed. All existing bottom sheets use the `BottomSheet` UI component from `src/components/ui/BottomSheet.tsx`.

## Goals / Non-Goals

**Goals:**

- Remove the filter badge and list-filtering triggered by `?date`; keep only the scroll-to-day behaviour
- Add a date range filter accessible from a calendar button in the History header
- The picker is a **mobile drum-scroll** style: three vertically-scrolling columns (Year / Month / Day) per endpoint (From and To), styled with CSS scroll snap and a centered highlight bar
- No external date-picker library — pure React + CSS scroll snap
- Active range is shown as a compact dismissible label in the header only when a range is set
- Filtering is applied in React state, not the URL (range filters are session-local)

**Non-Goals:**

- Persisting the range filter across page refreshes
- Filtering by time-of-day
- Multi-month calendar grid view
- Preset shortcuts (e.g. "Last 7 days") — single picker interaction only

## Decisions

### CSS scroll-snap drum columns, no external library

**Chosen**: Each column (year, month, day) is a `<div>` with `overflow-y: scroll`, `scroll-snap-type: y mandatory`, and child items styled with `scroll-snap-align: center`. A fixed-height window shows ~5 items; the center item is the selected value. A passive `scroll` listener (debounced via `requestAnimationFrame`) reads `scrollTop / itemHeight` to derive the selected index.

**Alternative**: `react-mobile-picker`, `react-scroll-picker`, or a swipeable list library. Rejected to avoid adding a dependency and to keep full control over styling (the app uses Tailwind + CSS variables for theming).

### From/To as React state in `HistoryContent`

The date range is `{ from: string | null; to: string | null }` held in `useState` inside `HistoryContent`. It is not put in the URL because:

- Ranges produce long, ugly query strings
- The intent is a short-lived session filter, not a shareable URL
- The existing `?date` scroll-only param continues to work independently

### Single `DateRangePicker` component — two drum pickers inside one sheet

The sheet contains two `DrumDatePicker` sub-components (From / To) laid out side-by-side or stacked. Each `DrumDatePicker` renders three scroll columns and reports `{ year, month, day }` up via `onChange`. The parent sheet manages "Apply" / "Clear" / "Cancel" actions.

### Active range label in header (not a badge on the list)

When a range is set, a compact label like `"Mar 1 – Mar 23 ×"` appears in the header row alongside the title and buttons. Tapping `×` clears the range. This is separate from the `?date` scroll-navigation path and requires no URL changes.

### Default picker value

When opening the picker with no active range, From defaults to 30 days ago and To defaults to today, giving a sensible starting point without forcing the user to scroll far.

## Risks / Trade-offs

- **Scroll-snap column sync on iOS Safari** — passive scroll events can lag behind momentum scrolling. Mitigated by snapping the column back to the nearest item on `scrollend` (or a `touchend` fallback).
- **From > To validation** — if the user sets From after To, apply the range as a single-day filter (From === To) or swap silently. Mitigated by clamping To to be ≥ From when the user changes From.
- **Long year lists** — the year column may need to scroll significantly for users with old data. Mitigated by initialising columns scrolled to the default value on open.
