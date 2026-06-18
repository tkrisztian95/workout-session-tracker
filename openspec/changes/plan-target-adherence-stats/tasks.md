## 1. Extract shared target classification

- [ ] 1.1 In `src/lib/sessionUtils.ts`, add exported, documented helpers for the per-exercise plan comparison: `actualSetsForPlan(ex)`, `plannedSetsForPlan(planned)`, and `classifyPlannedExercise(planned, actual)` returning `'overdone' | 'matched' | 'underperformed' | 'missed'` (port the exact logic from `SessionPlanComparison.tsx`, including the `classifyLoggedSets`/`countsTowardSetsGoal` weight handling)
- [ ] 1.2 Refactor `src/components/SessionPlanComparison.tsx` to import these helpers instead of its private `actualSetsFor` / `plannedSetsFor` / `statusFor`, keeping the existing `'extra'` handling local (extra has no planned baseline)
- [ ] 1.3 Add unit tests in `src/lib/sessionUtils.test.ts` for `classifyPlannedExercise` covering matched, overdone, underperformed, missed, weight-gated warmups, and a pure-duration completed exercise

## 2. Adherence aggregation in statsUtils

- [ ] 2.1 Add `getPlanAdherenceProgression(sessions, plans, range)` to `src/lib/statsUtils.ts` returning `{ points: { date: string; score: number }[]; average: number | null }` — filter to completed, in-range, plan-linked sessions whose plan day resolves with ≥1 core exercise; score = met core exercises / core count × 100 (pure-duration core counts as met when completed); points sorted chronologically; `average` = rounded mean or `null` when empty
- [ ] 2.2 Reuse the date-range filtering already in `filterSessionsByRange` and resolve the plan day the same way the history detail page does (`plans.find(p => p.id === planId)?.days.find(d => d.id === planDayId)`)
- [ ] 2.3 Add unit tests in `src/lib/statsUtils.test.ts`: core-only denominator (optional/extra ignored), 100% and partial scores, plan-day-with-no-core excluded, non-plan sessions excluded, empty → `{ points: [], average: null }`, range filtering

## 3. Locale strings

- [ ] 3.1 Add adherence keys to `src/locales/en.json` (`stats_adherence_title`, `stats_adherence_avg_label`, and any trend/percentage helper copy reusing existing `stats_volume_trend_*` patterns where possible)
- [ ] 3.2 Mirror the keys in `src/locales/de.json` and `src/locales/hu.json` (translate where confident; flag any English-fallback values)

## 4. Stats page section

- [ ] 4.1 In `src/app/stats/page.tsx`, load `getPlans()` and add a `PlanAdherence` section component (co-located with `ProgressionTable` / `CategoryRadarChart`) that calls `getPlanAdherenceProgression(filteredSessions, plans, range)`
- [ ] 4.2 Render an average-adherence summary card (percentage) with an up/down/flat trend chip reusing the existing volume-trend icon/colour treatment (compare last vs previous point)
- [ ] 4.3 Render a recharts `LineChart` of per-session score over date labels, y-axis 0–100%, styled like the existing progression chart and theme-aware
- [ ] 4.4 Return `null` from the section when `points.length === 0` so it hides cleanly; place the section in a sensible spot (e.g. after the progression table)

## 5. Verify

- [ ] 5.1 Run `npm run lint` and `npm test` green
- [ ] 5.2 Visual check via Playwright/Chrome MCP: a profile with plan-linked sessions shows the section + trend; a profile with only ad-hoc sessions hides it; switching time ranges updates it
- [ ] 5.3 Confirm no persisted data shapes changed (no `docs/data-structure.md` update needed)
