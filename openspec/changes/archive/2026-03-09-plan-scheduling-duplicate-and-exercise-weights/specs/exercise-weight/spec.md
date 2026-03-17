## ADDED Requirements

### Requirement: Plan exercises support an optional target weight

`PlanExercise` SHALL support an optional `weightKg?: number` field representing the target load in kilograms. The weight input SHALL be visible only for exercise types `sets-reps` and `sets-duration`; it SHALL be hidden for `duration`-only exercises.

#### Scenario: Add exercise with weight

- **WHEN** the user enters a weight value for a `sets-reps` or `sets-duration` exercise in the plan exercise form
- **THEN** the exercise is saved with `weightKg` set to the entered value

#### Scenario: Weight field hidden for duration-only exercises

- **WHEN** the user selects `duration` as the exercise type
- **THEN** the weight input is not rendered

#### Scenario: Exercise without weight is valid

- **WHEN** the user submits the exercise form without entering a weight
- **THEN** the exercise is saved without a `weightKg` field

#### Scenario: Weight displayed in plan exercise list

- **WHEN** an exercise with `weightKg` is displayed in the plan day editor
- **THEN** the weight is shown alongside the sets/reps detail (e.g., "3×10 · 80 kg")

### Requirement: Target weight flows into active sessions

When a session is started from a plan day, each cloned `Exercise` in the session SHALL inherit the `weightKg` from its source `PlanExercise`.

#### Scenario: Session exercise carries target weight from plan

- **WHEN** a session is started from a plan day that contains an exercise with `weightKg`
- **THEN** the corresponding session exercise has the same `weightKg` value

#### Scenario: Session exercise without weight when plan has none

- **WHEN** a plan exercise has no `weightKg`
- **THEN** the session exercise also has no `weightKg` field
