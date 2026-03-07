## MODIFIED Requirements

### Requirement: Tapping a history card navigates to session detail

The system SHALL navigate to a session detail view at `/history/[id]` when a history card is tapped. The detail view SHALL support both read-only display and an edit mode for modifying exercise data.

#### Scenario: Session detail shows exercises

- **WHEN** user taps a history card
- **THEN** the detail view displays the list of exercises for that session with completion states

#### Scenario: Back navigation returns to history list

- **WHEN** user is on a session detail view and navigates back
- **THEN** the app returns to the history list

#### Scenario: Edit mode is accessible from the session detail

- **WHEN** user is viewing the session detail
- **THEN** an Edit button is visible that enters edit mode for modifying exercise data
