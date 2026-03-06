## Why

When adding exercises to a plan, users must type names from memory with no guidance on categorization or naming consistency, leading to duplicates and poor discoverability. A built-in exercise library with categories enables faster input and more consistent naming across plans.

## What Changes

- Introduce a static exercise library (data file) containing common exercises grouped by category (e.g., Chest, Back, Legs, Shoulders, Arms, Core, Cardio)
- Upgrade the exercise name input in `AddPlanExerciseModal` and `AddExerciseModal` to support autocomplete suggestions drawn from the library
- Allow users to either pick from the suggestion list or type a custom name not in the library
- Display the matched exercise category as a hint when a library exercise is selected (read-only, informational)

## Capabilities

### New Capabilities

- `exercise-library`: A static data source of exercises with names and categories, plus a lookup/suggestion hook used by exercise input fields

### Modified Capabilities

- `workout-plans`: The exercise name field gains autocomplete/lookup behavior; no requirement-level behavioral change to plan saving or structure

## Impact

- New data file: `src/lib/exerciseLibrary.ts` (or `.json`)
- Modified components: `AddPlanExerciseModal`, `AddExerciseModal`
- No schema changes; exercise `name` remains a plain string in storage
- No backend or API dependencies — purely client-side static data
