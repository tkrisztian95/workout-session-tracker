## Why

When adding exercises to a plan, users must type names from memory with no guidance on categorization or naming consistency. Using the wger REST API instead of a static data file means access to a large, maintained, community-curated exercise catalog — without bundling any data with the app.

## What Changes

- Replace the planned static exercise library with a live lookup against the wger public REST API (`https://wger.de/api/v2/`)
- Upgrade the exercise name input in `AddPlanExerciseModal` and `AddExerciseModal` to autocomplete suggestions drawn from wger API results
- Cache API results in-session (no repeated fetches for the same query)
- Allow users to either pick from the suggestion list or type a custom name not in the library
- Display the matched exercise category as a hint when a wger exercise is selected (read-only, informational)

## Capabilities

### New Capabilities

- `exercise-lookup-wger`: A wger API client and suggestion hook that powers exercise name autocomplete in both add-exercise modals, with in-session caching

### Modified Capabilities

- `workout-plans`: The exercise name field gains autocomplete/lookup behavior backed by wger API; no requirement-level behavioral change to plan saving or structure

## Impact

- New file: `src/lib/wgerClient.ts` (API fetch logic + in-session cache)
- New file: `src/hooks/useExerciseSuggestions.ts` (suggestion hook using wger client)
- New component: `src/components/ExerciseSuggestionList.tsx`
- Modified components: `AddPlanExerciseModal`, `AddExerciseModal`
- No schema changes; exercise `name` remains a plain string in storage
- Runtime dependency on `https://wger.de/api/v2/` (gracefully degrades if offline — users can still type freely)
