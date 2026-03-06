## 1. Exercise Library Data

- [ ] 1.1 Create `src/lib/exerciseLibrary.ts` with a typed `Exercise` interface (`name`, `category`)
- [ ] 1.2 Populate the library with common exercises across all categories: Chest, Back, Legs, Shoulders, Arms, Core, Cardio (aim for ~10–15 exercises per category)

## 2. Suggestion Hook

- [ ] 2.1 Create `src/hooks/useExerciseSuggestions.ts` implementing `useExerciseSuggestions(query: string)` that returns filtered matches (case-insensitive substring, capped at 8)
- [ ] 2.2 Add clear/reset logic to the hook so suggestions can be dismissed on selection or blur

## 3. Suggestion Dropdown UI

- [ ] 3.1 Create a reusable `ExerciseSuggestionList` component that renders a styled dropdown with exercise name and category badge per item
- [ ] 3.2 Ensure the dropdown is scrollable and capped to 8 visible items on mobile
- [ ] 3.3 Handle tap/click on a suggestion item: call an `onSelect(name, category)` callback and close the list

## 4. Integrate into AddPlanExerciseModal

- [ ] 4.1 Wire `useExerciseSuggestions` to the exercise name input in `AddPlanExerciseModal`
- [ ] 4.2 Render `ExerciseSuggestionList` below the name input when suggestions are present
- [ ] 4.3 On suggestion selection, set the name field value and show the category label below the input
- [ ] 4.4 Clear the category label when the user manually edits the name after selection
- [ ] 4.5 Ensure the submit button works correctly when the dropdown is open (dismiss dropdown or allow submit)

## 5. Integrate into AddExerciseModal

- [ ] 5.1 Wire `useExerciseSuggestions` to the exercise name input in `AddExerciseModal`
- [ ] 5.2 Render `ExerciseSuggestionList` below the name input when suggestions are present
- [ ] 5.3 On suggestion selection, set the name field value and show the category label
- [ ] 5.4 Clear the category label when the user manually edits the name after selection
- [ ] 5.5 Ensure submit works correctly with dropdown open

## 6. Verification

- [ ] 6.1 Manually test: type a known exercise name in both modals and confirm suggestions appear with correct categories
- [ ] 6.2 Manually test: type a custom name not in the library and confirm it submits without errors
- [ ] 6.3 Manually test: select a suggestion and confirm the category badge appears and name is filled
- [ ] 6.4 Manually test on mobile viewport to confirm dropdown doesn't obscure the submit button
