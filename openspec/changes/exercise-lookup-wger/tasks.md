## 1. wger API Client

- [ ] 1.1 Create `src/lib/wgerClient.ts` with a hardcoded `CATEGORY_MAP` mapping wger category IDs to English names (Chest, Back, Legs, Shoulders, Arms, Core, Cardio, etc.)
- [ ] 1.2 Implement `searchExercises(query: string): Promise<WgerExercise[]>` that fetches from `https://wger.de/api/v2/exercise/?format=json&language=2&limit=8&name=<query>` and returns `{ name, category }` objects
- [ ] 1.3 Add module-level `Map<string, WgerExercise[]>` session cache; return cached results without fetching if query was already fetched
- [ ] 1.4 Handle fetch errors silently: return empty array on any failure

## 2. Suggestion Hook

- [ ] 2.1 Create `src/hooks/useExerciseSuggestions.ts` with `useExerciseSuggestions(query: string)` that returns `{ suggestions, loading, clearSuggestions }`
- [ ] 2.2 Debounce the query by 300 ms before calling `searchExercises`; skip fetch if query is fewer than 3 characters
- [ ] 2.3 Set `loading: true` while a fetch is in-flight; set to false on completion or error
- [ ] 2.4 Implement `clearSuggestions()` to reset the suggestions list (called on selection or blur)

## 3. Suggestion Dropdown UI

- [ ] 3.1 Create `src/components/ExerciseSuggestionList.tsx` that renders a styled dropdown `<ul>` with exercise name and category badge per item
- [ ] 3.2 Show a subtle loading indicator (e.g., spinner or pulsing text) when `loading` is true and no suggestions yet
- [ ] 3.3 Cap visible items to 8 with scroll; ensure dropdown is touch-friendly on mobile
- [ ] 3.4 On tap/click of an item, call `onSelect(name, category)` and close the list

## 4. Integrate into AddPlanExerciseModal

- [ ] 4.1 Wire `useExerciseSuggestions` to the exercise name input; pass `name` as the query
- [ ] 4.2 Render `ExerciseSuggestionList` below the name input when suggestions are present or `loading` is true
- [ ] 4.3 On suggestion selection, set the name field and store the category in local state; show category as a label below the input
- [ ] 4.4 Clear the category label when the user manually edits the name after a selection
- [ ] 4.5 Call `clearSuggestions()` on input blur (with a short delay to allow tap-on-item to register)
- [ ] 4.6 Ensure the submit button remains accessible and functional when the dropdown is open

## 5. Integrate into AddExerciseModal

- [ ] 5.1 Wire `useExerciseSuggestions` to the exercise name input
- [ ] 5.2 Render `ExerciseSuggestionList` below the name input when suggestions are present or `loading` is true
- [ ] 5.3 On suggestion selection, set the name field and show the category label
- [ ] 5.4 Clear the category label when the user manually edits the name after a selection
- [ ] 5.5 Call `clearSuggestions()` on input blur with tap-delay guard
- [ ] 5.6 Ensure submit works correctly with dropdown open

## 6. Verification

- [ ] 6.1 Manually test: type a known exercise name (e.g. "bench") in both modals and confirm wger suggestions appear with correct categories
- [ ] 6.2 Manually test: type a custom name not in wger and confirm it submits without errors
- [ ] 6.3 Manually test: select a suggestion and confirm the category badge appears and name is filled
- [ ] 6.4 Manually test offline (disable network): confirm no suggestions, no error UI, input still works
- [ ] 6.5 Manually test on mobile viewport: confirm dropdown doesn't obscure the submit button
