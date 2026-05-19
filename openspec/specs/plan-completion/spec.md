### Requirement: User can mark a plan as completed

The system SHALL allow users to mark an active workout plan as completed. A completed plan is read-only and cannot be used to start a new session.

#### Scenario: Mark active plan as completed

- **WHEN** user selects "Mark as Completed" on an active plan
- **THEN** the plan's status is set to `'completed'` in localStorage and the plan is grouped with the completed plans on the plans list

#### Scenario: Completion date is recorded and shown

- **WHEN** user marks an active plan as completed
- **THEN** the current date SHALL be stored as the plan's `completedAt` timestamp
- **AND** the completion date SHALL be shown on the plan's card

#### Scenario: Mark as completed from the plan detail view

- **WHEN** user opens an active plan's detail view
- **THEN** a "Mark as completed" control SHALL be available in the header

#### Scenario: Completed plan cannot start a session

- **WHEN** user views a completed plan
- **THEN** the "Start Session" button SHALL be absent or disabled

#### Scenario: Completed plan opens in a read-only review view

- **WHEN** user opens a completed plan from the plans list
- **THEN** the plan detail view SHALL open so the plan can be reviewed
- **AND** all editing affordances (name, schedule, exercises, add/remove controls, save) SHALL be absent or disabled
- **AND** a note SHALL explain that the plan must be reactivated to make changes

### Requirement: User can reactivate a completed plan

The system SHALL allow users to reactivate a completed plan back to active status.

#### Scenario: Reactivate completed plan

- **WHEN** user selects "Reactivate" on a completed plan
- **THEN** the plan's status is set to `'active'` in localStorage and the plan moves back to the active plans section
- **AND** the plan's `completedAt` timestamp SHALL be removed

#### Scenario: Reactivate from the plan detail view

- **WHEN** user opens a completed plan's detail view
- **THEN** a "Reactivate" control SHALL be available in the header

### Requirement: Plans list groups completed plans below active plans

The plans list SHALL display active plans first, followed by completed plans under a "Completed" separator label.

#### Scenario: Completed plans appear below active plans

- **WHEN** user navigates to the plans list and there are both active and completed plans
- **THEN** completed plans SHALL appear below the active plans, under a "Completed" separator label

#### Scenario: No completed separator when no plans are completed

- **WHEN** user navigates to the plans list and no plans have status `'completed'`
- **THEN** no "Completed" separator is displayed

### Requirement: Plans without a status field are treated as active

The system SHALL treat any `WorkoutPlan` lacking a `status` field as having `status: 'active'` at runtime, ensuring backwards compatibility with existing data.

#### Scenario: Legacy plan without status appears in active section

- **WHEN** a plan in localStorage has no `status` field
- **THEN** it appears in the active plans section of the plans list
