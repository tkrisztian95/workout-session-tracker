## ADDED Requirements

### Requirement: User can create a workout plan
The system SHALL allow users to create a named workout plan containing one or more training days.

#### Scenario: Create plan with a name
- **WHEN** user submits the "New Plan" form with a non-empty name
- **THEN** a new plan is saved to localStorage and appears in the plan list

#### Scenario: Reject empty plan name
- **WHEN** user submits the "New Plan" form with an empty or whitespace-only name
- **THEN** the form SHALL display a validation error and not save the plan

### Requirement: Plan contains named training days
Each workout plan SHALL contain one or more training days (e.g., "Day A", "Day B"), each with an optional list of scheduled weekdays. Weekday assignment is optional and hidden by default; users can reveal day scheduling via an explicit toggle.

#### Scenario: Add a training day to a plan
- **WHEN** user adds a day to a plan with a name and at least one scheduled weekday
- **THEN** the day is saved as part of the plan with its name and weekday schedule

#### Scenario: Day with no weekdays is allowed
- **WHEN** user adds a day without selecting any weekdays (or without opening the weekday picker)
- **THEN** the day is saved without a fixed schedule and can be chosen manually at session start

#### Scenario: Weekday picker is hidden by default on new days
- **WHEN** user adds a new training day
- **THEN** the weekday selector SHALL be hidden until the user explicitly toggles it visible

### Requirement: Training day has core and optional exercises
Each training day SHALL have a list of core exercises (mandatory) and a list of optional exercises.

#### Scenario: Add core exercise to a day
- **WHEN** user adds an exercise and marks it as core
- **THEN** the exercise appears in the core list for that day

#### Scenario: Add optional exercise to a day
- **WHEN** user adds an exercise and marks it as optional
- **THEN** the exercise appears in the optional list for that day

#### Scenario: Day with only core exercises is valid
- **WHEN** a day has core exercises and no optional exercises
- **THEN** the day is valid and can be used to start a session

### Requirement: Plan exercises have scaling notes
Each exercise in a plan day MAY have a scaling note — a free-text description of when and how to progress the exercise.

#### Scenario: Save exercise with scaling note
- **WHEN** user enters a scaling note for an exercise in a plan day
- **THEN** the note is saved with the exercise and displayed during the session

#### Scenario: Exercise without scaling note is valid
- **WHEN** user adds an exercise without a scaling note
- **THEN** the exercise is saved and the scaling note field is simply absent

### Requirement: User can view the plan list
The system SHALL display all saved workout plans in a list view.

#### Scenario: Plans list shows all plans
- **WHEN** user navigates to the plans list
- **THEN** all saved plans are displayed with their name and number of training days

#### Scenario: Empty state when no plans exist
- **WHEN** user navigates to the plans list and no plans are saved
- **THEN** an empty state message is shown with a prompt to create the first plan

### Requirement: User can edit a plan
The system SHALL allow users to edit the name, training days, and exercises of an existing plan.

#### Scenario: Rename a plan
- **WHEN** user changes the plan name and saves
- **THEN** the plan is updated in localStorage with the new name

#### Scenario: Edit a training day's exercises
- **WHEN** user adds, removes, or reorders exercises on a day and saves
- **THEN** the day's exercise list is updated in localStorage

### Requirement: User can delete a plan
The system SHALL allow users to delete a workout plan.

#### Scenario: Delete plan removes it from list
- **WHEN** user confirms deletion of a plan
- **THEN** the plan is removed from localStorage and no longer appears in the list

#### Scenario: Delete confirmation required
- **WHEN** user taps "Delete" on a plan
- **THEN** a confirmation prompt is shown before deleting
