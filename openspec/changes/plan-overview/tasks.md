## 1. Helpers & i18n

- [x] 1.1 Add `getPlanExerciseCount(plan)` to `src/lib/plan-list.ts` (shared + every day's core + optional exercises) with a doc comment
- [x] 1.2 Add a unit test for `getPlanExerciseCount` covering shared-only, day-only, and mixed plans
- [x] 1.3 Add overview i18n keys to `src/locales/en.json` (stat tile labels, details labels — created/last-followed/never-followed, muscle-groups heading, shared-exercises heading, edit action)
- [x] 1.4 Mirror the new keys in `src/locales/de.json` and `src/locales/hu.json` (translate where confident; flag any English-fallback values)

## 2. PlanOverview component

- [x] 2.1 Create `src/components/PlanOverview.tsx` with props for the plan, follow count, last-followed timestamp, and `onEdit` / `onBack` / `onDelete` / `onToggleStatus` callbacks
- [x] 2.2 Render header: back action, plan name (HeadingXL), completed indicator + AI badge, and Edit action (hidden when completed) plus toggle-status/delete affordances
- [x] 2.3 Render stat tiles: training-day count, total exercise count (`getPlanExerciseCount`), follow count
- [x] 2.4 Render muscle groups grouped by `MuscleGroup` taxonomy (`MUSCLE_TO_GROUP` / `ALL_MUSCLE_GROUPS`, `muscle_group_labels`) with `MuscleBadge`s; omit section when no muscles
- [x] 2.5 Render flat details list (created, scheduled weeks, scheduled weekdays, last followed / never-followed, follow count, completed-on when completed)
- [x] 2.6 Render per-day breakdown (day name, weekdays, core + optional exercises read-only with sets×reps/duration detail and muscle badge) and a shared-exercises section

## 3. Wire the plan detail page

- [x] 3.1 In `src/app/plans/[id]/page.tsx` add `mode: 'overview' | 'edit'` state defaulting to `overview` and load `getSessions()` for follow stats
- [x] 3.2 Render `PlanOverview` in overview mode; pass computed follow count and last-followed via existing helpers; `onEdit` → `mode = 'edit'`
- [x] 3.3 Render `PlanForm` in edit mode; `onCancel` and `onSave` return to overview (save persists and re-reads the plan); keep delete/toggle-status behaviour
- [x] 3.4 Ensure completed plans show overview with no Edit action and a working reactivate affordance

## 4. Verify

- [ ] 4.1 Run `npm run lint` and `npm test` (or project equivalents) green
- [ ] 4.2 Visual check via Playwright/Chrome MCP: open an active plan (overview → Edit → save → overview), open a completed plan (no Edit, reactivate works), open a plan that was never followed
- [ ] 4.3 Run `openspec validate --strict` for the change
