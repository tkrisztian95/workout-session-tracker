## Context

`/plans/[id]` (`src/app/plans/[id]/page.tsx`) currently renders `PlanForm` directly, so opening any plan looks like an edit session. The history feature already established a read-first pattern (`/history/[id]` shows a read-only detail with an Edit toggle via `SessionDetailHeader`). Plans should follow the same shape.

The plan-stat helpers already exist in `src/lib/plan-list.ts` (`getPlanFollowCount`, `getPlanLastFollowedAt`, `getPlanMuscles`) and are used by the plans list cards. Muscle grouping uses `MUSCLE_TO_GROUP` / `MUSCLES_BY_GROUP` / `ALL_MUSCLE_GROUPS` from `src/lib/muscles.ts`, with labels under `muscle_group_labels` in the locales. The `MuscleBadge` component renders individual muscle chips.

## Goals / Non-Goals

**Goals:**

- Show a calm, read-only plan overview by default, matching the history detail pattern.
- Surface plan-level stats and structure (days, exercises, muscles, follow usage) without entering edit mode.
- Keep the existing `PlanForm` as the edit surface, reached via an explicit Edit action.
- Preserve completed-plan behaviour (read-only, reactivate, no edit).

**Non-Goals:**

- No change to persisted data shapes, storage keys, or migrations.
- No change to `PlanForm` internals beyond how it is invoked.
- No new route segment — mode is page-level state, not a separate `/edit` URL.

## Decisions

### Page-level `mode` state vs. separate `/edit` route

Use a `useState<'overview' | 'edit'>` in `src/app/plans/[id]/page.tsx`, default `overview`. Overview renders the new `PlanOverview`; `edit` renders the existing `PlanForm`. Cancel/save returns to `overview` (save also persists and may re-read the plan).

- _Alternative considered_: a dedicated `/plans/[id]/edit` route. Rejected — adds routing/back-button complexity for a single-screen toggle, and the history feature already uses in-page state (`isEditing`) successfully.

### New `PlanOverview` component vs. extending `PlanForm` read-only mode

Build a dedicated `src/components/PlanOverview.tsx`. `PlanForm`'s read-only mode is a disabled form layout, not the stats-and-summary layout the overview needs. A separate component keeps the two concerns clean and avoids overloading `PlanForm`.

### Exercise count helper

Add `getPlanExerciseCount(plan)` to `src/lib/plan-list.ts` (shared + every day's core + optional). Keeps counting logic next to the other plan helpers and unit-testable, rather than inline in the component.

### Sessions needed for follow stats

The page must load `getSessions()` (it currently does not) to compute follow count and last-followed via the existing helpers, mirroring how the plans list page does it.

### Completed plans

When `status === 'completed'`, the overview omits the Edit action and keeps the reactivate affordance. Entering edit on a completed plan is not offered, so the prior read-only `PlanForm` path is no longer the default surface but remains reachable code if reactivated → active → Edit.

## Risks / Trade-offs

- [Edit affordance regression for completed plans] → Spec'd explicitly: completed plans show no Edit, only reactivate; covered by a scenario.
- [Stat helpers diverge from list-page semantics] → Reuse the exact same helpers (`getPlanFollowCount`, `getPlanLastFollowedAt`, `getPlanMuscles`) so the overview and list agree by construction.
- [i18n drift across locales] → Add the same keys to `en`, `de`, and `hu` in the same task; `de`/`hu` may carry English fallback copy if a translation is uncertain, flagged in the task.

## Migration Plan

No data migration. Pure UI/behaviour change behind the existing route. Rollback is reverting the page to render `PlanForm` directly.
