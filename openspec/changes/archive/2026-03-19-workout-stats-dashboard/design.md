## Context

The app is a Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 mobile-first workout tracker. Data is persisted in browser `localStorage` via `src/lib/storage.ts`. The four existing bottom-nav tabs are Home, Plans, History, and Profile. No charting library is currently installed. Session and exercise-set data is available via `WorkoutSession[]` and the `LoggedSet[]` arrays nested within each session's exercises.

## Goals / Non-Goals

**Goals:**

- Add a `/stats` page accessible from the bottom navigation
- Display stat summary cards: total sessions, total volume (kg × reps), avg session duration, avg weight per set, and weekly recurrence/frequency
- Display a time-series line/bar chart of session volume over recent weeks
- All computation client-side from existing localStorage data — no backend changes

**Non-Goals:**

- Per-exercise breakdown drill-down (future iteration)
- Date range filtering UI (future iteration)
- Exporting or sharing stats
- Server-side analytics or persistence

## Decisions

### 1. Charting library: Recharts

**Decision**: Add `recharts` as the charting dependency.

**Rationale**: Recharts is React-native, well-maintained, has responsive containers built in, and is the most common choice in the Next.js/Tailwind ecosystem. It requires no canvas setup and renders SVG, which is easy to theme with CSS variables.

**Alternatives considered**:

- _Chart.js + react-chartjs-2_: More config overhead, canvas-based (harder to theme).
- _Custom SVG_: No dependency but disproportionate effort for a line/bar chart.
- _Tremor / shadcn charts (Recharts wrapper)_: Adds a component layer that isn't needed here.

### 2. New `/stats` tab in bottom navigation

**Decision**: Add Stats as the 5th bottom-nav tab (icon: `BarChart2` from Lucide) between History and Profile, shifting Profile to the end.

**Rationale**: Stats is a top-level destination that users will return to regularly, not a drill-down from another tab.

### 3. Stat computation co-located in a utility module

**Decision**: Add `src/lib/statsUtils.ts` containing pure functions that accept `WorkoutSession[]` and return computed stat objects.

**Rationale**: Keeps the page component thin, makes the logic testable in isolation, and avoids bloating `sessionUtils.ts`.

### 4. Client component with `useEffect` data load

**Decision**: The stats page is a client component (`"use client"`) that loads sessions from localStorage in a `useEffect`, mirroring the pattern used in `history/page.tsx`.

**Rationale**: Consistent with existing data-access patterns; avoids adding a server-side data layer.

### 5. Chart metric: weekly total volume

**Decision**: The primary chart shows total lifted volume (sum of `weight × reps` across all logged sets) grouped by calendar week, for the last 12 weeks.

**Rationale**: Volume is the most universally meaningful training metric and combines both weight and rep data into one number. Duration-only sessions (e.g., cardio) that have no logged sets contribute 0 volume and still appear as a session on the session-count card.

## Risks / Trade-offs

- **No logged sets → zero volume**: Sessions with only duration-type exercises (no `weight`/`reps`) will show as sessions in the count card but contribute no volume to the chart. _Mitigation_: Add a secondary metric toggle (duration avg) in a future iteration; document this limitation in UI copy.
- **Large history performance**: Computing stats over hundreds of sessions on every render could be slow. _Mitigation_: `useMemo` on the computation; localStorage reads are synchronous but small.
- **Bundle size**: Recharts adds ~60 kB gzipped. _Mitigation_: Acceptable for a hobby app; lazy-load the stats page if it becomes a concern.
- **5-tab navigation on small screens**: Adding a 5th tab may crowd the bottom nav on 320 px devices. _Mitigation_: Use icon-only labels or reduce padding; verify on smallest target viewport.
