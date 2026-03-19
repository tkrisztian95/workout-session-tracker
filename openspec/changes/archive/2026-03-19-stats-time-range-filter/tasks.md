## 1. Locale Strings

- [x] 1.1 Add translation keys for the five range labels (`stats_range_1day`, `stats_range_this_week`, `stats_range_this_month`, `stats_range_90days`, `stats_range_all`) to `src/locales/en.json`, `de.json`, and `hu.json`

## 2. Date Filtering Utility

- [x] 2.1 Add a `getDateBoundary(range: TimeRange): Date | null` helper in `src/lib/statsUtils.ts` that returns the start-of-range `Date` for each option (null for "all")
- [x] 2.2 Add a `filterSessionsByRange(sessions: WorkoutSession[], range: TimeRange): WorkoutSession[]` helper in `src/lib/statsUtils.ts` that returns sessions with `completedAt >= boundary`
- [x] 2.3 Export the `TimeRange` type (`'1day' | 'week' | 'month' | '90days' | 'all'`) from `statsUtils.ts`

## 3. Range Selector Component

- [x] 3.1 Add an inline `RangeSelector` component in `src/app/stats/page.tsx` that renders the five range pills with the active one visually highlighted using brand/elevated styles consistent with the existing design system
- [x] 3.2 Wire `RangeSelector` to a `useState<TimeRange>` defaulting to `'all'`

## 4. Stats Page Wiring

- [x] 4.1 In `StatsPage`, derive `filteredSessions` from `sessions` and the selected range using `filterSessionsByRange`
- [x] 4.2 Pass `filteredSessions` (instead of `sessions`) to `computeStats`, `getWeeklyVolumeChartData`, and `getExerciseWeightProgression`
- [x] 4.3 Keep the empty-state check using all-time `sessions` (not `filteredSessions`) so the illustration only shows when there are zero sessions ever
- [x] 4.4 Render the `RangeSelector` above the stat cards grid, inside the non-empty branch
