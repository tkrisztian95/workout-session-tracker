## ADDED Requirements

### Requirement: PlanExercise has an optional category field

The `PlanExercise` data model SHALL include an optional `category` field of type `string`. The field MAY be absent; its absence is valid and indicates no category was assigned.

#### Scenario: Exercise saved with category

- **WHEN** a user adds an exercise with a category value (from suggestion or manual selection)
- **THEN** the saved `PlanExercise` record includes `category` set to that string value

#### Scenario: Exercise saved without category

- **WHEN** a user adds an exercise without selecting or entering a category
- **THEN** the saved `PlanExercise` record has no `category` field

### Requirement: Category auto-filled from wger suggestion

When a user selects an exercise from the wger suggestion dropdown, the category returned by wger for that exercise SHALL be automatically set as the exercise's category and persisted on save.

#### Scenario: Suggestion with category selected

- **WHEN** the user selects a wger suggestion that has a category
- **THEN** the category field is set to the suggestion's category value
- **THEN** the category is persisted when the exercise is saved

#### Scenario: Suggestion with no category selected

- **WHEN** the user selects a wger suggestion that has no category
- **THEN** no category is set; the manual category selector becomes available

### Requirement: Manual category selector in add-exercise modals

Both `AddPlanExerciseModal` and `AddExerciseModal` SHALL display a category selector beneath the exercise name input area. The selector SHALL appear when no suggestion-sourced category is active, giving users a way to assign a category to custom-named exercises.

#### Scenario: Selector visible with no suggestion category

- **WHEN** the user has not selected a wger suggestion (or has cleared the name after selection)
- **THEN** a category selector is displayed below the name input with an empty/none default option

#### Scenario: Selector hidden when suggestion category is active

- **WHEN** the user has selected a wger suggestion that provides a category
- **THEN** the manual selector is hidden; a read-only category label is shown instead

#### Scenario: Manual category persisted on save

- **WHEN** the user picks a category from the manual selector and submits the form
- **THEN** the exercise is saved with the chosen category string

#### Scenario: No category selected leaves category absent

- **WHEN** the user leaves the category selector at its empty/none default and submits the form
- **THEN** the exercise is saved without a `category` field

### Requirement: Category displayed on plan exercise rows

In the plan detail view, exercise rows for `PlanExercise` entries that have a `category` SHALL display the category visually (e.g., as a small pill or label) near the exercise name.

#### Scenario: Category badge visible on plan

- **WHEN** the user views the plan detail page and an exercise has a `category` value
- **THEN** the category is rendered as a badge or label on the exercise row

#### Scenario: No badge when category absent

- **WHEN** the user views the plan detail page and an exercise has no `category`
- **THEN** no badge or placeholder is shown for that exercise row
