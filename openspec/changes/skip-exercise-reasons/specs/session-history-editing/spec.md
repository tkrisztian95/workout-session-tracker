## MODIFIED Requirements

### Requirement: Users can toggle exercise completion state in edit mode

The system SHALL allow users to toggle each exercise between completed and dismissed states while in edit mode. Toggling a dismissed exercise to completed SHALL clear its skip reason and skip note in the draft.

#### Scenario: Toggling a completed exercise to dismissed

- **WHEN** the user is in edit mode and taps a completed exercise's state indicator
- **THEN** the exercise is marked as dismissed (skipped) in the draft

#### Scenario: Toggling a dismissed exercise to completed

- **WHEN** the user is in edit mode and taps a dismissed exercise's state indicator
- **THEN** the exercise is marked as completed in the draft

#### Scenario: Toggling to completed clears the skip reason

- **WHEN** the user is in edit mode and toggles a dismissed exercise with a skip reason and note to completed
- **THEN** the draft exercise has no skip reason and no skip note

## ADDED Requirements

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
