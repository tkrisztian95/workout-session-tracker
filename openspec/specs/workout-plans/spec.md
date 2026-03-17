## ADDED Requirements

### Requirement: WorkoutPlan supports optional scheduledWeeks field

The `WorkoutPlan` data model SHALL include an optional `scheduledWeeks?: number` field (positive integer 1–52). When absent the plan has no fixed time horizon. The field SHALL be persisted in local storage and survive round-trips through save/load.

#### Scenario: scheduledWeeks persists through save and reload

- **WHEN** a plan with `scheduledWeeks: 6` is saved
- **AND** the plan list is reloaded
- **THEN** the loaded plan has `scheduledWeeks: 6`

#### Scenario: Plans without scheduledWeeks remain valid

- **WHEN** a plan stored without `scheduledWeeks` is loaded
- **THEN** the plan loads successfully with no errors and no weeks label is shown

### Requirement: PlanExercise supports optional weightKg field

`PlanExercise` SHALL include an optional `weightKg?: number` field representing target load in kg. When absent the exercise has no prescribed weight.

#### Scenario: weightKg persists on PlanExercise

- **WHEN** an exercise with `weightKg: 80` is saved to a plan
- **AND** the plan is reloaded
- **THEN** the exercise retains `weightKg: 80`

#### Scenario: PlanExercise without weightKg is valid

- **WHEN** an exercise is saved without a weight
- **THEN** it loads correctly with no `weightKg` field
