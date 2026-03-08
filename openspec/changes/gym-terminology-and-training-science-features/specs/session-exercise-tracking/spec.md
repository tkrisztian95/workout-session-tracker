## ADDED Requirements

### Requirement: Session Exercise supports targetRir and toFailure

The `Exercise` model used in active and completed sessions SHALL include optional `targetRir?: number` and `toFailure?: boolean` fields, populated from the source `PlanExercise` at session-start time.

#### Scenario: Session exercise inherits intensity targets from plan

- **WHEN** a session is started from a plan day where an exercise has `targetRir: 1`
- **THEN** the corresponding session exercise has `targetRir: 1`

#### Scenario: Session exercise inherits to-failure from plan

- **WHEN** a plan exercise has `toFailure: true`
- **THEN** the session exercise has `toFailure: true`

#### Scenario: Session exercise without intensity targets when plan has none

- **WHEN** a plan exercise has neither `targetRir` nor `toFailure`
- **THEN** the cloned session exercise also has neither field

#### Scenario: Completed session retains intensity targets

- **WHEN** a session is completed
- **THEN** the stored session exercises retain the `targetRir` and `toFailure` values they had during the session
