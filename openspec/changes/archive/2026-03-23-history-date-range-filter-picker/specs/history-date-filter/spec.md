## MODIFIED Requirements

### Requirement: History page accepts a date filter via URL query param

The system SHALL read a `date` query parameter (`YYYY-MM-DD`) from the URL on the History page and, when present, scroll the session list so that the matching date group is visible. The `?date` param SHALL NOT filter out sessions from other dates.

#### Scenario: History opened with date param scrolls to that day

- **WHEN** the user navigates to `/history?date=2025-11-14`
- **THEN** all sessions are displayed (no filtering applied)
- **AND** the page scrolls so that the session group for `2025-11-14` is visible

#### Scenario: History opened without date filter shows all sessions

- **WHEN** the user navigates to `/history` with no `date` query param
- **THEN** all completed sessions are shown, grouped by date, in reverse chronological order

## REMOVED Requirements

### Requirement: Active date filter is indicated by a dismissible badge

**Reason**: The `?date` param is now scroll-only navigation from activity tiles, not a filter. A separate date range filter with its own UI replaces the filtering functionality.
**Migration**: Use the date range picker (calendar button in header) to filter sessions by date.

### Requirement: History page scrolls to the filtered date group on load

**Reason**: Requirement renamed and scope changed — now covered under the modified requirement above ("History page accepts a date filter via URL query param").
**Migration**: No action needed; scrolling still occurs via the modified requirement.
