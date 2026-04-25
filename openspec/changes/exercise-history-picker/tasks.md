## 1. Data layer

- [x] 1.1 Add `getHiddenExercises()` and `saveHiddenExercises()` in `src/lib/storage.ts` reading/writing `wst_hidden_exercises` (array of `{ nameKey: string; category?: string }`).
- [x] 1.2 Add a `canonicalExerciseKey(name, category)` helper (trim + lowercase the name) in `src/lib/utils.ts` (or a new `src/lib/exerciseHistory.ts`) and unit-test it.
- [x] 1.3 Implement `deriveExerciseHistory(sessions, plans, hidden, { includeHidden })` in `src/lib/exerciseHistory.ts` returning an ordered list of `HistoryEntry` (name, category, type, sets, reps, duration, weightKg, lastUsedAt, isHidden). Cover de-duplication, recency sort, and the hidden filter.
- [ ] 1.4 Unit-test `deriveExerciseHistory` for: empty inputs, dedupe by name+category, recency ordering, mixed plan vs session sources, hidden exclusion, and `includeHidden=true` returning hidden rows flagged. _(Deferred — repo has no test runner; tracked for a separate testing-infra change.)_

## 2. History hook

- [x] 2.1 Create `src/hooks/useExerciseHistory.ts` exposing `{ entries, hiddenCount, search, setSearch, showHidden, setShowHidden, hide(entry), unhide(entry) }`.
- [x] 2.2 Memoize the derived list against sessions/plans/hidden inputs and re-derive on storage updates within the same tab.
- [x] 2.3 Implement search filtering (case-insensitive substring on name and category).
- [x] 2.4 Wire `hide`/`unhide` to update the persisted hidden set via storage helpers and re-derive.

## 3. Picker UI

- [x] 3.1 Create `src/components/ExerciseHistoryPicker.tsx` as a modal/bottom-sheet listing entries with name, category, and last-used date.
- [x] 3.2 Add the search input bound to `useExerciseHistory.search`.
- [x] 3.3 Add a per-row overflow menu with "Forget this exercise" wording and the non-destructive disclaimer per spec.
- [x] 3.4 Add the "Show hidden (n)" toggle at the bottom; render hidden entries with an "Unhide" action when expanded; hide the toggle entirely when count is zero.
- [x] 3.5 Implement the empty-state message for users with no sessions and no plan exercises.
- [x] 3.6 Add `onSelect(entry)` callback prop and ensure tapping a row triggers it without auto-submitting any parent form.

## 4. Integrate into in-session add-exercise flow

- [x] 4.1 Add a "Pick from history" button to `src/components/AddExerciseModal.tsx` (header position, prominent above the name input).
- [x] 4.2 Wire the button to open `ExerciseHistoryPicker`; on `onSelect`, pre-fill name, category, type, sets, reps, duration, weightKg and close the picker, leaving the modal in edit-ready state.
- [x] 4.3 Ensure any in-flight wger request is ignored when a history selection arrives (cancel or noop on resolve).
- [x] 4.4 Verify wger suggestions still work when the user types directly without using the picker.

## 5. Integrate into plan editor add-exercise flows

- [x] 5.1 Add the same "Pick from history" entry point to `src/components/AddPlanExerciseModal.tsx`.
- [x] 5.2 Confirm the picker is reachable from plan day core, plan day optional, and plan shared exercises sections (all of which already use that modal).

## 6. Locales and copy

- [x] 6.1 Add new translation keys in `src/locales/` for the button label, picker title, search placeholder, empty state, hide action label, hide disclaimer, show-hidden toggle, and unhide label.
- [x] 6.2 Cover both supported languages (parity with existing `src/locales/` files).

## 7. Tests

- [ ] 7.1 Component test for `ExerciseHistoryPicker`: renders entries, search filters, hide removes from list, show-hidden toggle reveals + unhide restores, selection fires `onSelect`. _(Deferred — no test runner installed.)_
- [ ] 7.2 Integration test in `tests/` (or `e2e/`) that opens an active session, opens the add-exercise modal, picks from history, edits a field, and confirms the exercise is added. _(Deferred — no test runner installed.)_
- [ ] 7.3 Integration test that hides an entry, closes and reopens the picker, and verifies the entry stays hidden; then unhides and verifies it returns. _(Deferred — no test runner installed.)_
- [ ] 7.4 Test that a session containing a previously-hidden exercise still does not surface that entry in the default list. _(Deferred — no test runner installed.)_

## 8. QA + release prep

- [ ] 8.1 Manual pass through the in-session and plan-editor flows on mobile-width viewport. _(Pending user QA.)_
- [ ] 8.2 Verify no network call is made to wger when the picker is opened or used. _(Pending user QA — code path: history selection sets `skipWgerForCurrentName=true`, which feeds empty query into `useExerciseSuggestions`, suppressing wger.)_
- [x] 8.3 Update `README.md` if it documents the add-exercise flow; otherwise no doc changes. _(README does not document the add-exercise flow — no change needed.)_
- [x] 8.4 Run `openspec validate exercise-history-picker` and confirm clean before requesting review.
