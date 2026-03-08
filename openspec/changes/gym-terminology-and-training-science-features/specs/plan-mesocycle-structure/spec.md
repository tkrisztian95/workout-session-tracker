## ADDED Requirements

### Requirement: Plan can have a training phase (mesocycle goal)

`WorkoutPlan` SHALL support an optional `trainingPhase` field with values: `'hypertrophy' | 'strength' | 'power' | 'peaking' | 'deload'`. When set it represents the mesocycle goal and is displayed as a badge on the plan card and plan detail header.

#### Scenario: Set training phase in plan editor

- **WHEN** the user selects a training phase from the plan editor
- **THEN** the plan is saved with the selected `trainingPhase` value

#### Scenario: Training phase badge appears on plan card

- **WHEN** a plan with `trainingPhase` set is shown in the plan list
- **THEN** a badge showing the phase (e.g., "Hypertrophy", "Strength") is rendered on the card

#### Scenario: Plan without training phase shows no badge

- **WHEN** a plan has no `trainingPhase`
- **THEN** no phase badge is shown on the plan card

#### Scenario: Deload phase is visually distinct

- **WHEN** a plan has `trainingPhase: 'deload'`
- **THEN** the badge renders with a visually distinct style (e.g., muted/grey) to differentiate it from performance phases

### Requirement: Plan can have a split type label

`WorkoutPlan` SHALL support an optional `splitType` field: `'full-body' | 'upper-lower' | 'push-pull-legs' | 'bro-split' | 'custom'`. Shown on the plan card alongside training phase.

#### Scenario: Set split type in plan editor

- **WHEN** the user selects a split type
- **THEN** the plan is saved with the `splitType` value

#### Scenario: Split type shown on plan card

- **WHEN** a plan has `splitType` set
- **THEN** the plan card shows the split label (e.g., "PPL", "Upper/Lower", "Full Body")

#### Scenario: No split label shown when absent

- **WHEN** a plan has no `splitType`
- **THEN** no split label is rendered on the card

### Requirement: Plan can be flagged as a deload block

`WorkoutPlan` SHALL support an optional `isDeload?: boolean` flag independent of `trainingPhase`. When true, the plan card shows a "Deload" indicator.

#### Scenario: Deload flag shown on plan card

- **WHEN** a plan has `isDeload: true`
- **THEN** a deload indicator is shown on the plan card

#### Scenario: Mesocycle / split context row on plan card

- **WHEN** a plan has any combination of `splitType`, `trainingPhase`, or `scheduledWeeks` set
- **THEN** a single context row on the plan card displays those set values as compact labels (e.g., "PPL · Hypertrophy · 6 wks")
