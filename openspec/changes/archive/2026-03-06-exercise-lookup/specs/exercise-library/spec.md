## ADDED Requirements

### Requirement: Exercise library provides a searchable list of common exercises by category

The system SHALL include a static exercise library containing common exercises, each with a `name` (string) and `category` (string, e.g., "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio"). The library SHALL be available client-side with no network request.

#### Scenario: Library is accessible at runtime

- **WHEN** either add-exercise modal is opened
- **THEN** the exercise library data is available synchronously for filtering

#### Scenario: Library covers major muscle groups

- **WHEN** the library is inspected
- **THEN** it SHALL contain exercises grouped under at least: Chest, Back, Legs, Shoulders, Arms, Core, Cardio

### Requirement: Exercise name input shows autocomplete suggestions from the library

The exercise name field in both `AddPlanExerciseModal` and `AddExerciseModal` SHALL display a suggestion list as the user types, filtered by case-insensitive substring match against library exercise names.

#### Scenario: Suggestions appear after typing

- **WHEN** the user types one or more characters in the exercise name field
- **THEN** a dropdown of matching library exercises SHALL appear below the input, showing the exercise name and its category

#### Scenario: No suggestions shown for empty input

- **WHEN** the exercise name field is empty
- **THEN** no suggestion dropdown SHALL be visible

#### Scenario: No suggestions shown when no match exists

- **WHEN** the user types a string that matches no library exercise name
- **THEN** the suggestion dropdown SHALL not appear (or be empty), and the user MAY still submit the custom name

#### Scenario: Suggestions are capped for readability

- **WHEN** more than 8 library exercises match the current input
- **THEN** only the first 8 matches SHALL be displayed in the dropdown

### Requirement: Selecting a suggestion fills the exercise name field

The system SHALL allow users to select an item from the suggestion dropdown to populate the exercise name input.

#### Scenario: Suggestion selection sets the input value

- **WHEN** the user taps or clicks a suggestion in the dropdown
- **THEN** the exercise name field SHALL be set to the selected exercise name and the dropdown SHALL close

#### Scenario: Category label is shown after selection

- **WHEN** the user selects a suggestion from the library
- **THEN** the matched category SHALL be displayed as a read-only label near the exercise name field

#### Scenario: Category label is hidden for custom names

- **WHEN** the user types a name that does not match any library exercise (after dismissing suggestions)
- **THEN** no category label SHALL be shown

### Requirement: Custom exercise names are always allowed

The system SHALL not prevent users from submitting an exercise name that does not exist in the library.

#### Scenario: Custom name submits successfully

- **WHEN** the user types a name not found in the exercise library and submits the form
- **THEN** the exercise is saved with the typed name and no category metadata

#### Scenario: Suggestion dropdown does not block form submission

- **WHEN** the suggestion dropdown is visible and the user taps the submit button
- **THEN** the form submits with the current input value (or the suggestion dropdown closes and focus returns to the input, allowing a second submit)
