## ADDED Requirements

### Requirement: User can duplicate a plan

The system SHALL allow users to duplicate any existing plan from the plan list. The duplicate SHALL be a deep copy — new unique ids for the plan, each training day, and each exercise — with the name suffixed " (copy)" and `createdAt`/`updatedAt` set to the duplication time. After duplication the user is navigated to the new plan's edit page.

#### Scenario: Duplicate an active plan

- **WHEN** the user taps the duplicate action on an active plan card
- **THEN** a new plan is created with a fresh id, " (copy)" appended to the name, and all days and exercises deep-cloned
- **AND** the user is navigated to the new plan's detail/edit page

#### Scenario: Duplicate a completed plan

- **WHEN** the user taps the duplicate action on a completed plan card
- **THEN** the duplicate is created with status `'active'` regardless of the source plan's status

#### Scenario: Duplicate has no scheduling carry-over conflict

- **WHEN** the source plan has `scheduledWeeks` set
- **THEN** the duplicate retains the same `scheduledWeeks` value

#### Scenario: Original plan is unchanged after duplication

- **WHEN** the user duplicates a plan
- **THEN** the original plan remains in the list with all its original data intact

#### Scenario: Duplicate ids are unique

- **WHEN** a plan is duplicated
- **THEN** the new plan id, all day ids, and all exercise ids are different from the source plan's ids
