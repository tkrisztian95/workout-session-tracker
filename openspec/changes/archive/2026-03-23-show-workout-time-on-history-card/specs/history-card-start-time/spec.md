## ADDED Requirements

### Requirement: History card displays workout start time

The system SHALL display the formatted start time of the workout session on the history card, appended to the existing metadata subtitle line.

#### Scenario: Start time appears on the card subtitle

- **WHEN** a history card is rendered for a session with a valid `startedAt` value
- **THEN** the card subtitle shows the start time formatted as a locale-aware short time (e.g., "2:32 PM" or "14:32") appended after the duration

#### Scenario: Multiple sessions on the same day each show their own start time

- **WHEN** two or more sessions share the same calendar date
- **THEN** each card independently shows its own start time

### Requirement: Same-day sessions are ordered by start time, latest first

The system SHALL sort sessions within a given day by their `startedAt` timestamp in descending order so the most recently started session appears at the top of the day group.

#### Scenario: Two sessions on the same day are ordered latest start first

- **WHEN** two sessions share the same calendar date and have different `startedAt` values
- **THEN** the session with the later `startedAt` is rendered above the session with the earlier `startedAt`
