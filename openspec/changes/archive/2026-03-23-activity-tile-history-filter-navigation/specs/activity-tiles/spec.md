## MODIFIED Requirements

### Requirement: Tapping an active tile navigates to session detail

The system SHALL navigate to the appropriate session view when the user taps a tile that has at least one session on that day.

#### Scenario: Tap on day with one session

- **WHEN** user taps a tile with exactly one session
- **THEN** the app navigates to `/history/[id]` for that session

#### Scenario: Tap on day with multiple sessions

- **WHEN** user taps a tile with multiple sessions
- **THEN** the app navigates to `/history?date=YYYY-MM-DD` where `YYYY-MM-DD` is the ISO date of the tapped tile

#### Scenario: Tap on rest day tile is no-op

- **WHEN** user taps a tile with 0 sessions
- **THEN** nothing happens (no navigation)
