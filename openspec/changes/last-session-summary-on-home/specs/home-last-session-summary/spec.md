## ADDED Requirements

### Requirement: Display last session summary on home screen

The home start screen SHALL display a summary of the most recent completed workout session beneath the user greeting. The summary SHALL show the relative time since the session (e.g. "Today", "Yesterday", "3 days ago") and the session name (plan day name, or "Free session" if no plan was used).

#### Scenario: Last session was yesterday

- **WHEN** the user opens the home screen
- **AND** the most recent completed session was completed on the previous calendar day
- **THEN** the summary SHALL display "Yesterday" as the relative time

#### Scenario: Last session was multiple days ago

- **WHEN** the user opens the home screen
- **AND** the most recent completed session was completed N calendar days ago (N >= 2)
- **THEN** the summary SHALL display "N days ago" as the relative time

#### Scenario: Last session was today

- **WHEN** the user opens the home screen
- **AND** the most recent completed session was completed on the current calendar day
- **THEN** the summary SHALL display "Today" as the relative time

#### Scenario: Last session was a plan day session

- **WHEN** the most recent session has an associated planId and planDayId
- **AND** the corresponding plan still exists in storage
- **THEN** the summary SHALL display the plan day name as the session name

#### Scenario: Last session plan no longer exists

- **WHEN** the most recent session has a planId
- **AND** the corresponding plan no longer exists in storage
- **THEN** the summary SHALL display "Free session" as the session name fallback

#### Scenario: Last session was a free session

- **WHEN** the most recent session has no planId
- **THEN** the summary SHALL display "Free session" as the session name

#### Scenario: No sessions exist

- **WHEN** the user opens the home screen
- **AND** there are no completed sessions in storage
- **THEN** no last session summary SHALL be displayed
