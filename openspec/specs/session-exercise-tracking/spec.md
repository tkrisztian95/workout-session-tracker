## ADDED Requirements

### Requirement: Exercise cards are tickable during a session

The system SHALL allow users to mark individual exercises as completed during an active session by tapping/clicking the exercise card.

#### Scenario: Mark exercise as completed

- **WHEN** user taps the tick/checkmark on an exercise card during an active session
- **THEN** the exercise is marked as completed and the card displays a visually distinct completed state

#### Scenario: Undo completion

- **WHEN** user taps the completed exercise card again
- **THEN** the exercise is returned to its incomplete state

#### Scenario: Completed exercises are visually separated from remaining ones

- **WHEN** some exercises are marked completed during a session
- **THEN** completed exercises are visually grouped or styled differently from remaining exercises

### Requirement: Exercises can be dismissed from the current session

The system SHALL allow users to dismiss (omit) an exercise from the current session without removing it from the plan.

#### Scenario: Dismiss an exercise

- **WHEN** user selects the dismiss/omit action on an exercise card
- **THEN** the exercise is marked as dismissed and visually de-emphasized or hidden from the active list

#### Scenario: Dismissed exercises do not count toward completion

- **WHEN** an exercise is dismissed
- **THEN** it is excluded from stats (sets completed, exercises done) for that session

#### Scenario: Dismissed exercises are not permanently removed

- **WHEN** the current session ends
- **THEN** the plan definition is unchanged and the dismissed exercise will appear normally in future sessions

### Requirement: A live timer is displayed during an active session

The system SHALL show an elapsed-time timer on the active session screen, counting up from session start.

#### Scenario: Timer starts on session begin

- **WHEN** user starts a session (plan-based or free)
- **THEN** a timer appears on the session screen counting up in HH:MM:SS or MM:SS format

#### Scenario: Timer persists across page refresh

- **WHEN** user refreshes the browser during an active session
- **THEN** the timer resumes from the correct elapsed time based on `startedAt`

#### Scenario: Timer stops on session end

- **WHEN** user finishes or discards a session
- **THEN** the timer stops and is no longer visible
