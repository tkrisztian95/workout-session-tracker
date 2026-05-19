## 1. Plan-list helper module

- [ ] 1.1 Create `src/lib/plan-list.ts` exporting `PlanSort` (`'created' | 'followed' | 'updated' | 'name'`), `StatusFilter` (`'active' | 'completed' | 'all'`), `AiFilter` (`'any' | 'ai' | 'manual'`), and a `PlanFilters` interface (`status`, `aiGenerated`, `muscle: Muscle | null`, `trainingDays: number | null`)
- [ ] 1.2 Add `getPlanLastFollowedAt(planId, sessions): string | null` — the max `completedAt` over sessions whose `planId` matches; `null` when none
- [ ] 1.3 Add `getPlanMuscles(plan): Muscle[]` (move the existing local helper out of `page.tsx`) and `availableMuscles(plans): Muscle[]` / `availableDayCounts(plans): number[]` returning sorted distinct filterable values
- [ ] 1.4 Add `organizePlans(plans, sessions, { search, sort, filters }): WorkoutPlan[]` applying search → filters → sort; "followed" sort puts never-followed plans last with `createdAt`-desc tiebreak
- [ ] 1.5 Add `DEFAULT_PLAN_FILTERS` constant and `countActiveFilters(filters): number` (non-default filter count)

## 2. Helper module tests

- [ ] 2.1 Create `src/lib/plan-list.test.ts` covering `getPlanLastFollowedAt` (no sessions, in-progress session ignored, latest of several)
- [ ] 2.2 Test `organizePlans` sort branches: created, updated, name (case-insensitive), followed (never-followed last)
- [ ] 2.3 Test `organizePlans` search (case-insensitive substring) and each filter dimension (status, aiGenerated, muscle, trainingDays)
- [ ] 2.4 Test `availableMuscles` / `availableDayCounts` return sorted distinct values, and `countActiveFilters`

## 3. Plans page — search and sort

- [ ] 3.1 In `src/app/plans/page.tsx` load sessions via `getSessions()` and add `useState` for `search`, `sort`, and `filters` (seeded from `DEFAULT_PLAN_FILTERS`)
- [ ] 3.2 Add a search `<input>` under the page header with a leading search icon and a clear (×) button shown when non-empty
- [ ] 3.3 Add an inline sort control next to the search row with the four sort options
- [ ] 3.4 Compute the displayed list with `useMemo` over `organizePlans(plans, sessions, { search, sort, filters })`

## 4. Plans page — filters

- [ ] 4.1 Add a "Filters" trigger button next to the sort control showing a badge with `countActiveFilters(filters)` when greater than zero
- [ ] 4.2 Build a filter `BottomSheet` with controls for status, AI-generated, muscle (from `availableMuscles`), and training days (from `availableDayCounts`), plus a "Clear all" action
- [ ] 4.3 Replace the active-list + collapsible `Completed (N)` section with the single `organizePlans` result list; remove `completedOpen` state and the related markup

## 5. Empty state and integration

- [ ] 5.1 Keep the existing "no plans yet" `EmptyState` for when the user has zero plans
- [ ] 5.2 Add a distinct no-results `EmptyState` (with a clear-search/filters action) shown when plans exist but the organized result is empty
- [ ] 5.3 Update the header subtitle to reflect the count of plans currently shown
- [ ] 5.4 Verify `PlanCard` still renders correctly for both active and completed plans in the unified list

## 6. Localization

- [ ] 6.1 Add i18n keys for all new UI strings (search placeholder, clear, sort label + four option labels, filters label, status/AI/muscle/training-day labels, clear-all, no-results title + subtitle)
- [ ] 6.2 Add translations for every key in `en`, `hu`, and `de`
