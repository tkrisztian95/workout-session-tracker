## Context

The app is a Next.js 14 app-router project with localStorage persistence (`wst_sessions` key). The bottom nav currently has two tabs: Home and Plans. The main Home screen (StartScreen) shows action buttons for starting a workout. Completed sessions are stored as `WorkoutSession[]` with `startedAt`, `completedAt`, `exercises`, and optional `planId`/`planName` fields.

## Goals / Non-Goals

**Goals:**

- Add a History tab (third nav item) with a chronological list of completed sessions
- Add an activity tile grid to the Home tab above the action buttons, showing workout frequency over the past ~16 weeks in a GitHub contribution heatmap style
- Tiles are color-coded by session count per day; tapping a tile with a session navigates to a session detail view

**Non-Goals:**

- Server-side data persistence (remains localStorage-only)
- Filtering/search on the history list (keep it simple for now)
- Export or sharing of history data

## Decisions

### D1: History as a new route, not a modal

History is a full tab (`/history` route) to match the existing nav pattern (Home = `/`, Plans = `/plans`). This keeps navigation consistent and avoids complexity of a modal over the in-progress session screen.

_Alternative considered:_ Modal/sheet overlay — rejected because the existing nav already uses route-based tabs, and a sheet over an active session would be confusing.

### D2: Activity tiles computed client-side from localStorage

The tile grid reads `getSessions()` and buckets sessions by date. No new storage keys needed. The tile component receives a `Record<string, number>` (ISO date → session count) computed at render time.

_Alternative considered:_ Precomputed/cached map stored separately — unnecessary complexity for client-only app with small data sets.

### D3: Tile grid shows 16 weeks, Sunday-anchored columns

16 weeks × 7 days = 112 tiles. Rendered as a CSS grid. Each column = one week (Sun→Sat). Current week shown rightmost. This matches GitHub's contribution graph convention that users are already familiar with.

### D4: Color intensity levels (4 shades + rest)

- 0 sessions: `#1F2937` (rest, near-background)
- 1 session: `#7C3AED` (low — purple tint matching brand orange complement)
- 2 sessions: `#F97316` dimmed (moderate)
- 3+ sessions: `#F97316` full (heavy)

_Using orange accent to stay on-brand rather than GitHub's green._

### D5: Session detail route reuses history list entry

Tapping a tile or a history card navigates to `/history/[id]` which shows full session detail (exercises, sets, duration). This page is also useful as the "session completed" summary target in future.

### D6: BottomNav extended to three tabs

Add a `History` tab with a `Clock` or `History` lucide icon. The `active` prop union type expands to `'home' | 'plans' | 'history'`.

## Risks / Trade-offs

- **localStorage read on every render** → Mitigation: reads are fast for small datasets; add `useMemo` if perf becomes an issue.
- **No session planName stored** → The `WorkoutSession` type only stores `planId`, not `planName`. History cards may need to cross-reference `getPlans()` to display plan name. Mitigation: fetch plans once and build a lookup map.
- **Tile grid on small screens** → 16 weeks may be tight on very narrow screens. Mitigation: allow horizontal scroll on the tile grid container.
