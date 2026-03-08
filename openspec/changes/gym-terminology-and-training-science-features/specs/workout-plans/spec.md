## ADDED Requirements

### Requirement: WorkoutPlan supports training phase and split type

`WorkoutPlan` SHALL support optional `trainingPhase?: 'hypertrophy' | 'strength' | 'power' | 'peaking' | 'deload'` and `splitType?: 'full-body' | 'upper-lower' | 'push-pull-legs' | 'bro-split' | 'custom'` fields. Both persist in local storage and are optional — existing plans without them remain valid.

#### Scenario: Fields persist through save and reload

- **WHEN** a plan is saved with `trainingPhase: 'strength'` and `splitType: 'upper-lower'`
- **AND** the plan list is reloaded
- **THEN** the loaded plan retains both values

#### Scenario: Plans without these fields remain valid

- **WHEN** a plan stored without `trainingPhase` or `splitType` is loaded
- **THEN** it loads with no errors and no phase/split badges are shown

### Requirement: WorkoutPlan supports isDeload flag

`WorkoutPlan` SHALL support an optional `isDeload?: boolean` field. When true the plan is treated as a deload block regardless of `trainingPhase`.

#### Scenario: isDeload persists

- **WHEN** a plan is saved with `isDeload: true`
- **THEN** on reload, `isDeload` is still true

### Requirement: PlanExercise supports targetRir and toFailure

`PlanExercise` SHALL support optional `targetRir?: number` (0–4) and `toFailure?: boolean`. Both are persisted with the plan exercise.

#### Scenario: targetRir and toFailure persist

- **WHEN** an exercise is saved with `targetRir: 2`
- **THEN** on plan reload the exercise retains `targetRir: 2` and no `toFailure`

#### Scenario: Exercises without intensity fields remain valid

- **WHEN** an existing exercise has neither `targetRir` nor `toFailure`
- **THEN** it loads and displays normally with no intensity badge
