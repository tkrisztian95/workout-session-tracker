## ADDED Requirements

### Requirement: WorkoutPlan supports optional aiGenerated field

The `WorkoutPlan` data model SHALL include an optional `aiGenerated?: boolean` field. When absent or `false`, the plan is treated as manually created. This field SHALL be persisted in local storage as part of the plan object.

#### Scenario: aiGenerated field persists through save and reload

- **WHEN** a plan with `aiGenerated: true` is saved to local storage
- **AND** the plan list is reloaded
- **THEN** the loaded plan retains `aiGenerated: true`

#### Scenario: Plans without aiGenerated field remain valid

- **WHEN** a plan stored without the `aiGenerated` field is loaded
- **THEN** the plan loads successfully with no errors and is treated as manually created
