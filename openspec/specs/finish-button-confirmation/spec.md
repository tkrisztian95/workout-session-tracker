## ADDED Requirements

### Requirement: Finish button shows confirmation when exercises remain

When the user taps the Finish button and there are exercises that are neither completed nor dismissed, the system SHALL display a confirmation dialog before proceeding to the session complete flow. The dialog SHALL indicate how many exercises are remaining and ask the user to confirm they want to end the session early.

#### Scenario: User taps Finish with remaining exercises

- **WHEN** the user taps the Finish button
- **AND** at least one exercise is neither completed nor dismissed
- **THEN** a confirmation dialog SHALL appear asking the user to confirm ending the session early

#### Scenario: Confirmation dialog shows remaining count

- **WHEN** the confirmation dialog is displayed
- **THEN** it SHALL indicate the number of exercises still remaining

#### Scenario: User confirms early finish

- **WHEN** the confirmation dialog is shown
- **AND** the user taps the confirm action
- **THEN** the session complete flow SHALL proceed (SessionCompleteOverlay opens)

#### Scenario: User cancels early finish

- **WHEN** the confirmation dialog is shown
- **AND** the user taps the cancel action
- **THEN** the dialog SHALL close and the session SHALL continue without changes

#### Scenario: No confirmation when all exercises are done

- **WHEN** the user taps the Finish button
- **AND** all exercises are either completed or dismissed
- **THEN** the session complete flow SHALL proceed immediately without a confirmation dialog
