## Context

The app is a Next.js PWA with all data in localStorage. UI strings are centralised in `src/locales/{en,de,hu}.json` and accessed via the `useTranslations()` hook — making global terminology renames a safe, contained change. The data models (`WorkoutPlan`, `PlanExercise`, `Exercise`) are TypeScript interfaces serialised as JSON; all new fields are optional so no migration is needed. The plan editor (`/plans/[id]/page.tsx`), plan card (`PlanCard` in `plans/page.tsx`), and exercise add modal (`AddPlanExerciseModal`) are the primary touch-points.

## Goals / Non-Goals

**Goals:**

- Rename user-facing "optional" → "accessory" and "scaling note" → "progression note" (UI labels only).
- Add `trainingPhase`, `splitType`, `isDeload` to `WorkoutPlan`; display as badges.
- Add `targetRir` (0–4) and `toFailure` to `PlanExercise` and `Exercise`.
- Show computed weekly volume (sets per muscle group) on the plan detail page.

**Non-Goals:**

- Renaming the internal `role: 'optional'` value — would break stored data.
- Renaming the `scalingNote` field — UI label rename is sufficient.
- RPE input (a separate intensity scale; RIR is chosen as the primary metric for now).
- Progressive overload automation (auto-incrementing load between sessions).
- % 1RM inputs (requires 1RM tracking, a separate feature).
- Logging actual RIR/failure during a session (this change only sets the _target_ in the plan).

## Decisions

### 1. Terminology: UI labels only, no internal renames

**Decision:** Change only the displayed strings in locale files. The internal enum value `'optional'` remains; the storage field `scalingNote` remains. Only `t.plan_day_optional_exercises`, `t.optional_label`, `t.exercise_scaling_note_label`, the role toggle labels, and the session-start screen copy are changed.

**Rationale:** Renaming stored enum values (`'optional'`) or field names (`scalingNote`) would require a storage migration script with rollback risk. Since all display is mediated by translation keys, the rename is fully achieved through locale changes. The role toggle in `AddPlanExerciseModal` renders the raw role value as a button label — this specific instance needs a display-name mapping rather than relying on `capitalize(role)`.

### 2. `trainingPhase` as an enum string on `WorkoutPlan`

**Decision:** `trainingPhase?: 'hypertrophy' | 'strength' | 'power' | 'peaking' | 'deload'`. Rendered as a coloured chip/badge on the plan card. Editable via a segmented control or select in the plan editor. When `trainingPhase === 'deload'`, `isDeload` is redundant — but `isDeload` is kept as an explicit boolean for quick flag usage without setting a full phase.

**Rationale:** Enum is more discoverable than free text, and the defined phases cover the most common periodization terminology. Keeping `isDeload` as a separate boolean allows marking any phase plan as a deload week (e.g., a strength plan that happens to be a deload block).

### 3. `splitType` as an enum string on `WorkoutPlan`

**Decision:** `splitType?: 'full-body' | 'upper-lower' | 'push-pull-legs' | 'bro-split' | 'custom'`. Shown as a small label on the plan card. Editable via a select in the plan editor. No algorithmic inference — user picks the label.

**Rationale:** Algorithmic detection of split type from day names/exercises would be unreliable. A user-selected label is accurate and low-effort.

### 4. RIR input — plan exercise level only (not per-set)

**Decision:** Single `targetRir?: number` (0–4) on `PlanExercise`, shared across all sets of that exercise. `toFailure?: boolean` is mutually exclusive: selecting "Failure" clears `targetRir`. In `AddPlanExerciseModal`, show a compact row: RIR stepper (0–4) | Failure toggle. Visible only for `sets-reps` and `sets-duration` types.

**Rationale:** Per-set RIR is overkill for a plan-level prescription. A single RIR target per exercise is the standard programming convention (e.g., "Squat: 3×5 @2 RIR"). Mutual exclusivity with `toFailure` reflects real-world usage (you either target a specific RIR or you go to failure).

### 5. Weekly volume summary — computed at render time

**Decision:** On the plan detail page, compute total working sets per muscle `category` by summing `sets` across all exercises (core + optional/accessory + shared) across all days. Render as a simple table or chip list (e.g., "Chest: 12 sets · Back: 16 sets"). No persistence — recalculated on render.

**Rationale:** Storing computed volume would create stale-data risk. It's cheap to recalculate from the plan structure.

### 6. Mesocycle / Microcycle display

**Decision:** On the plan card and detail header: render a row of context badges — `splitType` label | `trainingPhase` label | `scheduledWeeks` (if set). The existing weekly day-structure section header is relabelled "Microcycle" in the plan detail. No new data model.

**Rationale:** Users just need contextual labelling; no new structural data is needed beyond `splitType` and `trainingPhase` already planned.

## Risks / Trade-offs

- **Role toggle renders raw value** → Currently `AddPlanExerciseModal` uses `capitalize(role)` implicitly. We must add explicit display labels `{ core: 'Compound', optional: 'Accessory' }` — small but required code change.
- **Deload flag vs. trainingPhase deload** → Slight redundancy. Mitigation: if `trainingPhase === 'deload'`, auto-set `isDeload: true` on save (or just use `trainingPhase` as the source of truth and derive `isDeload` in display logic).
- **Volume summary only as accurate as category data** → Exercises without a category are excluded from the count. An "Uncategorised" bucket can catch these.

## Migration Plan

All fields are optional. No existing data changes. Rollback: revert files; old stored data with new fields loads correctly (extra fields ignored). Locale changes only affect displayed strings, not stored data.
