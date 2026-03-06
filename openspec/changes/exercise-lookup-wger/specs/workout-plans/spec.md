## MODIFIED Requirements

### Requirement: Exercise name input in add-exercise modals

The exercise name input in `AddPlanExerciseModal` and `AddExerciseModal` SHALL support autocomplete suggestions sourced from the wger exercise catalog. Users SHALL still be able to type and submit any free-text name. The stored exercise name SHALL remain a plain string; no category or wger metadata is persisted.

#### Scenario: Suggestions appear on input

- **WHEN** the user types 3 or more characters in the exercise name field in either modal
- **THEN** the system queries wger and displays matching suggestions below the input

#### Scenario: Submit with suggestion selected

- **WHEN** the user selects a suggestion and taps "Add Exercise"
- **THEN** the exercise is saved with the suggestion's name as a plain string

#### Scenario: Submit with free-text name

- **WHEN** the user types a custom name and taps "Add Exercise" without selecting a suggestion
- **THEN** the exercise is saved with the typed name as a plain string

#### Scenario: Dropdown does not block submit

- **WHEN** the suggestion dropdown is open
- **THEN** the "Add Exercise" submit button remains accessible and functional
