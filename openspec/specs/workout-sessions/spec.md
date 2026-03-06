## ADDED Requirements

### Requirement: Sessions are persisted to localStorage

The system SHALL save completed workout sessions to `localStorage` under the key `wst_sessions`.

#### Scenario: Completed session is saved

- **WHEN** user finishes and confirms a workout session
- **THEN** the session is appended to the `wst_sessions` array in localStorage with a timestamp and unique ID

#### Scenario: Discarded session is not saved

- **WHEN** user discards an active session
- **THEN** no session entry is written to localStorage

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

### Requirement: Active session persisted across page refreshes

The system SHALL persist the in-progress session to `localStorage` under the key `wst_active_session` so it survives accidental refreshes.

#### Scenario: Refresh restores active session

- **WHEN** user refreshes the browser during an active session
- **THEN** the session is restored from `wst_active_session` and the user can continue

#### Scenario: Active session cleared on finish or discard

- **WHEN** user finishes or discards a session
- **THEN** `wst_active_session` is removed from localStorage

### Requirement: Session optionally links to a plan day

A saved session MAY include `planId` and `planDayId` fields when it originated from a plan.

#### Scenario: Plan session includes plan references

- **WHEN** a session started from a plan day is saved
- **THEN** the session object includes `planId` (string) and `planDayId` (string) fields

#### Scenario: Free session omits plan references

- **WHEN** a free session is saved
- **THEN** the session object does not include `planId` or `planDayId` fields

### Requirement: Sessions are queryable by date for activity tile computation

The system SHALL expose a utility to retrieve sessions grouped or filtered by date, used by the activity tile component.

#### Scenario: Sessions grouped by calendar date

- **WHEN** the activity tile component requests session data
- **THEN** `getSessions()` returns all sessions and the caller can bucket them by the date portion of `completedAt`

#### Scenario: Sessions with no completedAt are excluded from tile data

- **WHEN** a session entry is missing `completedAt`
- **THEN** it is not counted in the activity tile grid
