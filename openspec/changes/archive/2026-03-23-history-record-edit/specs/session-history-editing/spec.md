## MODIFIED Requirements

### Requirement: Users can edit numeric exercise fields in edit mode

The system SHALL allow users to modify execution data on each exercise while in edit mode using the history exercise execution editor, not the plan-target modal.

#### Scenario: Tapping the edit icon on a sets-reps exercise opens the history execution editor

- **WHEN** the session detail is in edit mode and the user taps the edit icon on a `sets-reps` exercise
- **THEN** the history exercise execution editor opens showing per-set logged rows (weight × reps)

#### Scenario: Tapping the edit icon on a duration exercise opens the history execution editor

- **WHEN** the session detail is in edit mode and the user taps the edit icon on a `duration` or `sets-duration` exercise
- **THEN** the history exercise execution editor opens showing a duration (seconds) input

#### Scenario: Confirming edits updates the draft

- **WHEN** the user modifies execution data in the history exercise editor and confirms
- **THEN** the exercise in the draft is updated with the new loggedSets or duration values
