## 1. Data Model

- [ ] 1.1 Add `status?: 'active' | 'completed'` field to the `WorkoutPlan` interface in `src/lib/types.ts`
- [ ] 1.2 Add a `togglePlanStatus` (or `markPlanCompleted` / `reactivatePlan`) helper to `src/lib/storage.ts` that reads the plan, sets its status, and writes it back

## 2. Plans List UI

- [ ] 2.1 Split the plans list into two arrays: active (status `'active'` or undefined) and completed (status `'completed'`)
- [ ] 2.2 Render active plans in the existing list section
- [ ] 2.3 Add a collapsible "Completed" section below the active list, collapsed by default
- [ ] 2.4 Show the "Completed" section only when there is at least one completed plan

## 3. Plan Actions

- [ ] 3.1 Add "Mark as Completed" action to each active plan's action menu / swipe actions
- [ ] 3.2 Add "Reactivate" action to each completed plan's action menu
- [ ] 3.3 Wire both actions to the `togglePlanStatus` storage helper and refresh the list

## 4. Session Start Guard

- [ ] 4.1 Hide or disable the "Start Session" button/entry point for completed plans

## 5. Verification

- [ ] 5.1 Verify existing plans without a `status` field appear in the active section
- [ ] 5.2 Verify marking a plan as completed moves it to the completed section
- [ ] 5.3 Verify reactivating a plan moves it back to the active section
- [ ] 5.4 Verify completed plans cannot be used to start a session
