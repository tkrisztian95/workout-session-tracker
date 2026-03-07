## ADDED Requirements

### Requirement: Session detail provides an edit mode toggle

The system SHALL display an edit button on the session detail view that enters edit mode, and provide Save and Cancel actions to exit edit mode.

#### Scenario: Edit button is visible in read mode

- **WHEN** the user is viewing a completed session detail page
- **THEN** an Edit button is visible in the page header

#### Scenario: Entering edit mode

- **WHEN** the user taps the Edit button
- **THEN** the view switches to edit mode, showing editable inputs for exercise data and Save/Cancel actions

#### Scenario: Cancelling discards changes

- **WHEN** the user taps Cancel while in edit mode
- **THEN** all changes are discarded and the view returns to read mode with the original session data

### Requirement: Users can edit numeric exercise fields in edit mode

The system SHALL allow users to modify sets, reps, and duration values on each exercise while in edit mode.

#### Scenario: Sets-reps exercise shows editable sets and reps inputs

- **WHEN** the session detail is in edit mode and an exercise has type `sets-reps`
- **THEN** the exercise row shows numeric inputs for sets and reps

#### Scenario: Sets-duration exercise shows editable sets and duration inputs

- **WHEN** the session detail is in edit mode and an exercise has type `sets-duration`
- **THEN** the exercise row shows numeric inputs for sets and duration (in seconds)

#### Scenario: Duration-only exercise shows editable duration input

- **WHEN** the session detail is in edit mode and an exercise has type `duration`
- **THEN** the exercise row shows a single numeric input for duration (in seconds)

### Requirement: Users can toggle exercise completion state in edit mode

The system SHALL allow users to toggle each exercise between completed and dismissed states while in edit mode.

#### Scenario: Toggling a completed exercise to dismissed

- **WHEN** the user is in edit mode and taps a completed exercise's state indicator
- **THEN** the exercise is marked as dismissed (skipped) in the draft

#### Scenario: Toggling a dismissed exercise to completed

- **WHEN** the user is in edit mode and taps a dismissed exercise's state indicator
- **THEN** the exercise is marked as completed in the draft

### Requirement: Saving commits edits to storage

The system SHALL persist all draft changes to localStorage when the user taps Save, then return to read mode displaying the updated data.

#### Scenario: Save writes updated session

- **WHEN** the user modifies exercise data and taps Save
- **THEN** the session is updated in localStorage with the new values and the view returns to read mode

#### Scenario: Read mode reflects saved changes

- **WHEN** the user has saved edits and is back in read mode
- **THEN** the exercise list displays the updated sets, reps, duration, and completion states
