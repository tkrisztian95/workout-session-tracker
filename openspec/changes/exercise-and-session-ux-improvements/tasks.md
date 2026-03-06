## 1. Data Model Updates

- [x] 1.1 Update `Exercise` type: change `type` to `'sets-reps' | 'sets-duration' | 'duration'`; `sets` and `reps` absent on `duration` mode
- [x] 1.2 Update `PlanExercise` type: same 3-way `type` model; `role` field unchanged
- [x] 1.3b Write a `migrateExerciseType` helper that maps old `'reps'` → `'sets-reps'` and `'duration'` → `'sets-duration'`; apply on localStorage load
- [x] 1.4 Add `completed` and `dismissed` optional boolean fields to `Exercise` (in-session use)
- [x] 1.5 Add `sharedExercises: PlanExercise[]` to `WorkoutPlan` type (default empty array)

## 2. Exercise Form UI Updates

- [x] 2.1 Update `AddExerciseModal` and `AddPlanExerciseModal`: show a 3-way type selector (`sets & reps` / `sets & duration` / `duration`); show/hide fields based on selection with validation
- [x] 2.2 Update `ExerciseCard` component to render correctly when sets/reps/duration are absent

## 3. Plan: Shared Exercises

- [x] 3.1 Update plan edit page (`/plans/[id]`) to show a "Shared Exercises" section with add/remove
- [x] 3.2 Update `PlanDayEditor` or plan storage helpers to persist `sharedExercises` on save
- [x] 3.3 Ensure new plans are created with `sharedExercises: []` as default

## 4. Session: Exercise Tracking (tick & dismiss)

- [x] 4.1 Update `ExerciseCard` to show a checkmark/tick button that toggles `completed` state
- [x] 4.2 Update `ExerciseCard` to show a "Dismiss" action (replacing or supplementing any remove icon) that sets `dismissed: true`
- [x] 4.3 In the active session view, visually separate completed exercises from remaining ones
- [x] 4.4 Visually de-emphasize or hide dismissed exercises in the session view
- [x] 4.5 Persist `completed`/`dismissed` state to `wst_active_session` in localStorage on each change

## 5. Session: Live Timer

- [x] 5.1 Add a `SessionTimer` component that counts up from `startedAt` in MM:SS (or HH:MM:SS) format
- [x] 5.2 Integrate `SessionTimer` into the active session view
- [x] 5.3 Ensure the timer initializes from the stored `startedAt` so it survives page refresh

## 6. Plan Session Start: Shared Exercises & Next-Day Focus

- [x] 6.1 Update session-start logic: when building the exercise list from a plan day, prepend the plan's `sharedExercises`
- [x] 6.2 Update the plan day picker: compute the next incomplete day from `wst_sessions` history for the selected plan
- [x] 6.3 Auto-scroll or highlight the next incomplete day when the plan day picker opens
- [x] 6.4 Handle wrap-around: if all days have been completed, focus day 1 (cycle restart)

## 7. Session Completion Feedback

- [x] 7.1 Create a `SessionCompleteOverlay` component that shows on session finish (before save confirmation)
- [x] 7.2 Add a CSS keyframe success animation (e.g., scale + fade-in, or confetti via pure CSS)
- [x] 7.3 Display stat summary in the overlay: exercises completed (non-dismissed), sets completed, elapsed time
- [x] 7.4 Make the overlay dismissible (tap/click to proceed to save confirmation)
- [x] 7.5 Integrate `SessionCompleteOverlay` into the finish session flow

## 8. Stat Calculation Helpers

- [x] 8.1 Add a utility function `calcSessionStats(exercises)` that returns `{ completedExercises, completedSets, elapsedSeconds }` excluding dismissed exercises
- [x] 8.2 Use `calcSessionStats` in `SessionCompleteOverlay` to populate the stat display
