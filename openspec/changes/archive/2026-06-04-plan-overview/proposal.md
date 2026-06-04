## Why

Opening a plan at `/plans/[id]` drops the user straight into the full editable `PlanForm`. There is no calm, read-only way to see what a plan contains or how it has been used — every visit looks like an edit session, and there is no surface for plan-level stats (how many days, how many exercises, which muscles, how often followed). The history detail page already established a read-first pattern; plans should match it.

## What Changes

- Opening a plan SHALL show a read-only **overview** by default instead of the edit form.
- The overview surfaces:
  - Plan name with status (active/completed) and AI-generated badges.
  - Stat tiles: training-day count, total exercise count, follow count.
  - Muscle groups present in the plan, grouped by the `MuscleGroup` taxonomy with muscle badges.
  - A flat read-only details list: scheduled weeks, scheduled weekdays, created date, last-followed date, follow count, and completed-on date (when completed).
  - A per-day breakdown listing each day's core and optional exercises read-only (name, sets×reps / duration, muscle badge), plus the plan's shared exercises.
- An **Edit** action switches into the existing `PlanForm` edit view (page-level mode state `overview | edit`, default `overview`). Cancel/save returns to the overview.
- Completed plans keep today's behaviour: editing remains read-only and the primary action is reactivate; the Edit affordance is hidden while completed.
- Add a plan exercise-count helper to `src/lib/plan-list.ts`; reuse existing `getPlanFollowCount`, `getPlanLastFollowedAt`, `getPlanMuscles`.
- Add the required i18n keys to `en`, `de`, and `hu` locales.

## Capabilities

### New Capabilities

- `plan-overview`: A read-only overview screen for a single workout plan that summarizes its structure and usage, shown by default when a plan is opened, with an explicit Edit action to enter the existing edit form.

### Modified Capabilities

<!-- None. No existing spec describes the plan detail page's open-in-edit behaviour; this introduces a new capability rather than changing a specified requirement. -->

## Impact

- `src/app/plans/[id]/page.tsx` — gains `overview | edit` mode state; renders the new overview by default, `PlanForm` on edit.
- New component `src/components/PlanOverview.tsx`.
- `src/lib/plan-list.ts` — new `getPlanExerciseCount` helper.
- `src/locales/{en,de,hu}.json` — new overview strings.
- No persisted data shapes change; no migration needed.
