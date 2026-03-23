## ADDED Requirements

### Requirement: History page shows a filter-specific empty state when no sessions match the active range

The system SHALL display a distinct empty state message when a date range filter is active and no session groups fall within the selected range.

#### Scenario: No sessions in active filter range

- **WHEN** a date range filter is active (`from` and `to` are set)
- **AND** no completed sessions have a date within that range
- **THEN** the history list shows an empty state with a title such as "No workouts in this range"
- **AND** a subtitle such as "Try widening your date range"

#### Scenario: Generic empty state unchanged when no sessions exist at all

- **WHEN** no date range filter is active
- **AND** the user has no completed sessions
- **THEN** the history list shows the existing "No sessions yet" empty state

#### Scenario: Normal list shown when filter matches at least one session

- **WHEN** a date range filter is active
- **AND** at least one session falls within the range
- **THEN** the matching session groups are displayed normally (no empty state)
