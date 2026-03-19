### Requirement: Exercise progression rows are collapsible to reveal a weight chart

Each row in the exercise progression table SHALL be interactive. Tapping a row SHALL toggle a collapsible chart section beneath it that visualises the exercise's weight history over sessions.

#### Scenario: Tapping a row expands the chart

- **WHEN** the user taps an exercise row in the progression table
- **THEN** a line chart appears below that row showing the exercise's mean weight per session (up to the last 5 sessions) on the y-axis and session date labels on the x-axis

#### Scenario: Tapping an expanded row collapses it

- **WHEN** the user taps a row that is already expanded
- **THEN** the chart section collapses and is no longer visible

#### Scenario: Only one row is expanded at a time

- **WHEN** the user taps a row while a different row is already expanded
- **THEN** the previously expanded row collapses
- **THEN** the tapped row expands to show its chart

#### Scenario: Chart shows date-labelled data points

- **WHEN** the progression chart is visible for an exercise
- **THEN** each data point corresponds to a session in which the exercise was performed
- **THEN** the x-axis shows the session date formatted as abbreviated month and day (e.g. "Mar 5")
- **THEN** the y-axis shows weight in kg

#### Scenario: Chart uses theme-appropriate colors

- **WHEN** the app is in dark or light theme
- **THEN** the line chart colors, axis labels, and grid lines use theme-appropriate values consistent with the rest of the stats page charts
