## ADDED Requirements

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

### Requirement: Plan exercises use a 3-way type model

Each exercise in a plan day SHALL have a `type` of `'sets-reps'`, `'sets-duration'`, or `'duration'`, determining which metric fields are required.

- `sets-reps`: requires `sets` and `reps` (e.g., 3×10 squats)
- `sets-duration`: requires `sets` and `duration` (e.g., 3×30s plank)
- `duration`: requires only `duration`, no sets (e.g., 30 min run)

#### Scenario: Save sets-reps exercise

- **WHEN** user adds an exercise with type `sets-reps`, sets count, and reps count
- **THEN** the exercise is saved with `type: 'sets-reps'`, `sets`, and `reps`; duration is absent

#### Scenario: Save sets-duration exercise

- **WHEN** user adds an exercise with type `sets-duration`, sets count, and duration
- **THEN** the exercise is saved with `type: 'sets-duration'`, `sets`, and `duration`; reps is absent

#### Scenario: Save duration-only exercise

- **WHEN** user adds an exercise with type `duration` and a duration value
- **THEN** the exercise is saved with `type: 'duration'` and `duration`; sets and reps are absent

#### Scenario: Form validates required fields per type

- **WHEN** user selects a type and submits the form without filling in that type's required fields
- **THEN** the form displays a validation error and does not save the exercise

### Requirement: Plan has a shared exercises list

Each workout plan SHALL support a list of shared exercises that apply to every training day.

#### Scenario: Plan created without shared exercises

- **WHEN** user creates a new plan and adds no shared exercises
- **THEN** the plan's sharedExercises field is an empty array

#### Scenario: Add shared exercise to existing plan

- **WHEN** user adds an exercise to the plan's shared exercises section
- **THEN** the exercise appears in the plan's sharedExercises array with an auto-generated ID

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

### Requirement: User can delete a plan

The system SHALL allow users to delete a workout plan.

#### Scenario: Delete plan removes it from list

- **WHEN** user confirms deletion of a plan
- **THEN** the plan is removed from localStorage and no longer appears in the list

#### Scenario: Delete confirmation required

- **WHEN** user taps "Delete" on a plan
- **THEN** a confirmation prompt is shown before deleting

### Requirement: Exercise name input in add-exercise modals

The exercise name input in `AddPlanExerciseModal` and `AddExerciseModal` SHALL support autocomplete suggestions sourced from the wger exercise catalog. Users SHALL still be able to type and submit any free-text name. The stored exercise name SHALL remain a plain string; no category or wger metadata is persisted.

#### Scenario: Suggestions appear on input

- **WHEN** the user types 3 or more characters in the exercise name field in either modal
- **THEN** the system queries wger and displays matching suggestions below the input

#### Scenario: Submit with suggestion selected

- **WHEN** the user selects a suggestion and taps "Add Exercise"
- **THEN** the exercise is saved with the suggestion's name as a plain string

#### Scenario: Submit with free-text name

- **WHEN** the user types a custom name and taps "Add Exercise" without selecting a suggestion
- **THEN** the exercise is saved with the typed name as a plain string

#### Scenario: Dropdown does not block submit

- **WHEN** the suggestion dropdown is open
- **THEN** the "Add Exercise" submit button remains accessible and functional
