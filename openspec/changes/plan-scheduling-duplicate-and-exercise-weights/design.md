## Context

The app uses local storage exclusively (no backend). `WorkoutPlan`, `PlanExercise`, and `Exercise` are plain TypeScript interfaces serialised to JSON. Plans are edited via `/plans/[id]/page.tsx` and exercises within plans via `AddPlanExerciseModal`. Session exercises are cloned from plan exercises at session-start time (in `plan-session-start` flow). All three features in this change touch data models and a range of UI components; they are bundled because they are all additive type extensions requiring no migration.

## Goals / Non-Goals

**Goals:**

- Add `scheduledWeeks?: number` to `WorkoutPlan` — editable in the plan form, displayed on the plan card.
- Add a `duplicatePlan` storage helper and surface a duplicate action on each plan card.
- Add `weightKg?: number` to `PlanExercise` and `Exercise` — editable in the exercise add form, carried through to sessions.

**Non-Goals:**

- Tracking actual session weight logged vs. target weight (that belongs in session-exercise-tracking).
- Enforcing plan scheduling (auto-completing a plan after N weeks).
- Unit conversion (lbs/kg toggle) — weight is always stored and displayed in kg for now.
- Bulk weight editing across exercises.

## Decisions

### 1. `scheduledWeeks` as a plain integer (not start/end dates)

**Decision:** Store `scheduledWeeks?: number` (e.g., `4` = "4-week block") rather than a `startDate`/`endDate` pair.

**Rationale:** Users think in program blocks ("a 6-week cut"), not calendar ranges. A start date would also imply the app manages activation timing, which is out of scope. The integer is simpler to render ("4 weeks") and edit (number input, 1–52).

**Alternative considered:** `startDate` + `endDate` — rejected because it couples scheduling to calendar management we don't want to build now.

### 2. Duplicate via a storage helper `duplicatePlan(id)`

**Decision:** Add `duplicatePlan(id: string): WorkoutPlan` in `storage.ts`. It reads the source plan, deep-clones it with fresh `crypto.randomUUID()` ids for the plan, each day, and each exercise, appends " (copy)" to the name, sets `createdAt`/`updatedAt` to now, and saves it.

**Rationale:** Centralising clone logic in storage keeps the page component thin. Fresh UUIDs at every level prevent id collisions. The caller navigates to the new plan's edit page immediately.

**Alternative considered:** Client-side clone in the page component — rejected because storage owns the write contract.

### 3. Duplicate action placement — plan card overflow / icon button

**Decision:** Add a copy icon button (`Copy` from lucide-react) to the `PlanCard` action row alongside the existing complete/chevron buttons. Tap immediately duplicates and navigates (no confirmation needed — the action is non-destructive).

**Rationale:** Non-destructive actions don't need a confirmation dialog. The plan card already has an action row; adding a third icon keeps the pattern consistent.

### 4. `weightKg` on `PlanExercise` and propagated to `Exercise`

**Decision:** Add `weightKg?: number` to both `PlanExercise` and `Exercise`. When a session is started from a plan day, the session-start code that clones exercises copies `weightKg` alongside the other fields.

**Rationale:** The target weight set in the plan is a useful default for the session. Since `Exercise` is already cloned from `PlanExercise` fields at session start, extending the clone is the natural propagation path.

**Weight unit:** kg stored as a float. Displayed as `{weightKg} kg` (no unit conversion in this change).

### 5. Weight input visibility — gated by exercise type

**Decision:** Show the weight input only when `type` is `sets-reps` or `sets-duration`. Hide it for `duration`-only exercises (e.g., a 30-minute run rarely has a meaningful bar weight).

**Rationale:** Avoids cluttering cardio exercise forms. The field is still optional even when visible.

## Risks / Trade-offs

- **Session-start clone must be updated** → If the clone step is missed, target weight won't flow into sessions. The task list explicitly includes this step.
- **`weightKg` displayed in plan UI but not yet in the session UI** → Session exercise cards show reps/sets/duration but not weight. This is acceptable for now — the data is stored and visible in the plan. Session weight display is a separate concern.
- **`scheduledWeeks` has no enforcement** → A plan won't auto-complete after N weeks. Users must manage this manually. Stated as a non-goal.

## Migration Plan

All new fields are optional. No existing stored data needs modification. Rollback: revert changed files; stored plans with new fields continue to load correctly (extra fields are ignored by old code if reverted, since local storage is accessed via `JSON.parse`).
