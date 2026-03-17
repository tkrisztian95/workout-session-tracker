## ADDED Requirements

### Requirement: Session Exercise supports optional weightKg field

The `Exercise` model used in active and completed sessions SHALL include an optional `weightKg?: number` field. This field is populated from the source `PlanExercise` at session-start time and is persisted with the completed session.

#### Scenario: weightKg is copied from plan exercise at session start

- **WHEN** a session is started from a plan day
- **AND** a plan exercise has `weightKg` set
- **THEN** the session exercise has the same `weightKg` value

#### Scenario: Session exercise without weight when plan has none

- **WHEN** a plan exercise has no `weightKg`
- **THEN** the session exercise also has no `weightKg` field

#### Scenario: Completed session retains weightKg

- **WHEN** a session is completed
- **THEN** the stored `WorkoutSession` exercises retain the `weightKg` values they had during the session
