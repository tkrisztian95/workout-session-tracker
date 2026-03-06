## MODIFIED Requirements

### Requirement: Plan exercises use a 3-way type model

Each exercise in a plan day SHALL have a `type` of `'sets-reps'`, `'sets-duration'`, or `'duration'`, determining which metric fields are required.

- `sets-reps`: requires `sets` and `reps` (e.g., 3×10 squats)
- `sets-duration`: requires `sets` and `duration` (e.g., 3×30s plank)
- `duration`: requires only `duration`, no sets (e.g., 30 min run)

#### Scenario: Save sets-reps exercise

- **WHEN** user adds an exercise with type `sets-reps`, sets count, and reps count
- **THEN** the exercise is saved with `type: 'sets-reps'`, `sets`, and `reps`; duration is absent

#### Scenario: Save sets-duration exercise

- **WHEN** user adds an exercise with type `sets-duration`, sets count, and duration
- **THEN** the exercise is saved with `type: 'sets-duration'`, `sets`, and `duration`; reps is absent

#### Scenario: Save duration-only exercise

- **WHEN** user adds an exercise with type `duration` and a duration value
- **THEN** the exercise is saved with `type: 'duration'` and `duration`; sets and reps are absent

#### Scenario: Form validates required fields per type

- **WHEN** user selects a type and submits the form without filling in that type's required fields
- **THEN** the form displays a validation error and does not save the exercise

## ADDED Requirements

### Requirement: Plan has a shared exercises list

Each workout plan SHALL support a list of shared exercises that apply to every training day.

#### Scenario: Plan created without shared exercises

- **WHEN** user creates a new plan and adds no shared exercises
- **THEN** the plan's sharedExercises field is an empty array

#### Scenario: Add shared exercise to existing plan

- **WHEN** user adds an exercise to the plan's shared exercises section
- **THEN** the exercise appears in the plan's sharedExercises array with an auto-generated ID
