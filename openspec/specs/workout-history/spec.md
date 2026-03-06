### Requirement: History tab shows list of completed sessions

The system SHALL provide a History tab in the bottom navigation that displays all completed workout sessions in reverse chronological order.

#### Scenario: History tab is accessible

- **WHEN** user taps the History tab in the bottom nav
- **THEN** the app navigates to the history screen showing a list of past sessions

#### Scenario: Sessions shown newest first

- **WHEN** the history screen is displayed
- **THEN** sessions are listed with the most recently completed session at the top

#### Scenario: Empty state shown when no sessions exist

- **WHEN** the user has no completed sessions
- **THEN** the history screen displays an empty state message encouraging the user to complete their first workout

### Requirement: History cards show session summary

Each session in the history list SHALL display a summary card with date, plan name (if any), exercise count, and duration.

#### Scenario: Session with plan shows plan name

- **WHEN** a completed session has an associated plan
- **THEN** the history card displays the plan name and day name

#### Scenario: Free session shows generic label

- **WHEN** a completed session has no associated plan
- **THEN** the history card displays "Free Session" as the label

#### Scenario: Duration is shown on each card

- **WHEN** a session card is displayed
- **THEN** the elapsed time between `startedAt` and `completedAt` is shown formatted as minutes (e.g., "42 min")

### Requirement: Tapping a history card navigates to session detail

The system SHALL navigate to a session detail view at `/history/[id]` when a history card is tapped.

#### Scenario: Session detail shows exercises

- **WHEN** user taps a history card
- **THEN** the detail view displays the list of exercises for that session with completion states

#### Scenario: Back navigation returns to history list

- **WHEN** user is on a session detail view and navigates back
- **THEN** the app returns to the history list
