## 1. Data Model

- [x] 1.1 Add `status?: 'active' | 'completed'` field to the `WorkoutPlan` interface in `src/lib/types.ts`
- [x] 1.2 Add a `togglePlanStatus` (or `markPlanCompleted` / `reactivatePlan`) helper to `src/lib/storage.ts` that reads the plan, sets its status, and writes it back

## 2. Plans List UI

- [x] 2.1 Split the plans list into two arrays: active (status `'active'` or undefined) and completed (status `'completed'`)
- [x] 2.2 Render active plans in the existing list section
- [x] 2.3 Add a collapsible "Completed" section below the active list, collapsed by default
- [x] 2.4 Show the "Completed" section only when there is at least one completed plan

## 3. Plan Actions

- [x] 3.1 Add "Mark as Completed" action to each active plan's action menu / swipe actions
- [x] 3.2 Add "Reactivate" action to each completed plan's action menu
- [x] 3.3 Wire both actions to the `togglePlanStatus` storage helper and refresh the list

## 4. Session Start Guard

- [x] 4.1 Hide or disable the "Start Session" button/entry point for completed plans

## 5. Verification

- [x] 5.1 Verify existing plans without a `status` field appear in the active section
- [x] 5.2 Verify marking a plan as completed moves it to the completed section
- [x] 5.3 Verify reactivating a plan moves it back to the active section
- [x] 5.4 Verify completed plans cannot be used to start a session
