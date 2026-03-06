## MODIFIED Requirements

### Requirement: Active session exercises track completion and dismissal state

The system SHALL track per-exercise `completed` and `dismissed` boolean state within the active session.

#### Scenario: Exercise starts as incomplete and not dismissed

- **WHEN** a session is created with exercises
- **THEN** all exercises have `completed: false` and `dismissed: false` by default

#### Scenario: Completed state persisted across refresh

- **WHEN** user marks an exercise as completed and then refreshes the page
- **THEN** the exercise is still shown as completed after the session is restored from localStorage

#### Scenario: Dismissed state persisted across refresh

- **WHEN** user dismisses an exercise and then refreshes the page
- **THEN** the exercise remains dismissed after the session is restored from localStorage

## ADDED Requirements

### Requirement: Session exercises use the 3-way type model

Each in-session exercise SHALL carry a `type` of `'sets-reps'`, `'sets-duration'`, or `'duration'` with the corresponding required fields.

#### Scenario: Session exercise with sets and reps

- **WHEN** an exercise of type `sets-reps` is part of a session
- **THEN** it is stored and displayed with sets and reps; no duration field

#### Scenario: Session exercise with sets and duration

- **WHEN** an exercise of type `sets-duration` is part of a session
- **THEN** it is stored and displayed with sets and duration; no reps field

#### Scenario: Session exercise with duration only

- **WHEN** an exercise of type `duration` is part of a session
- **THEN** it is stored and displayed with duration only; no sets or reps fields

### Requirement: Active session records start time for timer calculation

The system SHALL use `startedAt` on the active session to compute elapsed time for display.

#### Scenario: Elapsed time calculated from startedAt

- **WHEN** the session screen is displayed
- **THEN** the elapsed time is computed as current time minus `startedAt`
