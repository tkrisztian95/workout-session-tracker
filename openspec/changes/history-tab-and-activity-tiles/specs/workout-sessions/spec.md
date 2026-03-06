## ADDED Requirements

### Requirement: Sessions are queryable by date for activity tile computation

The system SHALL expose a utility to retrieve sessions grouped or filtered by date, used by the activity tile component.

#### Scenario: Sessions grouped by calendar date

- **WHEN** the activity tile component requests session data
- **THEN** `getSessions()` returns all sessions and the caller can bucket them by the date portion of `completedAt`

#### Scenario: Sessions with no completedAt are excluded from tile data

- **WHEN** a session entry is missing `completedAt`
- **THEN** it is not counted in the activity tile grid
