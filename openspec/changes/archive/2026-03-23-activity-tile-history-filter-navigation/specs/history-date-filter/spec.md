## ADDED Requirements

### Requirement: History page accepts a date filter via URL query param

The system SHALL read a `date` query parameter (`YYYY-MM-DD`) from the URL on the History page and, when present, filter the displayed session list to show only sessions completed on that date.

#### Scenario: History opened with date filter shows only that day's sessions

- **WHEN** the user navigates to `/history?date=2025-11-14`
- **THEN** only sessions whose `completedAt` date is `2025-11-14` are shown in the list
- **AND** sessions from all other dates are hidden

#### Scenario: History opened without date filter shows all sessions

- **WHEN** the user navigates to `/history` with no `date` query param
- **THEN** all completed sessions are shown, grouped by date, in reverse chronological order

### Requirement: Active date filter is indicated by a dismissible badge

The system SHALL display a visible filter badge when a date filter is active, showing the filtered date and providing a one-tap action to clear the filter.

#### Scenario: Filter badge is shown when date filter is active

- **WHEN** the History page is displayed with a `?date` query param
- **THEN** a filter badge is visible in the page header area showing the formatted date

#### Scenario: Tapping dismiss on the filter badge clears the filter

- **WHEN** the user taps the dismiss control on the filter badge
- **THEN** the app navigates to `/history` without a `date` param
- **AND** all sessions are shown

#### Scenario: No filter badge shown when no filter is active

- **WHEN** the History page is displayed without a `?date` query param
- **THEN** no filter badge is displayed

### Requirement: History page scrolls to the filtered date group on load

The system SHALL automatically scroll the session list so that the filtered date group is visible when the page loads with an active date filter.

#### Scenario: Page scrolls to filtered date on mount

- **WHEN** the History page mounts with `?date=2025-11-14`
- **AND** sessions exist for `2025-11-14`
- **THEN** the session group for `2025-11-14` is scrolled into view
