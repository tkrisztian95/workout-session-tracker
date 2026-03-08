## 1. Extend data models

- [ ] 1.1 Add `scheduledWeeks?: number` to `WorkoutPlan` in `src/lib/types.ts`
- [ ] 1.2 Add `weightKg?: number` to `PlanExercise` in `src/lib/types.ts`
- [ ] 1.3 Add `weightKg?: number` to `Exercise` in `src/lib/types.ts`

## 2. Plan scheduled duration — editor

- [ ] 2.1 Add a number input ("Scheduled duration (weeks)") to the plan editor in `src/app/plans/[id]/page.tsx`, bound to a `scheduledWeeks` state variable
- [ ] 2.2 Validate that the entered value is between 1 and 52; show an error and block save if not
- [ ] 2.3 Include `scheduledWeeks` (or omit when empty) when calling `savePlan` in the editor

## 3. Plan scheduled duration — plan card display

- [ ] 3.1 In `PlanCard` (`src/app/plans/page.tsx`), render the weeks label (e.g., "4 weeks") in the subtitle row when `plan.scheduledWeeks` is set

## 4. Plan duplicate

- [ ] 4.1 Add `duplicatePlan(id: string): WorkoutPlan` helper in `src/lib/storage.ts` — deep-clone the plan with fresh UUIDs for plan, days, and all exercises; suffix name with " (copy)"; set status to `'active'`; save and return the new plan
- [ ] 4.2 Add a copy icon button (`Copy` from lucide-react) to `PlanCard`'s action row in `src/app/plans/page.tsx`
- [ ] 4.3 On click, call `duplicatePlan`, refresh the plan list state, and navigate to `/plans/<newId>`

## 5. Exercise weight — plan form

- [ ] 5.1 Add a weight input ("Weight (kg)") to `AddPlanExerciseModal` — visible only when `type` is `sets-reps` or `sets-duration`
- [ ] 5.2 Include `weightKg` (or omit when empty) in the exercise object passed to the parent on submit
- [ ] 5.3 Display `weightKg` alongside sets/reps in the exercise list rows in `PlanDayEditor` (e.g., "3×10 · 80 kg")

## 6. Exercise weight — session propagation

- [ ] 6.1 Locate the code that clones `PlanExercise` into `Exercise` at session-start time (in `src/app/plans/[id]/page.tsx` or the session-start handler) and ensure `weightKg` is copied across
