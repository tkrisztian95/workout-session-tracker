## MODIFIED Requirements

### Requirement: User can create a workout plan

The system SHALL allow users to create a named workout plan containing one or more training days. The create form SHALL provide a "Discard" button in the bottom action bar to exit without saving, and SHALL NOT include a back button in the page header.

#### Scenario: Create plan with a name

- **WHEN** user submits the "New Plan" form with a non-empty name
- **THEN** a new plan is saved to localStorage and appears in the plan list

#### Scenario: Reject empty plan name

- **WHEN** user submits the "New Plan" form with an empty or whitespace-only name
- **THEN** the form SHALL display a validation error and not save the plan

#### Scenario: Header has no back button on New Plan page

- **WHEN** the New Plan page is displayed
- **THEN** no back/arrow button SHALL appear in the page header

### Requirement: User can edit a plan

The system SHALL allow users to edit the name, training days, and exercises of an existing plan. The edit form SHALL provide a "Discard" button in the bottom action bar to exit without saving, and SHALL NOT include a back button in the page header.

#### Scenario: Rename a plan

- **WHEN** user changes the plan name and saves
- **THEN** the plan is updated in localStorage with the new name

#### Scenario: Edit a training day's exercises

- **WHEN** user adds, removes, or reorders exercises on a day and saves
- **THEN** the day's exercise list is updated in localStorage

#### Scenario: Header has no back button on Edit Plan page

- **WHEN** the Edit Plan page is displayed
- **THEN** no back/arrow button SHALL appear in the page header
