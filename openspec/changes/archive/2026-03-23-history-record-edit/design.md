## Context

The History page (`/history`) lists completed workout sessions. Each session has a detail view (`/history/[id]`) with an edit mode powered by `AddExerciseModal` — a component designed for editing plan exercise targets (sets, reps, duration goals). This modal does not expose per-set logged data (`loggedSets`) and is semantically wrong for history editing where users need to record _what they actually did_, not what they planned.

There is also no way to create a manual history record for a workout done outside the app.

## Goals / Non-Goals

**Goals:**

- Allow users to add a new past workout session directly from the History page (manual record).
- Replace `AddExerciseModal` usage in history edit mode with a dedicated history exercise editor that edits actual execution data: per-set logged sets (weight × reps) for `sets-reps` exercises, and actual duration in seconds for `duration` / `sets-duration` exercises.
- Reuse existing `Exercise` and `LoggedSet` types and `saveSession` / `updateSession` storage functions.

**Non-Goals:**

- Editing session metadata beyond date and total duration (e.g., no plan re-association).
- Online sync or multi-device support.
- Importing sessions from external sources.

## Decisions

### 1. New component: `HistoryExerciseEditor` (bottom sheet)

**Decision:** Create a new `HistoryExerciseEditor` component (bottom sheet) focused solely on execution editing, separate from `AddExerciseModal`.

**Rationale:** `AddExerciseModal` carries plan-oriented UX (exercise search, type picker, target fields). Reusing it for history would require heavy conditional branching and confuse the two mental models. A dedicated sheet keeps both components simple and purpose-specific.

**Alternative considered:** Extend `AddExerciseModal` with a `mode="history"` prop — rejected because it conflates plan-target editing and execution recording in one component.

### 2. Per-set inline rows for `sets-reps` exercises

**Decision:** For `sets-reps` exercises in the history editor, show one row per logged set with weight (kg) and reps inputs, plus add/remove set buttons. Non-`sets-reps` types show a single duration (seconds) input.

**Rationale:** Matches the in-session logging UX (`LoggedSetBadge`, `SessionNowPanel`) so users see the same data model they recorded during training. Plan-target fields (sets goal, reps goal) are read-only hints only.

### 3. Manual record creation via bottom sheet on History page

**Decision:** A "+" or "New session" button on the History page opens a bottom sheet where the user picks a date, enters total duration (minutes), then adds exercises using the history exercise editor before saving.

**Rationale:** Keeps the creation flow in-place without a new route. Reuses the same `HistoryExerciseEditor` component used in the detail edit mode, eliminating duplication.

**Alternative considered:** New route `/history/new` — adds a route just for creation, heavier than needed.

### 4. Editing exercise name and type remains via `AddExerciseModal`

**Decision:** When adding a _new_ exercise to a history draft (both in new-record creation and detail editing), the existing `AddExerciseModal` is still used for name/type/category selection. Once added, execution values are then editable via `HistoryExerciseEditor`.

**Rationale:** Exercise discovery (search, category) is already well-handled by `AddExerciseModal`. Duplicating that UI is unnecessary; the history editor handles only the post-selection execution fields.

## Risks / Trade-offs

- **Risk:** Users may expect to edit plan-target values (sets goal) in history — not supported by design.
  → Mitigation: Show target as read-only context (e.g., "Target: 3×10") next to execution inputs.

- **Risk:** Creating a session with no exercises is meaningless clutter in history.
  → Mitigation: Disable the "Save" action on the new-record sheet until at least one exercise is added.

- **Risk:** Manual record date conflicts with or duplicates an existing session on the same day.
  → Mitigation: No validation needed — multiple sessions per day are already supported and displayed grouped by date.
