## ADDED Requirements

### Requirement: Plan exercises support a target RIR (Reps In Reserve)

`PlanExercise` SHALL support an optional `targetRir?: number` (integer 0–4) representing the target Reps In Reserve for all sets of that exercise. The RIR input SHALL only be visible for `sets-reps` and `sets-duration` exercise types. `targetRir` and `toFailure` are mutually exclusive: selecting one clears the other.

#### Scenario: Set target RIR on a plan exercise

- **WHEN** the user enters a RIR value (0–4) for a sets-reps or sets-duration exercise
- **THEN** the exercise is saved with `targetRir` set to that value and `toFailure` absent/false

#### Scenario: RIR input hidden for duration-only exercises

- **WHEN** the exercise type is `duration`
- **THEN** the RIR input is not rendered

#### Scenario: Selecting RIR clears to-failure flag

- **WHEN** the user sets a RIR value while `toFailure` is true
- **THEN** `toFailure` is cleared and `targetRir` is set

#### Scenario: RIR shown on exercise row in plan editor

- **WHEN** a plan exercise has `targetRir` set
- **THEN** the exercise row in the plan day editor shows the RIR value (e.g., "@2 RIR")

### Requirement: Plan exercises support a to-failure flag

`PlanExercise` SHALL support an optional `toFailure?: boolean` flag indicating the set(s) should be taken to muscular failure. Mutually exclusive with `targetRir`.

#### Scenario: Mark exercise as to failure

- **WHEN** the user enables the to-failure toggle for an exercise
- **THEN** the exercise is saved with `toFailure: true` and `targetRir` absent/undefined

#### Scenario: Selecting to-failure clears RIR

- **WHEN** the user enables to-failure while `targetRir` is set
- **THEN** `targetRir` is cleared

#### Scenario: Failure badge shown on exercise row

- **WHEN** a plan exercise has `toFailure: true`
- **THEN** the exercise row shows a "Failure" or "@ Failure" badge

### Requirement: Intensity targets flow into active sessions

When a session is started from a plan day, the `targetRir` and `toFailure` values from each `PlanExercise` SHALL be copied to the corresponding `Exercise` in the active session.

#### Scenario: Session exercise inherits RIR from plan

- **WHEN** a session is started from a plan day with exercises having `targetRir` set
- **THEN** the session exercises carry the same `targetRir` values

#### Scenario: Session exercise inherits to-failure from plan

- **WHEN** a session is started from a plan day with exercises having `toFailure: true`
- **THEN** the session exercises carry `toFailure: true`
