## ADDED Requirements

### Requirement: AI-generated plans are flagged in storage

When a plan is created via the AI suggestion flow, the system SHALL persist `aiGenerated: true` on the `WorkoutPlan` object in local storage. Plans created manually SHALL NOT have this field set.

#### Scenario: AI plan saved with flag

- **WHEN** a user accepts an AI-suggested plan
- **THEN** the saved `WorkoutPlan` object has `aiGenerated: true`

#### Scenario: Manual plan has no flag

- **WHEN** a user creates a plan via the manual new-plan form
- **THEN** the saved `WorkoutPlan` object does NOT have `aiGenerated` set (field is absent)

### Requirement: Plan card shows AI icon for AI-generated plans

The `PlanCard` component SHALL display a small AI indicator icon (Sparkles) inline with the plan name when `plan.aiGenerated === true`. No indicator SHALL be shown for manually created plans.

#### Scenario: AI badge visible on AI-generated plan card

- **WHEN** the plan list is displayed
- **AND** a plan has `aiGenerated: true`
- **THEN** a Sparkles icon is rendered alongside the plan name on that card

#### Scenario: No badge on manually created plan card

- **WHEN** the plan list is displayed
- **AND** a plan does not have `aiGenerated: true`
- **THEN** no Sparkles icon is rendered on that card

#### Scenario: Existing stored plans without the field render normally

- **WHEN** a plan loaded from storage has no `aiGenerated` field (legacy plan)
- **THEN** it is treated as manually created and no icon is shown
