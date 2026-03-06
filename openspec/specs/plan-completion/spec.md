### Requirement: User can mark a plan as completed

The system SHALL allow users to mark an active workout plan as completed. A completed plan is read-only and cannot be used to start a new session.

#### Scenario: Mark active plan as completed

- **WHEN** user selects "Mark as Completed" on an active plan
- **THEN** the plan's status is set to `'completed'` in localStorage and the plan moves to the "Completed" section of the plans list

#### Scenario: Completed plan cannot start a session

- **WHEN** user views a completed plan
- **THEN** the "Start Session" button SHALL be absent or disabled

### Requirement: User can reactivate a completed plan

The system SHALL allow users to reactivate a completed plan back to active status.

#### Scenario: Reactivate completed plan

- **WHEN** user selects "Reactivate" on a completed plan
- **THEN** the plan's status is set to `'active'` in localStorage and the plan moves back to the active plans section

### Requirement: Plans list shows active and completed plans in separate sections

The plans list SHALL display active plans first, followed by a collapsible "Completed" section containing completed plans.

#### Scenario: Completed section is collapsed by default

- **WHEN** user navigates to the plans list and there are completed plans
- **THEN** the "Completed" section SHALL be collapsed by default

#### Scenario: User can expand completed section

- **WHEN** user taps the "Completed" section header
- **THEN** the completed plans list expands and completed plans are shown

#### Scenario: No completed section when no plans are completed

- **WHEN** user navigates to the plans list and no plans have status `'completed'`
- **THEN** no "Completed" section is displayed

### Requirement: Plans without a status field are treated as active

The system SHALL treat any `WorkoutPlan` lacking a `status` field as having `status: 'active'` at runtime, ensuring backwards compatibility with existing data.

#### Scenario: Legacy plan without status appears in active section

- **WHEN** a plan in localStorage has no `status` field
- **THEN** it appears in the active plans section of the plans list
