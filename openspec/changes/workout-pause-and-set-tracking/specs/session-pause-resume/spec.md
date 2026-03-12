## ADDED Requirements

### Requirement: User can pause an active session

The system SHALL allow the user to pause the active workout session. While paused, the session timer SHALL stop accumulating elapsed time.

#### Scenario: Pause the session

- **WHEN** the user taps the pause button during an active session
- **THEN** the session is marked as paused, the timer stops incrementing, and the UI shows a paused state

#### Scenario: Paused state persists across page refresh

- **WHEN** the user refreshes the browser while the session is paused
- **THEN** the session remains paused and the timer does not resume

#### Scenario: Paused state is visually indicated

- **WHEN** the session is paused
- **THEN** the timer display and/or session header shows a clear visual indicator that the session is paused (e.g., a pause icon or "Paused" label)

### Requirement: User can resume a paused session

The system SHALL allow the user to resume a paused session. The timer SHALL continue from where it left off, excluding time spent paused.

#### Scenario: Resume the session

- **WHEN** the user taps the resume button while the session is paused
- **THEN** the session is no longer paused and the timer resumes counting from the pre-pause elapsed time

#### Scenario: Accumulated pause time is excluded from total duration

- **WHEN** the session is completed after one or more pauses
- **THEN** the total elapsed time shown in the completion summary does NOT include time spent in paused state

#### Scenario: Multiple pause/resume cycles

- **WHEN** the user pauses and resumes the session multiple times
- **THEN** only the active (non-paused) time is counted toward the session duration
