## MODIFIED Requirements

### Requirement: Exercise suggestions via wger API

The system SHALL query the wger public REST API to provide exercise name suggestions as the user types in an exercise name input field. Suggestions SHALL include the exercise name and category. The input SHALL remain fully usable for custom (non-wger) names when the user ignores or dismisses suggestions.

#### Scenario: Suggestions appear after typing

- **WHEN** the user types 3 or more characters in the exercise name field
- **THEN** the system debounces 300 ms and queries wger API for matching exercises
- **THEN** up to 8 matching exercises are displayed in a dropdown below the input, each showing name and category

#### Scenario: Suggestion selection fills the input and persists category

- **WHEN** the user taps or clicks a suggestion item
- **THEN** the exercise name input is set to the selected exercise's name
- **THEN** a read-only category label is shown below the input
- **THEN** the selected category is stored and will be persisted when the exercise is saved
- **THEN** the manual category selector is hidden
- **THEN** the dropdown is dismissed

#### Scenario: Category label clears on manual edit

- **WHEN** the user modifies the exercise name input after selecting a suggestion
- **THEN** the category label is removed
- **THEN** the manual category selector becomes visible again

#### Scenario: Custom name submitted without error

- **WHEN** the user types a name not present in any suggestion and submits the form
- **THEN** the exercise is added with the typed name and whatever category the user selected in the manual selector (or no category if none selected)
