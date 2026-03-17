## MODIFIED Requirements

### Requirement: A live timer is displayed during an active session

The system SHALL show an elapsed-time timer on the active session screen, counting up only the active (non-paused) time since session start.

#### Scenario: Timer starts on session begin

- **WHEN** user starts a session (plan-based or free)
- **THEN** a timer appears on the session screen counting up in HH:MM:SS or MM:SS format

#### Scenario: Timer persists across page refresh

- **WHEN** user refreshes the browser during an active session
- **THEN** the timer resumes from the correct active elapsed time, accounting for any time previously spent paused

#### Scenario: Timer stops on session end

- **WHEN** user finishes or discards a session
- **THEN** the timer stops and is no longer visible

#### Scenario: Timer stops while session is paused

- **WHEN** user pauses the session
- **THEN** the timer stops incrementing and displays the elapsed time at the moment of pause

## ADDED Requirements

### Requirement: Exercise completion is recorded with a timestamp

The system SHALL record a `completedAt` timestamp on an exercise at the moment the user marks it as completed, allowing the order of exercise completion to be determined.

#### Scenario: Timestamp set on completion

- **WHEN** the user marks an exercise as completed
- **THEN** the exercise's `completedAt` field is set to the current date/time

#### Scenario: Timestamp cleared on undo

- **WHEN** the user un-completes a previously completed exercise
- **THEN** the exercise's `completedAt` field is cleared (set to undefined)

#### Scenario: Completion order is derivable from timestamps

- **WHEN** multiple exercises are completed in a session
- **THEN** the `completedAt` timestamps allow determining the chronological order of completion
