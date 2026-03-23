## ADDED Requirements

### Requirement: Parsed session drafts are presented in an editable review step

After the LLM returns a list of session drafts, the system SHALL display an editable review UI instead of a read-only confirmation view. Each draft SHALL be fully editable before any data is saved.

#### Scenario: Review step shows all parsed sessions

- **WHEN** the LLM returns N session drafts
- **THEN** the review step SHALL display N editable session cards, one per draft

#### Scenario: Each card displays and allows editing of date and duration

- **WHEN** the user views a session card in the review step
- **THEN** the card SHALL show the inferred date and duration as editable fields
- **AND** the user SHALL be able to change both values before saving

#### Scenario: Each card displays and allows editing of exercises

- **WHEN** the user views a session card in the review step
- **THEN** the card SHALL show the list of exercises with their sets, reps, and weights as editable fields
- **AND** the user SHALL be able to modify any exercise name, set count, rep count, or weight value

### Requirement: User can add and remove exercises within a session draft

The review step SHALL allow structural edits to exercise lists, not just value changes.

#### Scenario: User removes an exercise from a draft

- **WHEN** the user taps a remove/delete action on an exercise row in a draft
- **THEN** that exercise SHALL be removed from the draft
- **AND** the draft SHALL reflect the updated exercise list immediately

#### Scenario: User adds an exercise to a draft

- **WHEN** the user taps an "Add exercise" action on a session card
- **THEN** a new empty exercise row SHALL be added to that draft
- **AND** the user SHALL be able to fill in the exercise name, sets, reps, and weight

### Requirement: User can remove an entire session draft from the review list

The user SHALL be able to exclude individual sessions from the bulk import without cancelling the entire flow.

#### Scenario: User removes a session draft

- **WHEN** the user taps a remove/delete action on a session card
- **THEN** that session draft SHALL be removed from the review list
- **AND** the remaining drafts SHALL be unaffected

#### Scenario: Review list becomes empty after all drafts removed

- **WHEN** the user removes all session drafts from the review list
- **THEN** the confirm/save action SHALL be disabled or hidden
- **AND** the user SHALL be able to navigate back to the paste step to start over

### Requirement: The confirm action saves all remaining reviewed drafts

#### Scenario: Save button is disabled when no drafts remain

- **WHEN** the review list contains zero session drafts
- **THEN** the "Save" / "Confirm" button SHALL be disabled

#### Scenario: Save button shows draft count

- **WHEN** the review list contains one or more session drafts
- **THEN** the "Save" button label SHALL indicate the number of sessions about to be saved (e.g., "Save 3 sessions")

#### Scenario: Drafts with empty exercise lists cannot be saved

- **WHEN** a session draft has an empty exercises array
- **THEN** that draft SHALL be marked as invalid
- **AND** the save action SHALL be blocked until the user either adds exercises or removes the invalid draft
