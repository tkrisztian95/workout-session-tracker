## Why

The app uses generic software terminology ("optional exercise", "scaling note") that doesn't match how athletes and coaches talk. At the same time, the app lacks the core training-science inputs — RIR, RPE, failure, training phase, split type, volume tracking — that serious lifters need to program and progress their training. Fixing both together establishes a credible, gym-native foundation before the feature set grows further.

## What Changes

**Terminology renames (all locales: en, de, hu)**

- "Optional Exercises" / "optional" role → "Accessory Exercises" / "accessory" (UI labels only; internal `role` value stays `'optional'` to avoid storage migration)
- "Scaling Note" → "Progression Note" (UI label only; internal field stays `scalingNote`)
- "Core (always included)" → "Compound" (primary exercises that anchor the session)
- Role toggle button labels: "core" → "Compound", "optional" → "Accessory"
- Plan session-start screen: "Core exercises are pre-selected. Add optional ones below." → "Compound exercises are pre-selected. Add accessory ones below."

**New plan-level structure fields**

- `trainingPhase?: 'hypertrophy' | 'strength' | 'power' | 'peaking' | 'deload'` on `WorkoutPlan` — the mesocycle goal; shown as a badge on the plan card and editable in the plan editor.
- `splitType?: 'full-body' | 'upper-lower' | 'push-pull-legs' | 'bro-split' | 'custom'` on `WorkoutPlan` — the training split; shown on the plan card.
- `isDeload?: boolean` on `WorkoutPlan` — flags the entire plan as a deload block; shown prominently on card and detail.

**New exercise-level intensity inputs**

- `targetRir?: number` (0–4) on `PlanExercise` — Reps In Reserve target; shown on exercise rows.
- `toFailure?: boolean` on `PlanExercise` — mutually exclusive with RIR; renders as "Failure" badge.
- Rename the "Scaling Note" UI label to "Progression Note" everywhere (no field rename).

**Volume summary on plan detail**

- Plan detail page shows a computed "Weekly Volume" section: total working sets per muscle category across all days, using the existing `category` field on exercises.

**Mesocycle / Microcycle display**

- Plan card and detail show split type + training phase as labelled badges (e.g., "PPL · Hypertrophy · 6 wks").
- The existing weekly day structure is already a microcycle; no new data model needed — just a contextual label ("Week structure" → "Microcycle").

## Capabilities

### New Capabilities

- `gym-terminology`: Correct all user-facing strings to use gym-standard terms (Compound, Accessory, Progression Note, Microcycle, etc.).
- `plan-mesocycle-structure`: Training phase, split type, and deload flag on plans; displayed as badges on cards and in editors.
- `exercise-intensity-targets`: RIR and to-failure inputs on plan exercises; shown on exercise rows.
- `plan-volume-summary`: Computed weekly working sets per muscle group displayed on the plan detail page.

### Modified Capabilities

- `workout-plans`: `WorkoutPlan` gains `trainingPhase`, `splitType`, `isDeload`; `PlanExercise` gains `targetRir`, `toFailure`. All optional, no migration.
- `session-exercise-tracking`: `Exercise` gains `targetRir` and `toFailure` so intensity targets flow into active sessions from the plan.

## Impact

- `src/locales/en.json`, `de.json`, `hu.json` — string renames for terminology.
- `src/lib/types.ts` — new optional fields on `WorkoutPlan` and `PlanExercise` and `Exercise`.
- `src/app/plans/page.tsx` — plan card badges (split type, training phase, deload).
- `src/app/plans/[id]/page.tsx` — plan editor inputs for training phase, split type, isDeload; volume summary section.
- `src/components/AddPlanExerciseModal.tsx` — RIR / to-failure inputs; role label updates.
- `src/components/PlanDayEditor.tsx` — exercise row shows RIR/failure badge; terminology labels.
- `src/app/plans/[id]/session-start` area — terminology label update.
- No new external dependencies.
