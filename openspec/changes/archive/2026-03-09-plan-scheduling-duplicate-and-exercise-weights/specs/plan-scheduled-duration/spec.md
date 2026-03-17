## ADDED Requirements

### Requirement: Plan can have an optional scheduled duration in weeks

A `WorkoutPlan` SHALL support an optional `scheduledWeeks` field (positive integer, 1–52) representing the intended number of weeks to follow the plan. When set it is displayed on the plan card and in the plan editor. When absent the plan has no fixed time horizon.

#### Scenario: Set scheduled duration when creating a plan

- **WHEN** the user enters a number of weeks in the plan editor
- **THEN** the plan is saved with `scheduledWeeks` set to that value

#### Scenario: Plan saved without scheduled duration

- **WHEN** the user leaves the scheduled-weeks field empty
- **THEN** the plan is saved without a `scheduledWeeks` field (field is absent, not zero)

#### Scenario: Scheduled duration shown on plan card

- **WHEN** a plan with `scheduledWeeks` set is displayed in the plan list
- **THEN** the plan card shows the duration (e.g., "4 weeks")

#### Scenario: Scheduled duration not shown when absent

- **WHEN** a plan without `scheduledWeeks` is displayed in the plan list
- **THEN** no weeks label is rendered on the card

#### Scenario: Reject invalid week count

- **WHEN** the user enters a value outside 1–52 in the weeks field
- **THEN** the form SHALL display a validation error and not save the plan
