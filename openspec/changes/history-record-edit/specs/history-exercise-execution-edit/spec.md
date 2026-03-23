## ADDED Requirements

### Requirement: History exercise editor shows per-set rows for sets-reps exercises

The system SHALL display one editable row per logged set (weight × reps) when editing a `sets-reps` exercise's execution data in a history context.

#### Scenario: Existing logged sets shown as editable rows

- **WHEN** the user opens the history exercise editor for a `sets-reps` exercise that has `loggedSets`
- **THEN** each logged set is shown as a row with a weight (kg) input and a reps input

#### Scenario: Empty state shows one default set row

- **WHEN** the user opens the history exercise editor for a `sets-reps` exercise with no `loggedSets`
- **THEN** one row with empty weight and default reps is shown

#### Scenario: User can add a set row

- **WHEN** the user taps the add-set button
- **THEN** a new row with empty inputs is appended to the list

#### Scenario: User can remove a set row

- **WHEN** the user taps the remove button on a set row
- **THEN** that row is removed from the list

### Requirement: History exercise editor shows duration input for non-sets-reps exercises

The system SHALL display a single duration input (in seconds) when editing a `duration` or `sets-duration` exercise's execution data.

#### Scenario: Duration exercise shows duration field

- **WHEN** the user opens the history exercise editor for a `duration` or `sets-duration` exercise
- **THEN** a single numeric input for duration in seconds is displayed

#### Scenario: Existing duration value pre-filled

- **WHEN** the exercise already has a `duration` value
- **THEN** the duration input is pre-filled with that value

### Requirement: History exercise editor shows plan targets as read-only context

The system SHALL display the exercise's plan-target values (sets, reps, duration goal) as read-only reference so the user knows what was intended.

#### Scenario: Target context is visible but not editable

- **WHEN** the history exercise editor is open for an exercise with target sets and reps
- **THEN** the target values are shown as non-interactive context (e.g., "Target: 3×10")

### Requirement: Confirming the editor updates the exercise in the session draft

The system SHALL apply changes from the history exercise editor to the in-memory session draft without persisting until the session-level Save is tapped.

#### Scenario: Confirm updates draft

- **WHEN** the user taps Done/Confirm in the history exercise editor
- **THEN** the exercise in the session draft is updated with the new loggedSets (or duration) values

#### Scenario: Cancel discards local edits

- **WHEN** the user taps Cancel in the history exercise editor
- **THEN** the exercise in the draft is unchanged
