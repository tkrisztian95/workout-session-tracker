## ADDED Requirements

### Requirement: Time range selector is displayed on the stats tab

The stats page SHALL display a horizontal selector with five time range options: **1 Day**, **This Week**, **This Month**, **90 Days**, and **All**. The selector SHALL be visible whenever the stats tab is open, including when the all-time session list is non-empty. The active selection SHALL be visually distinct from inactive options.

#### Scenario: Selector renders with default selection

- **WHEN** the user navigates to the stats tab
- **THEN** the time range selector is shown with "All" selected by default

#### Scenario: All five options are present

- **WHEN** the time range selector is rendered
- **THEN** it contains exactly five options: 1 Day, This Week, This Month, 90 Days, All

### Requirement: Selecting a time range filters all statistics

When the user selects a time range, all displayed statistics (total sessions, total volume, avg duration, avg weight, weekly frequency, volume chart, and progression table) SHALL update to reflect only sessions completed within that range.

#### Scenario: Selecting "1 Day" filters to today

- **WHEN** the user selects "1 Day"
- **THEN** only sessions with a completedAt timestamp from the start of the current calendar day (local time) to now are included in all statistics

#### Scenario: Selecting "This Week" filters to the current week

- **WHEN** the user selects "This Week"
- **THEN** only sessions completed from Monday 00:00 local time of the current week to now are included

#### Scenario: Selecting "This Month" filters to the current month

- **WHEN** the user selects "This Month"
- **THEN** only sessions completed from the 1st of the current calendar month 00:00 local time to now are included

#### Scenario: Selecting "90 Days" filters to the last 90 days

- **WHEN** the user selects "90 Days"
- **THEN** only sessions with a completedAt timestamp within the last 90 days from now are included

#### Scenario: Selecting "All" removes any date filter

- **WHEN** the user selects "All"
- **THEN** all completed sessions are included in statistics regardless of date

### Requirement: Zero-result range shows zeroed stats, not empty state

When the selected time range contains no completed sessions, the stats page SHALL display the stat cards with zero values rather than the all-time empty state illustration.

#### Scenario: No sessions in selected range

- **WHEN** the user selects a time range that contains no completed sessions
- **AND** there is at least one completed session in all-time history
- **THEN** stat cards are shown with zero values and the empty-state illustration is NOT shown

### Requirement: Time range selection persists within the page session

The selected time range SHALL be maintained in React component state and persist for the lifetime of the page without requiring localStorage.

#### Scenario: Range persists through in-page interactions

- **WHEN** the user selects "This Month"
- **AND** the page re-renders due to other interactions
- **THEN** the selected range remains "This Month"

#### Scenario: Range resets to "All" on fresh navigation

- **WHEN** the user navigates away from the stats tab and returns
- **THEN** the time range selector shows "All" as the default
