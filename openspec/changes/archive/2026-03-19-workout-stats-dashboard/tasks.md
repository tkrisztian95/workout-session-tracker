## 1. Dependencies & Localization

- [x] 1.1 Add `recharts` to `package.json` and install
- [x] 1.2 Add locale strings for the stats page to all locale files (`en`, `hu`, `de`): stats tab label, total sessions, total volume, avg duration, avg weight, weekly frequency, empty state message, no volume data message, exercise progression table heading

## 2. Stats Utility Module

- [x] 2.1 Create `src/lib/statsUtils.ts` with a `computeStats(sessions: WorkoutSession[])` function returning total sessions count, total volume (kg), avg duration (min), avg weight per set (kg), and weekly frequency
- [x] 2.2 Add a `getWeeklyVolumeChartData(sessions: WorkoutSession[], weeks?: number)` function that returns an array of `{ weekLabel: string, volume: number }` for the last N (default 12) calendar weeks
- [x] 2.3 Add a `getExerciseWeightProgression(sessions: WorkoutSession[])` function that returns an array of `{ exerciseName: string, sessionWeights: number[], trend: 'up' | 'down' | 'flat' }` — one entry per unique weighted exercise, sorted alphabetically, using the mean weight per session for up to the last 5 appearances

## 3. Stats Page

- [x] 3.1 Create `src/app/stats/page.tsx` as a client component that loads completed sessions from localStorage and renders the stats layout
- [x] 3.2 Build the summary stat cards grid (total sessions, total volume, avg duration, avg weight, weekly frequency) using the existing `Card` component and `computeStats`
- [x] 3.3 Add empty-state UI when there are no completed sessions
- [x] 3.4 Build the weekly volume `BarChart` using Recharts `ResponsiveContainer`, themed with CSS variable colors matching the app theme
- [x] 3.5 Add empty-state message inside the chart area when all volume values are zero
- [x] 3.6 Build the exercise weight progression table component: one row per exercise, columns for the last ≤5 session weights (chronological), and a trend column showing a Lucide `TrendingUp` / `TrendingDown` / `Minus` icon colored by theme success/warning/muted tokens
- [x] 3.7 Hide the progression table entirely when no weighted exercises exist

## 4. Navigation

- [x] 4.1 Add a Stats tab (Lucide `BarChart2` icon) to `src/components/BottomNav.tsx` and link it to `/stats`
- [x] 4.2 Verify the bottom nav renders correctly on a 320 px viewport with five tabs (adjust padding/label size if needed)

## 5. Verification

- [x] 5.1 Confirm all five stat cards display correct values against known session fixtures
- [x] 5.2 Confirm the weekly volume chart renders correct bar heights for the last 12 weeks
- [x] 5.3 Confirm zero/empty states render for a user with no sessions
- [x] 5.4 Confirm active (in-progress) sessions are excluded from all stats
- [x] 5.5 Confirm chart and cards respect dark and light theme tokens
- [x] 5.6 Confirm progression table shows correct trend arrows (up/down/flat) for exercises with known weight history
- [x] 5.7 Confirm progression table is hidden when no sessions have weighted exercises
