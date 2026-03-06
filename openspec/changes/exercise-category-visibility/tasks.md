## 1. Data Model

- [ ] 1.1 Add `category?: string` field to the `PlanExercise` interface in `src/lib/types.ts`

## 2. Locale Strings

- [ ] 2.1 Add `exercise_category_label` key to all locale files (`en.json`, `de.json`, `hu.json`) — used as the label above the manual category selector (e.g. "Category (optional)")
- [ ] 2.2 Add `exercise_category_none` key to all locale files — the empty/none option in the selector (e.g. "None")
- [ ] 2.3 Add the `exercise_category_label` and `exercise_category_none` keys to the `Translations` type in `src/lib/i18n.ts`

## 3. Manual Category Selector Component

- [ ] 3.1 Create a `WGER_CATEGORIES` constant (array of strings) in `src/lib/wgerClient.ts` listing the known wger exercise categories (Arms, Legs, Abs, Chest, Back, Shoulders, Calves, Cardio)
- [ ] 3.2 In `AddPlanExerciseModal.tsx`, replace the existing read-only category label block with logic that: shows the read-only label when `selectedCategory` is set (from suggestion), or shows a styled `<select>` for manual category selection when `selectedCategory` is null
- [ ] 3.3 Wire the `<select>` to a `manualCategory` state variable in `AddPlanExerciseModal.tsx`; reset it in `reset()`; clear it when a suggestion sets `selectedCategory`
- [ ] 3.4 In `handleSubmit` in `AddPlanExerciseModal.tsx`, pass `category: selectedCategory ?? manualCategory ?? undefined` into the `onAdd` payload
- [ ] 3.5 Apply the same changes (steps 3.2–3.4) to `AddExerciseModal.tsx`; note with a TODO comment that `Exercise` type doesn't yet have a `category` field so the value is captured but not persisted there

## 4. Plan Detail View — Category Badge

- [ ] 4.1 In `src/app/plans/[id]/page.tsx`, update the shared exercise row (around line 155) to render a small category pill/badge below `ex.name` when `ex.category` is present
- [ ] 4.2 In `src/components/PlanDayEditor.tsx`, update the exercise row (around line 30) to render the same category badge below `ex.name` when `ex.category` is present

## 5. Verification

- [ ] 5.1 Add a plan exercise by selecting a wger suggestion — confirm the category badge appears in the plan detail view after saving
- [ ] 5.2 Add a plan exercise with a custom name and a manually chosen category — confirm the badge appears
- [ ] 5.3 Add a plan exercise with no category selection — confirm no badge appears
- [ ] 5.4 Confirm existing plans (without category data) render without errors or empty badges
