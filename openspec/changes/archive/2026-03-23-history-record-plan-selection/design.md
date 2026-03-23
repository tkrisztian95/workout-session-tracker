## Context

`NewHistorySessionSheet` was introduced to let users manually log past workouts. It currently creates only free sessions — the resulting `WorkoutSession` has no `planId` or `planDayId`. Users who want to retroactively log a plan workout cannot associate it with the correct plan, so it won't appear under that plan's history and won't feed plan-level progression tracking.

The `WorkoutSession` type already has optional `planId` and `planDayId` fields. `getPlans()` is available from storage. The history list and detail view already render plan name and day name when those fields are present.

## Goals / Non-Goals

**Goals:**

- Let users choose between "From a plan" and "Free session" at the start of the new-record creation flow.
- For plan-based records: allow selecting a plan and one of its days, then pre-populate the exercise list from that day's core exercises.
- Persist `planId` and `planDayId` on the saved `WorkoutSession` for plan-based records.

**Non-Goals:**

- Selecting optional exercises from a plan day automatically — users can add extras manually after pre-fill.
- Retroactively associating existing history records with a plan.
- Creating or editing plans from this flow.

## Decisions

### 1. Step-based flow within the existing sheet

**Decision:** Add a session-type selection step as the first "screen" inside `NewHistorySessionSheet`, using local state to track which step is active (`type-select` → `plan-pick` | `day-pick` → `form`).

**Rationale:** The sheet is a single bottom sheet component. Introducing internal step state keeps all creation logic in one place and avoids adding a new route or nesting multiple sheets. The existing form step becomes step 2/3 regardless of plan or free choice.

**Alternative considered:** Two separate entry points (one button per type on the History page) — rejected because it clutters the header and the date/duration/exercise form is shared between both paths.

### 2. Plan and day selection as inline list steps within the sheet

**Decision:** The plan-pick step renders a scrollable list of available plans inside the sheet; after selecting a plan, the day-pick step renders that plan's days. Tapping a day advances to the form step with exercises pre-filled.

**Rationale:** Inline lists in the sheet are native to the existing UX (no new modal layers). The number of plans and days is typically small, so a full-height picker is unnecessary.

**Alternative considered:** A separate `PlanPickerModal` — rejected as unnecessary complexity for a short list.

### 3. Pre-populate only core exercises; mark them incomplete

**Decision:** When a plan day is selected, only `coreExercises` are copied into the draft exercise list, converted to `Exercise` shape with `completed: false` and no `loggedSets`. Shared plan exercises (warmups) are also included.

**Rationale:** Core exercises are always done; optional exercises are per-session decisions the user handles manually after pre-fill. Starting with `completed: false` matches the same state used during an actual live session — the user edits execution details via `HistoryExerciseEditor` before saving.

**Alternative considered:** Including optional exercises by default — rejected because that's the user's decision.

## Risks / Trade-offs

- **Risk:** Plan has no days — the day-pick step would show an empty list.
  → Mitigation: Show an empty state message and allow the user to go back.

- **Risk:** User picks a plan but then wants a free session instead.
  → Mitigation: Each step shows a back/cancel action that returns to the type-selection step.

- **Risk:** `PlanExercise` fields (like `role`, `scalingNote`) don't map 1-to-1 onto `Exercise` — the conversion must drop plan-only fields.
  → Mitigation: Map explicitly: copy `id` → new UUID, keep `name`, `type`, `sets`, `reps`, `duration`, `weightKg`, `category`, `scalingNote`; set `completed: false`.
