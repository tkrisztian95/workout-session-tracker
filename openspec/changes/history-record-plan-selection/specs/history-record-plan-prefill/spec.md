## ADDED Requirements

### Requirement: Plan day core exercises pre-populate the exercise list

The system SHALL pre-fill the new history record exercise list with the selected day's core exercises (plus shared plan exercises) when the user picks a plan day.

#### Scenario: Core exercises appear in the exercise list

- **WHEN** the user selects a plan day in the new history record sheet
- **THEN** the exercise list is pre-populated with all of that day's core exercises, each shown as incomplete (not yet executed)

#### Scenario: Shared plan exercises are included

- **WHEN** the selected plan has shared exercises (e.g. warmups)
- **THEN** those shared exercises are also added to the pre-filled exercise list, before the day's core exercises

#### Scenario: Optional exercises are not pre-filled

- **WHEN** the user selects a plan day that has optional exercises
- **THEN** optional exercises are NOT included in the pre-filled list; the user may add them manually via "Add exercise"

#### Scenario: Pre-filled exercises have no logged execution data

- **WHEN** the exercise list is pre-filled from a plan day
- **THEN** each exercise has no `loggedSets` and no `duration` value — the user fills in execution details via the history exercise editor

### Requirement: Saved plan-based record carries plan and day identifiers

The system SHALL set `planId` and `planDayId` on the `WorkoutSession` when the record was created from a plan day.

#### Scenario: Plan-based session has planId and planDayId

- **WHEN** the user saves a new history record created from a plan day
- **THEN** the saved `WorkoutSession` contains the selected plan's `id` as `planId` and the selected day's `id` as `planDayId`

#### Scenario: Free session has no plan identifiers

- **WHEN** the user saves a new history record created as a free session
- **THEN** the saved `WorkoutSession` has no `planId` and no `planDayId`
