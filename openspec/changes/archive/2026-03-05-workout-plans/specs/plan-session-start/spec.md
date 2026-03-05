## ADDED Requirements

### Requirement: Session start screen offers plan or free choice
The system SHALL present users with a choice when starting a workout: follow a plan day or start a free session.

#### Scenario: User selects "Follow a Plan"
- **WHEN** user taps "Follow a Plan" on the session start screen
- **THEN** the system displays a list of available plans to choose from

#### Scenario: User selects "Free Session"
- **WHEN** user taps "Free Session" on the session start screen
- **THEN** a new empty session starts immediately with no pre-filled exercises

### Requirement: User can select a plan and training day to follow
When following a plan, the system SHALL allow users to select a specific training day from the chosen plan.

#### Scenario: Select plan then day
- **WHEN** user selects a plan from the list
- **THEN** the system displays the plan's training days for selection

#### Scenario: Suggested day based on weekday
- **WHEN** the current weekday matches the scheduled weekday(s) of a plan day
- **THEN** that day is highlighted as the suggested day

#### Scenario: User can pick any day regardless of schedule
- **WHEN** user taps a day that is not the suggested day
- **THEN** the system accepts the choice and proceeds without warning

### Requirement: Session pre-filled from plan day
When a plan day is selected, the system SHALL pre-fill the session with the day's core exercises and offer optional exercises for inclusion.

#### Scenario: Core exercises added automatically
- **WHEN** user starts a session from a plan day
- **THEN** all core exercises from that day are added to the session automatically

#### Scenario: Optional exercises presented for inclusion
- **WHEN** user starts a session from a plan day that has optional exercises
- **THEN** the user is presented with the optional exercises and can toggle which ones to include before starting

#### Scenario: Session starts with selected exercises
- **WHEN** user confirms exercise selection (core + chosen optionals)
- **THEN** the session opens with those exercises pre-filled and ready to track

### Requirement: Scaling notes shown during session
When a session is started from a plan day, the system SHALL display the scaling note for each exercise that has one.

#### Scenario: Scaling note visible on exercise card
- **WHEN** an exercise has a scaling note and is part of an active plan session
- **THEN** the scaling note is displayed on the exercise card in the session view

#### Scenario: No scaling note for free session exercises
- **WHEN** a session is started as a free session
- **THEN** no scaling notes are displayed (exercises have no plan context)

### Requirement: Session records its plan origin
When a session is started from a plan day, the system SHALL record the plan ID and plan day ID on the session.

#### Scenario: Plan session saved with plan reference
- **WHEN** a plan-based session is completed and saved
- **THEN** the saved session includes the planId and planDayId fields

#### Scenario: Free session saved without plan reference
- **WHEN** a free session is completed and saved
- **THEN** the saved session has no planId or planDayId fields
