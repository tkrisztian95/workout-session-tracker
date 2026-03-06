## MODIFIED Requirements

### Requirement: User can view the plan list

The system SHALL display all saved workout plans in a list view. Active plans SHALL appear in the main list. Completed plans SHALL appear in a separate collapsible "Completed" section below the active list.

#### Scenario: Plans list shows all active plans

- **WHEN** user navigates to the plans list
- **THEN** all plans with status `'active'` (or no status) are displayed with their name and number of training days

#### Scenario: Empty state when no active plans exist

- **WHEN** user navigates to the plans list and no active plans are saved
- **THEN** an empty state message is shown with a prompt to create the first plan

#### Scenario: Completed plans appear in collapsed section

- **WHEN** user navigates to the plans list and completed plans exist
- **THEN** a "Completed" section is shown below the active list, collapsed by default
