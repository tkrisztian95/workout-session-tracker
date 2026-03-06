## Context

The app stores workout plans as `WorkoutPlan` objects in localStorage. Currently there is no way to retire a plan without deleting it. The `WorkoutPlan` interface in `src/lib/types.ts` has no lifecycle field. The plans list shows all plans with equal prominence.

## Goals / Non-Goals

**Goals:**

- Add a `status` field to `WorkoutPlan` (`'active'` | `'completed'`)
- Allow users to mark/unmark a plan as completed from the plan list or plan detail
- Separate the plans list UI into active plans and completed plans
- Prevent starting a session from a completed plan

**Non-Goals:**

- Permanent deletion changes (existing delete flow unchanged)
- Backend/sync — localStorage only
- Bulk operations on multiple plans at once

## Decisions

### 1. `status` field on `WorkoutPlan` (optional with default)

Adding `status?: 'active' | 'completed'` to `WorkoutPlan`. Plans without a `status` are treated as `'active'` — no localStorage migration needed. This is the simplest non-breaking approach.

Alternative considered: separate `completedPlanIds: string[]` list in storage — rejected because it requires cross-entity joins on every read.

### 2. Same list, two sections vs. separate route

Completed plans appear as a collapsible "Completed" section beneath the active list on the same Plans page — not a separate route. This avoids new navigation and keeps the feature lightweight.

Alternative considered: dedicated `/plans/completed` route — rejected as over-engineered for the current scale.

### 3. Mark-as-completed action via plan context menu / swipe action

Reuse the existing per-plan action surface (the same area used for Delete). A "Mark as Completed" / "Reactivate" toggle action appears alongside Delete.

### 4. Completed plans are read-only

The "Start Session" button is hidden/disabled for completed plans. Edit remains accessible so users can review the plan content, but saving changes is blocked while status is `'completed'`.

Alternative considered: allow editing completed plans freely — rejected to keep the completed state meaningful.

## Risks / Trade-offs

- [UI complexity] Two sections on the plans list may feel cluttered if many plans are completed → Mitigate with the "Completed" section being collapsed by default
- [Accidental completion] User marks plan as complete by mistake → Mitigate with the reactivate action being equally accessible

## Migration Plan

No data migration required. Existing plans without `status` are read as `'active'` at runtime. No localStorage key changes.

Rollback: remove the `status` field from the type — old data with `status` set is harmlessly ignored by older code.
