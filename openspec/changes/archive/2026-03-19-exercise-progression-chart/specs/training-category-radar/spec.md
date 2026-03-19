## ADDED Requirements

### Requirement: Stats page displays a training category radar chart

The system SHALL display a radar chart on the Statistics page showing the distribution of completed sessions across exercise categories, giving the user a visual overview of training balance.

#### Scenario: Radar chart renders with categorised session data

- **WHEN** the user has at least 2 completed sessions containing exercises with distinct category values
- **THEN** a radar chart is displayed on the Stats page between the summary stat cards and the weekly volume chart
- **THEN** each axis of the radar corresponds to one exercise category
- **THEN** the value on each axis represents the number of completed sessions that contained at least one exercise of that category
- **THEN** exercises without a category value are grouped under a single "Other" axis

#### Scenario: Radar chart hidden when all exercises share one category

- **WHEN** all exercises across all completed sessions resolve to the same single category (or all are "Other")
- **THEN** the radar chart section is NOT shown

#### Scenario: Radar chart hidden when fewer than 2 completed sessions

- **WHEN** the user has fewer than 2 completed sessions
- **THEN** the radar chart section is NOT shown

#### Scenario: Radar chart respects the active time range filter

- **WHEN** the user selects a time range from the range selector
- **THEN** the radar chart recomputes using only sessions within that time range

#### Scenario: Radar chart uses theme-appropriate colors

- **WHEN** the app is in dark or light theme
- **THEN** the radar chart colors use theme-appropriate values consistent with the rest of the stats page charts
