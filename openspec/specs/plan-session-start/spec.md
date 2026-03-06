## ADDED Requirements

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

### Requirement: User can select a plan and training day to follow — next incomplete day is auto-focused

When following a plan, the system SHALL allow users to select a specific training day from the chosen plan. The system SHALL auto-focus the first incomplete day based on the user's completed session history for that plan.

#### Scenario: Select plan then day

- **WHEN** user selects a plan from the list
- **THEN** the system displays the plan's training days for selection

#### Scenario: Suggested day based on weekday

- **WHEN** the current weekday matches the scheduled weekday(s) of a plan day
- **THEN** that day is highlighted as the suggested day

#### Scenario: Auto-focus next day based on completed sessions

- **WHEN** user selects a plan to follow and has previously completed sessions from that plan
- **THEN** the day picker focuses (highlights) the next day in plan order after the last completed day

#### Scenario: Auto-focus first day when no sessions exist for the plan

- **WHEN** user selects a plan to follow and has no completed sessions for that plan
- **THEN** the day picker focuses the first day of the plan

#### Scenario: Auto-focus wraps or stays at last day when all days completed

- **WHEN** user selects a plan where all days have been completed at least once
- **THEN** the day picker focuses the first day (cycle restart)

#### Scenario: Suggested day based on weekday still applies

- **WHEN** the auto-focused day also matches the current weekday schedule
- **THEN** that day is highlighted as both the suggested and auto-focused day

#### Scenario: User can pick any day regardless of auto-focus

- **WHEN** user taps a day that is not the auto-focused day
- **THEN** the system accepts the choice and proceeds without warning

### Requirement: Session pre-filled from plan day

When a plan day is selected, the system SHALL pre-fill the session with the day's core exercises and offer optional exercises for inclusion. When a plan day is selected and the plan has shared exercises, the system SHALL include shared exercises in the session.

#### Scenario: Core exercises added automatically

- **WHEN** user starts a session from a plan day
- **THEN** all core exercises from that day are added to the session automatically

#### Scenario: Optional exercises presented for inclusion

- **WHEN** user starts a session from a plan day that has optional exercises
- **THEN** the user is presented with the optional exercises and can toggle which ones to include before starting

#### Scenario: Session starts with selected exercises

- **WHEN** user confirms exercise selection (core + chosen optionals)
- **THEN** the session opens with those exercises pre-filled and ready to track

#### Scenario: Shared exercises prepended to session exercise list

- **WHEN** user starts a session from a plan day whose plan has shared exercises
- **THEN** the shared exercises appear at the top of the session exercise list, before the day's exercises

#### Scenario: No shared exercises — session unchanged

- **WHEN** user starts a session from a plan day whose plan has no shared exercises
- **THEN** the session contains only the day's exercises as before

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
