## ADDED Requirements

### Requirement: Discard button in bottom bar on plan create form

The plan create form SHALL display a "Discard" button in the fixed bottom action bar, to the left of the "Save Plan" button.

#### Scenario: Discard navigates away without saving

- **WHEN** user taps the "Discard" button on the New Plan page
- **THEN** the app navigates back without creating a new plan

#### Scenario: Discard button is visible in bottom bar

- **WHEN** the New Plan page is displayed
- **THEN** a "Discard" button SHALL appear in the bottom action bar alongside "Save Plan"

### Requirement: Discard button in bottom bar on plan edit form

The plan edit form SHALL display a "Discard" button in the fixed bottom action bar, to the left of the "Save Changes" button.

#### Scenario: Discard navigates away without saving changes

- **WHEN** user taps the "Discard" button on the Edit Plan page
- **THEN** the app navigates back without persisting any edits

#### Scenario: Discard button is visible in bottom bar

- **WHEN** the Edit Plan page is displayed
- **THEN** a "Discard" button SHALL appear in the bottom action bar alongside "Save Changes"
