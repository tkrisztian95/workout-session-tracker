## ADDED Requirements

### Requirement: Statistics page is accessible from bottom navigation

The system SHALL provide a dedicated Statistics page reachable via a Stats tab in the bottom navigation bar.

#### Scenario: Stats tab visible in navigation

- **WHEN** the user is on any screen with the bottom navigation visible
- **THEN** a Stats tab (BarChart icon, labelled with the locale's stats label) is shown in the bottom nav

#### Scenario: Navigating to stats page

- **WHEN** the user taps the Stats tab
- **THEN** the app navigates to `/stats`
- **THEN** the Stats page is displayed with summary cards and a chart

---

### Requirement: Stats page displays summary metric cards

The system SHALL display a set of summary stat cards at the top of the Statistics page, each showing an aggregate metric computed from the user's completed workout sessions.

#### Scenario: Total sessions card

- **WHEN** the user views the Statistics page
- **THEN** a card labelled with the locale's total sessions label shows the count of all completed workout sessions

#### Scenario: Total volume card

- **WHEN** the user views the Statistics page
- **THEN** a card labelled with the locale's total volume label shows the sum of (weight × reps) across all logged sets in all sessions, displayed in kg

#### Scenario: Average session duration card

- **WHEN** the user views the Statistics page
- **THEN** a card labelled with the locale's avg duration label shows the mean session duration in minutes, computed from `completedAt − startedAt` (excluding paused time) across all completed sessions

#### Scenario: Average weight per set card

- **WHEN** the user views the Statistics page
- **THEN** a card labelled with the locale's avg weight label shows the mean weight across all logged sets that have a weight value, in kg

#### Scenario: Weekly frequency card

- **WHEN** the user views the Statistics page
- **THEN** a card labelled with the locale's weekly frequency label shows the average number of sessions per week computed over the period from the first session to the current date

#### Scenario: No sessions — zero state

- **WHEN** the user has no completed sessions
- **THEN** all summary cards show "—" or "0" as their value
- **THEN** a descriptive empty-state message is shown prompting the user to complete a session

---

### Requirement: Stats page displays a weekly volume chart

The system SHALL display a bar or line chart showing total lifted volume (weight × reps) grouped by calendar week, covering the last 12 weeks.

#### Scenario: Chart renders with session data

- **WHEN** the user has at least one completed session with logged sets containing weight and reps
- **THEN** the chart displays bars or a line for each of the last 12 calendar weeks
- **THEN** weeks with no sessions show a bar or point at zero
- **THEN** the x-axis labels show abbreviated week identifiers (e.g., "W12" or "Mar 10")
- **THEN** the y-axis shows volume in kg

#### Scenario: Chart respects app theme

- **WHEN** the user has selected the dark or light theme
- **THEN** the chart colors, axis labels, and grid lines use theme-appropriate colors

#### Scenario: No volume data — chart empty state

- **WHEN** the user has sessions but none have logged sets with weight/reps
- **THEN** the chart area shows an empty-state message indicating no volume data is available

#### Scenario: Chart is responsive

- **WHEN** the statistics page is rendered on a narrow viewport (< 400 px wide)
- **THEN** the chart fills the available width without horizontal scrolling

---

### Requirement: Stats page displays an exercise weight progression table

The system SHALL display a table below the chart listing every exercise that has at least one logged set with a weight value. For each exercise the table SHALL show the weight logged in each of its last sessions and a trend indicator.

#### Scenario: Table shows one row per weighted exercise

- **WHEN** the user views the Statistics page
- **THEN** the progression table contains one row for each unique exercise name that has ever been logged with a weight value across all completed sessions
- **THEN** rows are sorted alphabetically by exercise name

#### Scenario: Each row shows last logged weights per session

- **WHEN** a row is displayed for an exercise
- **THEN** the row shows the mean weight logged for that exercise in each of its most recent sessions (up to the last 5 sessions in which it appeared), in chronological order
- **THEN** sessions where the exercise was not performed are omitted from the row

#### Scenario: Trend arrow — improving

- **WHEN** the most recent session's mean weight for an exercise is higher than the previous session's mean weight
- **THEN** an upward arrow indicator (e.g., ↑ or TrendingUp icon) is shown in the trend column, styled in the success/green theme color

#### Scenario: Trend arrow — declining

- **WHEN** the most recent session's mean weight for an exercise is lower than the previous session's mean weight
- **THEN** a downward arrow indicator (e.g., ↓ or TrendingDown icon) is shown in the trend column, styled in the warning/red theme color

#### Scenario: Trend arrow — stable

- **WHEN** the most recent session's mean weight equals the previous session's mean weight, or the exercise has only appeared in one session
- **THEN** a flat/neutral arrow indicator (e.g., → or Minus icon) is shown in the trend column, styled in the muted theme color

#### Scenario: No weighted exercises — table hidden

- **WHEN** the user has no completed sessions with weight-bearing logged sets
- **THEN** the exercise progression table is not shown

---

### Requirement: Stat computations exclude in-progress sessions

The system SHALL compute all statistics only from sessions that have a `completedAt` timestamp (i.e., fully finished sessions).

#### Scenario: Active session excluded from stats

- **WHEN** a session is currently in progress (has no `completedAt`)
- **THEN** it does NOT contribute to any stat card value or chart data point
