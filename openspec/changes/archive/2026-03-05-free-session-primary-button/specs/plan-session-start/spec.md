## MODIFIED Requirements

### Requirement: Session start screen offers plan or free choice
The system SHALL present users with a choice when starting a workout: follow a plan day or start a free session. When no plans exist, the system SHALL present "Start Free Session" as the primary action and "Create New Plan" as the secondary action.

#### Scenario: User selects "Follow a Plan"
- **WHEN** user taps "Follow a Plan" on the session start screen
- **THEN** the system displays a list of available plans to choose from

#### Scenario: User selects "Free Session"
- **WHEN** user taps "Free Session" on the session start screen
- **THEN** a new empty session starts immediately with no pre-filled exercises

#### Scenario: No plans — free session is primary
- **WHEN** the session start screen is displayed and no workout plans exist
- **THEN** "Start Free Session" is shown as the primary button and "Create New Plan" as the secondary button
