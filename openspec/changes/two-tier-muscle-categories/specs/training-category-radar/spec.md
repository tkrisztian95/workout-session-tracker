## MODIFIED Requirements

### Requirement: Stats page displays a training muscle radar chart with a group / muscle view toggle

The system SHALL display a radar chart on the Statistics page showing the distribution of completed sessions across the user's training, giving a visual overview of balance. The chart SHALL support two views — a **Groups** view with up to four axes (Upper, Lower, Core, Cardio) and a **Muscles** view with up to twelve canonical muscle axes plus an `Other` axis for exercises without a muscle assignment. A toggle above the chart SHALL let the user switch between the two views.

#### Scenario: Groups view is the default

- **WHEN** the radar chart section first renders
- **THEN** the **Groups** view SHALL be active by default
- **AND** the four group axes SHALL be labelled via `muscle_group_labels`

#### Scenario: User toggles to muscles view

- **WHEN** the user activates the **Muscles** toggle
- **THEN** the radar SHALL re-render with up to thirteen axes (twelve canonical muscles plus an `Other` axis)
- **AND** each axis SHALL be labelled via `muscle_labels`

#### Scenario: Axis value counts sessions, not exercises

- **WHEN** a session contains multiple exercises that resolve to the same axis (e.g., two exercises both tagged `chest`)
- **THEN** the axis value for that session SHALL increment by 1, not 2
- **AND** the rule applies uniformly to both the Groups and the Muscles view

#### Scenario: Exercises without a muscle grouped as Other

- **WHEN** a completed exercise has no `muscle` field
- **THEN** in the Muscles view it SHALL contribute to a single `Other` axis
- **AND** in the Groups view it SHALL contribute to a single `Other` axis (it does NOT roll up into any of Upper / Lower / Core / Cardio)

#### Scenario: Radar hidden when fewer than 2 axes have data in the active view

- **WHEN** the active view (Groups or Muscles) would render with only one axis carrying a non-zero value
- **THEN** the radar chart section SHALL NOT be shown for that view
- **AND** the toggle MAY still be shown if the other view qualifies, so the user can switch to it

#### Scenario: Radar hidden when fewer than 2 completed sessions

- **WHEN** the user has fewer than 2 completed sessions in the active time range
- **THEN** the radar chart section SHALL NOT be shown regardless of the view

#### Scenario: Radar respects the active time range filter

- **WHEN** the user selects a time range from the range selector
- **THEN** the radar SHALL recompute both view distributions using only sessions within that time range

#### Scenario: Radar uses theme-appropriate colors

- **WHEN** the app is in dark or light theme
- **THEN** the radar chart colors SHALL use theme-appropriate values consistent with the rest of the stats page charts in both views
