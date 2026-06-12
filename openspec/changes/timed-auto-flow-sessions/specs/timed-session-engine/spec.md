## ADDED Requirements

### Requirement: Timed session is driven by a mode-aware interval engine

The system SHALL provide a timed-session engine that drives an active session through a sequence of timed phases without requiring the user to manually advance each set. The engine SHALL support four modes: `tabata`, `amrap`, `emom`, and `for-time`. The engine SHALL expose the current phase (`work`, `rest`, `round-rest`, or `done`), the current round/interval index, and the time remaining or elapsed for the current phase.

#### Scenario: Engine starts in the first work phase

- **WHEN** a timed session begins
- **THEN** the engine enters its first `work` phase with the configured exercise(s) for round 1 and begins counting

#### Scenario: Engine reports current phase and round to the UI

- **WHEN** a timed session is running
- **THEN** the engine exposes the active mode, current phase, current round/interval index, total rounds, and the phase clock value for display

#### Scenario: Engine reaches a terminal done state

- **WHEN** the last scheduled phase completes
- **THEN** the engine transitions to the `done` phase and signals the session is ready to finish

### Requirement: The session exercise list is the circuit

The system SHALL treat a timed session's ordered `exercises` array as a circuit. One round SHALL be one full pass through the circuit, and `rounds` SHALL count passes. For multi-exercise modes the engine SHALL walk the circuit exercise-by-exercise (Tabata: each `work` phase is the next circuit exercise; EMOM: each interval is the next circuit exercise; AMRAP: a round tap means one full pass completed). A single-exercise circuit is a length-1 case with no special handling. Auto-logged sets SHALL target the circuit exercise active for the current phase.

#### Scenario: One round is a full pass through the circuit

- **WHEN** a timed session has a circuit of N exercises and `rounds` configured
- **THEN** each round advances through all N exercises in order before the round counter increments

#### Scenario: Engine assigns the active circuit exercise per phase

- **WHEN** a work phase begins in a multi-exercise circuit
- **THEN** the engine exposes the specific circuit exercise that phase belongs to

#### Scenario: Auto-log targets the active circuit exercise

- **WHEN** a work phase completes for a circuit exercise
- **THEN** the auto-logged set is appended to that exercise, distributing sets across the circuit

#### Scenario: Single-exercise circuit needs no special case

- **WHEN** a timed session has exactly one exercise
- **THEN** every work phase targets that exercise and the engine behaves as a length-1 circuit

### Requirement: Tabata / interval mode cycles work and rest for a fixed number of rounds

In `tabata` mode the engine SHALL repeat a `work` phase of the configured work duration followed by a `rest` phase of the configured rest duration, for the configured number of rounds, then transition to `done`. The final round SHALL NOT be followed by a trailing rest phase.

#### Scenario: Work auto-advances to rest

- **WHEN** a `work` phase reaches zero in tabata mode
- **THEN** the engine auto-advances to the `rest` phase and starts its countdown

#### Scenario: Rest auto-advances to the next round's work

- **WHEN** a `rest` phase reaches zero and rounds remain
- **THEN** the engine increments the round index and starts the next `work` phase

#### Scenario: Last round ends without trailing rest

- **WHEN** the final `work` phase of the last round reaches zero
- **THEN** the engine transitions directly to `done` with no further rest phase

### Requirement: AMRAP mode runs a single countdown while the user counts rounds

In `amrap` mode the engine SHALL run a single count-down clock of the configured total duration. The user SHALL be able to tap to increment a completed-round counter while the clock runs. When the clock reaches zero the engine SHALL transition to `done` and record the number of rounds tapped.

#### Scenario: Single clock counts down for the whole session

- **WHEN** an AMRAP session starts with a configured duration
- **THEN** the engine counts down from that duration as one continuous phase

#### Scenario: User taps to record a completed round

- **WHEN** the user taps the round control during an AMRAP session
- **THEN** the completed-round count increments by one and is reflected in the live UI

#### Scenario: Clock reaching zero ends the session

- **WHEN** the AMRAP clock reaches zero
- **THEN** the engine transitions to `done` and the recorded round count is preserved for logging

### Requirement: EMOM mode starts the next interval on each minute boundary

In `emom` mode the engine SHALL start a new interval every configured period (default 60s) for the configured number of intervals. Work that finishes before the period elapses SHALL leave the remainder of the period as rest. When all intervals complete the engine SHALL transition to `done`.

#### Scenario: New interval starts on the period boundary

- **WHEN** an EMOM period elapses and intervals remain
- **THEN** the engine starts the next interval at the boundary with its assigned exercise/round

#### Scenario: Early finish leaves remaining time as rest

- **WHEN** the user marks the interval's work done before the period elapses
- **THEN** the remaining time in the period is shown as rest until the next boundary

#### Scenario: All intervals complete ends the session

- **WHEN** the last EMOM interval's period elapses
- **THEN** the engine transitions to `done`

### Requirement: For Time mode counts up until the user stops or the cap is reached

In `for-time` mode the engine SHALL run a single count-**up** stopwatch over a fixed amount of work. The user SHALL tap Done to stop the clock; the engine SHALL record the total elapsed time and transition to `done`. When an optional `capSec` is configured, the engine SHALL auto-transition to `done` at the cap even if the user has not tapped Done. When `capSec` is unset or zero the count-up is uncapped.

#### Scenario: Clock counts up from zero

- **WHEN** a For Time session starts
- **THEN** the engine counts up from zero in a single continuous phase

#### Scenario: User taps Done to stop the clock

- **WHEN** the user taps Done during a For Time session
- **THEN** the engine stops the clock, records the total elapsed time, and transitions to `done`

#### Scenario: Hard cap ends the session automatically

- **WHEN** a For Time session has a `capSec` configured and the count-up reaches the cap before the user taps Done
- **THEN** the engine auto-transitions to `done` and records the elapsed time as the cap

#### Scenario: Uncapped when no cap is set

- **WHEN** a For Time session has no `capSec` (or zero)
- **THEN** the engine counts up indefinitely until the user taps Done

### Requirement: Phase completion auto-logs a set

When a `work` phase completes (auto-advance in tabata/emom, or an AMRAP round tap, or For Time finish), the system SHALL auto-write a `LoggedSet` for the active exercise mapping the round to a set and the elapsed work time to `seconds`, without requiring the user to open the manual logging form.

#### Scenario: Tabata work phase auto-logs a set

- **WHEN** a tabata `work` phase completes
- **THEN** a `LoggedSet` is appended to the active exercise with `seconds` set to the work duration and `loggedAt` set to the completion time

#### Scenario: AMRAP round tap auto-logs a set

- **WHEN** the user taps to record an AMRAP round
- **THEN** a `LoggedSet` representing that round is recorded for the circuit

#### Scenario: User can edit an auto-logged set after the fact

- **WHEN** an auto-logged set has been written
- **THEN** the user can adjust its reps/weight using the existing set-editing flow

### Requirement: Timed sessions honor pause and resume

The timed engine SHALL integrate with the existing session pause/resume so that pausing freezes the active phase clock and resuming continues from the same phase and remaining time, consistent with how `totalPausedMs` is tracked for the overall session.

#### Scenario: Pause freezes the phase clock

- **WHEN** the user pauses a running timed session
- **THEN** the current phase clock stops and does not advance to the next phase

#### Scenario: Resume continues the same phase

- **WHEN** the user resumes a paused timed session
- **THEN** the engine continues the previously active phase from its remaining time

#### Scenario: Phase timing survives a page refresh

- **WHEN** the user refreshes the browser during a timed session
- **THEN** the session and its engine state are restored so the correct phase and remaining time resume

### Requirement: Phase transitions emit opt-in cues

On each phase transition the system SHALL provide a visual transition cue and SHALL provide an audible chime and/or device vibration when the user has opted in via the cue setting added by this change (see the `profile-settings` capability). The cue setting SHALL be a single shared opt-in that issue #49's rest timer reuses rather than a parallel setting.

#### Scenario: Visual cue on every transition

- **WHEN** the engine transitions between phases (e.g. work→rest)
- **THEN** the live UI shows a visual transition cue (e.g. color/label change)

#### Scenario: Audible/vibration cue only when opted in

- **WHEN** a phase transition occurs and the user has enabled audible/vibration cues
- **THEN** the configured chime and/or vibration fires; otherwise no sound or vibration is produced
