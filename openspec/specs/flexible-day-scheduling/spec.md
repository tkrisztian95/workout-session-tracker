## ADDED Requirements

### Requirement: Weekday picker is hidden by default on a training day
The system SHALL hide the weekday selection UI when a training day has no weekdays assigned, showing only a toggle to reveal it.

#### Scenario: New day has picker hidden
- **WHEN** user adds a new training day to a plan
- **THEN** the weekday picker SHALL NOT be visible and a "Schedule specific days" toggle is shown in its place

#### Scenario: Existing day with weekdays shows picker expanded
- **WHEN** user opens a training day that already has one or more weekdays assigned
- **THEN** the weekday picker SHALL be visible and expanded with the assigned days highlighted

### Requirement: User can reveal the weekday picker on demand
The system SHALL allow users to toggle the weekday picker visible on a training day.

#### Scenario: User expands the picker
- **WHEN** user activates the "Schedule specific days" toggle on a day with no weekdays
- **THEN** the weekday picker SHALL become visible and the user can select days

#### Scenario: User collapses the picker and clears weekdays
- **WHEN** user deactivates the "Schedule specific days" toggle on a day
- **THEN** the weekday picker SHALL be hidden and the day's weekdays SHALL be cleared to an empty list
