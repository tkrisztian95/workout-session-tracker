## Context

The exercise-lookup-wger spec introduced wger-powered suggestions in add-exercise modals. When a user selects a suggestion, the category is shown transiently via `selectedCategory` state, but it is discarded at submit time — neither `PlanExercise` nor `Exercise` has a `category` field. Users with no wger match also have no path to assign a category.

The plan detail view renders exercise rows but shows no category context, making all exercises look the same regardless of origin.

## Goals / Non-Goals

**Goals:**

- Persist `category` on `PlanExercise` (optional string)
- Auto-fill category from wger suggestion selection and include it in the saved exercise
- Add a manual category selector in both add-exercise modals as a fallback when no suggestion was selected or when the suggestion had no category
- Render the category on exercise rows in the plan detail view

**Non-Goals:**

- Persisting category on in-session `Exercise` records (sessions track live tracking state; adding category there is a separate concern)
- Fetching or validating categories against the wger category list at save time
- Allowing the user to edit a category after an exercise is added (edit flow is out of scope)
- Internationalizing the category names returned by wger (they come in from the API as-is)

## Decisions

### 1. Add `category` only to `PlanExercise`, not `Exercise`

`Exercise` is the in-session tracking type. Polluting it with plan metadata has no current benefit and would change the session storage schema. `PlanExercise` is the right home for persistent plan-level attributes.

_Alternative_: Add `category` to both. Rejected — the session view doesn't currently show categories and the `Exercise` type is also used for free-form session exercises where category is rarely known.

### 2. Manual category selector uses a predefined list of wger categories

wger's category list is stable and small (~10 items). A hardcoded list avoids an extra API call at modal open time, keeps offline behavior intact, and stays consistent with what the suggestion dropdown already shows. The selector renders as a native `<select>` (styled to match existing inputs) which is lightweight and accessible.

_Alternative_: Free-text input. Rejected — uncontrolled strings lead to duplicates (e.g. "Back" vs "back") and reduce filtering/grouping utility later.

### 3. Category selector appears only when no suggestion-sourced category is set

To avoid confusion between the auto-filled category (from wger) and a manually chosen one, the selector is shown when `selectedCategory` is null. Once a suggestion fills the category, the read-only label replaces the selector. If the user then edits the name (clearing `selectedCategory`), the selector reappears.

_Alternative_: Always show the selector. Rejected — adds noise to the happy path where suggestions already provide the category.

### 4. Render category in plan detail as a small badge/pill below the exercise name

Consistent with the transient label style already used in the modal. A subtle pill with low-contrast styling avoids visual clutter while keeping the information accessible.

## Risks / Trade-offs

- **Existing data has no category** → Category is optional (`category?: string`), so old exercises render without a badge. No migration needed.
- **wger category list drift** → If wger adds new categories, the hardcoded list becomes stale. Mitigation: the list is easy to update in one place; a free-text fallback is not needed since the transient suggestion label already shows the raw wger value.
- **AddExerciseModal (session)** → This modal uses `Exercise`, not `PlanExercise`. The category captured there is currently not persisted. For now, the selector still appears so the UX is consistent, but the value is silently dropped. A TODO comment will document this.
