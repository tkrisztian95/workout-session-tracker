## ADDED Requirements

### Requirement: History page accepts a date filter via URL query param

The system SHALL read a `date` query parameter (`YYYY-MM-DD`) from the URL on the History page and, when present, scroll the session list so that the matching date group is visible. The `?date` param SHALL NOT filter out sessions from other dates.

#### Scenario: History opened with date param scrolls to that day

- **WHEN** the user navigates to `/history?date=2025-11-14`
- **THEN** all sessions are displayed (no filtering applied)
- **AND** the page scrolls so that the session group for `2025-11-14` is visible

#### Scenario: History opened without date filter shows all sessions

- **WHEN** the user navigates to `/history` with no `date` query param
- **THEN** all completed sessions are shown, grouped by date, in reverse chronological order
