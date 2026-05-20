## ADDED Requirements

### Requirement: Free session is primary CTA when no plans exist

When a user has no workout plans, the system SHALL present "Start Free Session" as the primary (visually prominent) action and "Create New Plan" as the secondary action on the session start screen.

#### Scenario: No plans — free session button is primary

- **WHEN** the user opens the session start screen and no workout plans exist
- **THEN** the "Start Free Session" button is displayed with primary button styling (filled/prominent)
- **AND** the "Create New Plan" button is displayed with secondary button styling (outline/subdued)

#### Scenario: Plans exist — existing layout is preserved

- **WHEN** the user opens the session start screen and at least one workout plan exists
- **THEN** the existing button hierarchy and layout are displayed without change

#### Scenario: Loading state before plan data resolves

- **WHEN** the session start screen is loading plan data
- **THEN** buttons are not rendered (or a loading indicator is shown) until plan data has resolved
