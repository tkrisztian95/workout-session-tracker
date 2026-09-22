# session-history-editing Specification

## Purpose

Lets users correct a completed session after the fact — toggle exercises between completed and skipped, adjust logged execution, add or remove exercises, and change duration — through an explicit edit mode whose changes are saved or discarded as a whole.

## Requirements

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

### Requirement: Users can toggle exercise completion state in edit mode

The system SHALL allow users to toggle each exercise between completed and dismissed states while in edit mode. Toggling a dismissed exercise out of the skipped state SHALL clear its skip reason and skip note in the draft.

#### Scenario: Toggling a completed exercise to dismissed

- **WHEN** the user is in edit mode and taps a completed exercise's state indicator
- **THEN** the exercise is marked as dismissed (skipped) in the draft

#### Scenario: Toggling a dismissed exercise to completed

- **WHEN** the user is in edit mode and taps a dismissed exercise's state indicator
- **THEN** the exercise is marked as completed in the draft

#### Scenario: Un-skipping clears the skip reason

- **WHEN** the user is in edit mode and toggles a dismissed exercise with a skip reason and note out of the skipped state
- **THEN** the draft exercise has no skip reason and no skip note

### Requirement: Saving commits edits to storage

The system SHALL persist all draft changes to localStorage when the user taps Save, then return to read mode displaying the updated data.

#### Scenario: Save writes updated session

- **WHEN** the user modifies exercise data and taps Save
- **THEN** the session is updated in localStorage with the new values and the view returns to read mode

#### Scenario: Read mode reflects saved changes

- **WHEN** the user has saved edits and is back in read mode
- **THEN** the exercise list displays the updated sets, reps, duration, and completion states

### Requirement: Users can edit the skip reason in edit mode

In edit mode, the system SHALL let the user set, change, or clear the skip reason and skip note of each skipped exercise, using the same reason options and note limit as the in-session skip sheet. Changes SHALL apply to the draft and SHALL be saved or discarded together with the other edit-mode changes.

#### Scenario: Adding a reason to a legacy skip

- **WHEN** the user is in edit mode, opens the skip reason editor on a skipped exercise with no reason, selects Fatigue / low energy, and confirms
- **THEN** the draft exercise has reason Fatigue / low energy

#### Scenario: Clearing a reason

- **WHEN** the user is in edit mode, deselects the reason and empties the note on a skipped exercise, and confirms
- **THEN** the draft exercise has no skip reason and no skip note

#### Scenario: Cancel discards reason edits

- **WHEN** the user changes a skip reason in edit mode and then cancels edit mode
- **THEN** the saved session keeps its original skip reason
