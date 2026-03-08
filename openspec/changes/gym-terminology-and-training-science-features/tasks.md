## 1. Terminology — locale string renames

- [ ] 1.1 In `src/locales/en.json`, rename all "optional exercise" labels to "accessory": update keys `optional_exercises_title`, `optional_label`, `no_optional_in_day`, `plan_day_optional_exercises`, `plan_day_no_optional`, `optional_exercises_subtitle`
- [ ] 1.2 In `en.json`, rename "Core (always included)" → "Compound (always included)" and `core_always_included` key; update `plan_day_core_exercises` and `plan_day_no_core`
- [ ] 1.3 In `en.json`, rename "Scaling Note" → "Progression Note" (key `exercise_scaling_note_label`) and update placeholder text
- [ ] 1.4 Add `training_days_label` section header copy for microcycle: rename/add key `plan_microcycle_label` with value "Microcycle"
- [ ] 1.5 Repeat all string changes for `src/locales/de.json` (German equivalents)
- [ ] 1.6 Repeat all string changes for `src/locales/hu.json` (Hungarian equivalents)

## 2. Terminology — component label fixes

- [ ] 2.1 In `AddPlanExerciseModal.tsx`, replace the role toggle's `capitalize(role)` rendering with explicit display map `{ core: t.role_compound, optional: t.role_accessory }` (add new locale keys `role_compound`, `role_accessory`)
- [ ] 2.2 In `PlanDayEditor.tsx`, update section header translation keys to use the new compound/accessory keys
- [ ] 2.3 In the session-start plan day screen, update subtitle copy to use the new compound/accessory terminology

## 3. Data model — extend types

- [ ] 3.1 Add `trainingPhase?: 'hypertrophy' | 'strength' | 'power' | 'peaking' | 'deload'` to `WorkoutPlan` in `src/lib/types.ts`
- [ ] 3.2 Add `splitType?: 'full-body' | 'upper-lower' | 'push-pull-legs' | 'bro-split' | 'custom'` to `WorkoutPlan`
- [ ] 3.3 Add `isDeload?: boolean` to `WorkoutPlan`
- [ ] 3.4 Add `targetRir?: number` and `toFailure?: boolean` to `PlanExercise`
- [ ] 3.5 Add `targetRir?: number` and `toFailure?: boolean` to `Exercise`

## 4. Plan editor — mesocycle structure inputs

- [ ] 4.1 In `src/app/plans/[id]/page.tsx`, add a "Training Phase" select (options: None, Hypertrophy, Strength, Power, Peaking, Deload) bound to `trainingPhase` state
- [ ] 4.2 Add a "Split Type" select (options: None, Full Body, Upper/Lower, Push-Pull-Legs, Bro Split, Custom) bound to `splitType` state
- [ ] 4.3 Add an "isDeload" checkbox/toggle in the plan editor
- [ ] 4.4 Include `trainingPhase`, `splitType`, `isDeload` in the `savePlan` call
- [ ] 4.5 Rename the Training Days section header to use a "Microcycle" label (add locale key, update JSX)

## 5. Plan card — mesocycle / split badges

- [ ] 5.1 In `PlanCard` (`src/app/plans/page.tsx`), render a context row below the plan name/subtitle when any of `splitType`, `trainingPhase`, or `scheduledWeeks` is set — showing compact labels (e.g., "PPL · Hypertrophy · 6 wks")
- [ ] 5.2 Apply a visually distinct style to the "Deload" phase badge (muted/grey) vs. performance phases

## 6. Exercise add modal — RIR and to-failure inputs

- [ ] 6.1 In `AddPlanExerciseModal.tsx`, add a RIR stepper row (0–4, plus "—" for unset) visible only for `sets-reps` and `sets-duration` types
- [ ] 6.2 Add a "To Failure" toggle button; selecting it sets `toFailure: true` and clears `targetRir`; setting a RIR value clears `toFailure`
- [ ] 6.3 Include `targetRir` and `toFailure` in the exercise object passed to `onAdd`

## 7. Plan day editor — RIR / failure display on exercise rows

- [ ] 7.1 In `PlanExerciseRow` (or `PlanDayEditor`), append RIR badge ("@2 RIR") or Failure badge ("@ Failure") to the exercise detail row when `targetRir` or `toFailure` is set

## 8. Session propagation — intensity targets

- [ ] 8.1 In the session-start clone logic (where `PlanExercise` is mapped to `Exercise`), copy `targetRir` and `toFailure` fields alongside existing fields

## 9. Plan detail — weekly volume summary

- [ ] 9.1 Write a `computeWeeklyVolume(plan: WorkoutPlan): Record<string, number>` utility that sums `sets` across all exercises (compound + accessory + shared) per `category`; exercises with no category map to `'Other'`; duration-only exercises (no `sets`) are skipped
- [ ] 9.2 In `src/app/plans/[id]/page.tsx`, render a "Weekly Volume" section using the computed volume map — display as a list of "Category: N sets" chips or rows
- [ ] 9.3 Hide the volume section when the plan has no exercises
