## 1. Step State and Navigation in NewHistorySessionSheet

- [x] 1.1 Add a `step` state to `NewHistorySessionSheet` with values: `'type-select' | 'plan-pick' | 'day-pick' | 'form'`; initialise to `'type-select'`
- [x] 1.2 Add `selectedPlan` and `selectedDayId` state fields to track the plan-based selection across steps
- [x] 1.3 Update `reset()` to also clear `step` back to `'type-select'` and clear `selectedPlan` / `selectedDayId`

## 2. Type Selection Step UI

- [x] 2.1 Render the type-selection step when `step === 'type-select'`: show sheet title and two tappable option cards — "From a plan" and "Free session"
- [x] 2.2 Tapping "Free session" sets `step` to `'form'`
- [x] 2.3 Tapping "From a plan" sets `step` to `'plan-pick'`

## 3. Plan Picker Step UI

- [x] 3.1 Render the plan-pick step when `step === 'plan-pick'`: load plans from `getPlans()` and display them as a selectable list
- [x] 3.2 Show an empty state message when no plans exist
- [x] 3.3 Tapping a plan sets `selectedPlan` and advances `step` to `'day-pick'`
- [x] 3.4 Add a back button that returns `step` to `'type-select'`

## 4. Day Picker Step UI

- [x] 4.1 Render the day-pick step when `step === 'day-pick'`: display all days of `selectedPlan` as a selectable list
- [x] 4.2 Show an empty state message when the selected plan has no days
- [x] 4.3 Tapping a day sets `selectedDayId`, pre-fills the exercise list (see task 5), and advances `step` to `'form'`
- [x] 4.4 Add a back button that returns `step` to `'plan-pick'`

## 5. Exercise Pre-fill from Plan Day

- [x] 5.1 On day selection: convert the plan's `sharedExercises` + the chosen day's `coreExercises` from `PlanExercise` to `Exercise` shape (new UUID id, `completed: false`, no `loggedSets`); set this as the initial `exercises` state for the form step
- [x] 5.2 Ensure optional exercises from the day are NOT included in the pre-fill

## 6. Plan Identifiers on Saved Session

- [x] 6.1 In `handleSave`, if `selectedPlan` and `selectedDayId` are set, include `planId: selectedPlan.id` and `planDayId: selectedDayId` on the `WorkoutSession` object before calling `saveSession`
- [x] 6.2 For free sessions (no `selectedPlan`), omit `planId` and `planDayId` from the saved object

## 7. Localization

- [x] 7.1 Add translation keys: session type step title, "From a plan" option label, "Free session" option label, plan picker step title, day picker step title, no-plans empty state, no-days empty state
- [x] 7.2 Add the new keys to `en.json`, `hu.json`, and `de.json`
