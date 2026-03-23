### Requirement: History page provides a way to create a manual session record

The system SHALL display a button on the History page that opens a new-session creation sheet.

#### Scenario: New session button is visible on History page

- **WHEN** the user is on the History page
- **THEN** a button to create a new past session is visible (e.g., a "+" icon or "New session" label)

#### Scenario: Opening the creation sheet

- **WHEN** the user taps the new session button
- **THEN** a bottom sheet opens for creating a new past workout session

### Requirement: New session sheet allows entering date and duration

The system SHALL allow the user to specify the date and total duration (in minutes) for the new session. These fields are shown after the session type (and optionally plan/day) has been selected.

#### Scenario: Date defaults to today

- **WHEN** the user reaches the date/duration/exercise form step
- **THEN** the date field defaults to today's date

#### Scenario: User can change the date

- **WHEN** the user taps the date field in the form step
- **THEN** the system allows selecting a past (or current) date

#### Scenario: User can enter total duration in minutes

- **WHEN** the user fills in the duration field in the form step
- **THEN** the input accepts a positive integer representing total session length in minutes

### Requirement: New session sheet requires at least one exercise before saving

The system SHALL disable the Save action until at least one exercise is added to the new session.

#### Scenario: Save disabled with no exercises

- **WHEN** the new session sheet is open and no exercises have been added
- **THEN** the Save button is disabled or not actionable

#### Scenario: Save enabled after adding an exercise

- **WHEN** at least one exercise has been added to the new session draft
- **THEN** the Save button becomes active

### Requirement: Saving a new manual record persists it to history

The system SHALL save the new session to localStorage and display it in the history list after the user confirms.

#### Scenario: Saved session appears in history list

- **WHEN** the user fills in the date, duration, at least one exercise, and taps Save
- **THEN** the session is saved with a unique ID and appears in the History page list sorted by date

#### Scenario: Dismissing the sheet discards the draft

- **WHEN** the user cancels or dismisses the creation sheet without saving
- **THEN** no new session is created and the history list is unchanged
