## 1. Data Layer — statsUtils.ts

- [x] 1.1 Extend `ExerciseProgression` interface to include `sessionDates: string[]` alongside `sessionWeights`
- [x] 1.2 Update `getExerciseWeightProgression` to populate `sessionDates` with `"MMM d"` formatted dates from the last 5 session `completedAt` values
- [x] 1.3 Add `getCategoryDistribution(sessions: WorkoutSession[]): { category: string; count: number }[]` helper that counts sessions per category (grouping missing categories as "Other"), returning results sorted descending by count

## 2. Collapsible Progression Chart

- [x] 2.1 Add `expandedExercise: string | null` state to `ProgressionTable` (or its parent) to track which row is expanded
- [x] 2.2 Make each exercise row in `ProgressionTable` a button/tappable area; clicking toggles expansion (sets to exercise name or `null` if already active)
- [x] 2.3 Add a `ChartContainer` + Recharts `LineChart` inside each row, rendered conditionally when that row is expanded, using `sessionWeights` (y-axis) and `sessionDates` (x-axis labels)
- [x] 2.4 Style the chart to match existing chart aesthetics (brand color line, no grid vertical lines, small 120px height)

## 3. Category Radar Chart

- [x] 3.1 Add a `CategoryRadarChart` component (in `stats/page.tsx` or a co-located file) that accepts `sessions: WorkoutSession[]` and renders a `RadarChart` using `getCategoryDistribution`
- [x] 3.2 Hide `CategoryRadarChart` when fewer than 2 sessions exist or all categories resolve to a single value
- [x] 3.3 Place `CategoryRadarChart` between the summary stat cards and the weekly volume chart section in `StatsPage`
- [x] 3.4 Wire `CategoryRadarChart` to use `filteredSessions` so it respects the active time-range filter

## 4. Localization

- [x] 4.1 Add translation key `stats_category_radar_title` to `en.json`, `de.json`, `hu.json` (e.g. "Training Balance")
- [x] 4.2 Add translation key `stats_category_other` for the "Other" bucket label in `en.json`, `de.json`, `hu.json`
