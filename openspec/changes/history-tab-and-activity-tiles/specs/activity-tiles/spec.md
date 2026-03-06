## ADDED Requirements

### Requirement: Activity tile grid is shown on the Home tab above action buttons

The system SHALL display a workout frequency heatmap grid on the Home (Start Workout) screen, above the action buttons, when the start screen is in its default state (not during an active session).

#### Scenario: Tile grid visible on home screen

- **WHEN** user is on the Home tab with no active session
- **THEN** the activity tile grid is displayed above the "Follow a Plan", "Free Session", and "Create Plan" buttons

#### Scenario: Tile grid hidden during active session

- **WHEN** the user has an active session in progress
- **THEN** the activity tile grid is not shown (session UI takes full screen)

### Requirement: Tile grid covers 16 weeks of activity

The system SHALL display a grid spanning the 16 most recent weeks (112 days total), organized in columns of 7 days (Sunday through Saturday), with the current week rightmost.

#### Scenario: Grid shows current week partial column

- **WHEN** today is a Wednesday
- **THEN** the rightmost column shows tiles for Sunday through Wednesday filled, and Thursday–Saturday are shown as future/empty

#### Scenario: Grid is horizontally scrollable if it overflows

- **WHEN** the screen width is too narrow to show all 16 columns
- **THEN** the tile grid container scrolls horizontally

### Requirement: Tiles are color-coded by workout count

Each day tile SHALL be colored based on the number of sessions completed on that day.

#### Scenario: Rest day tile

- **WHEN** a day has 0 completed sessions
- **THEN** the tile is shown in the rest color (dark, near-background)

#### Scenario: Active day tile intensity scales with session count

- **WHEN** a day has 1 session
- **THEN** the tile is shown in the low-intensity color
- **WHEN** a day has 2 sessions
- **THEN** the tile is shown in the medium-intensity color
- **WHEN** a day has 3 or more sessions
- **THEN** the tile is shown in the high-intensity (full accent) color

### Requirement: Tapping an active tile navigates to session detail

The system SHALL navigate to the session detail view when the user taps a tile that has at least one session on that day.

#### Scenario: Tap on day with one session

- **WHEN** user taps a tile with exactly one session
- **THEN** the app navigates to `/history/[id]` for that session

#### Scenario: Tap on day with multiple sessions

- **WHEN** user taps a tile with multiple sessions
- **THEN** the app navigates to the history screen filtered to that date, or to the most recent session for that day

#### Scenario: Tap on rest day tile is no-op

- **WHEN** user taps a tile with 0 sessions
- **THEN** nothing happens (no navigation)
