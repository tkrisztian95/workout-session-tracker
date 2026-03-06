## ADDED Requirements

### Requirement: Workout plans support shared exercises applied to all days

The system SHALL allow users to add shared exercises to a workout plan that are automatically included in every session started from any day of that plan.

#### Scenario: Add shared exercise to a plan

- **WHEN** user adds an exercise to the plan's shared exercises list
- **THEN** the exercise is saved to the plan and displayed in the plan's shared exercises section

#### Scenario: Shared exercises included in all plan day sessions

- **WHEN** user starts a session from any day of a plan that has shared exercises
- **THEN** the shared exercises are prepended to the session's exercise list alongside the day's exercises

#### Scenario: Plan with no shared exercises behaves as before

- **WHEN** a plan has no shared exercises and user starts a session from one of its days
- **THEN** the session contains only the day's exercises, unchanged from existing behavior

#### Scenario: Shared exercises are core (always included)

- **WHEN** shared exercises are added to a session
- **THEN** they are treated as core exercises (not optional) and cannot be excluded at session start

### Requirement: Shared exercises are visible when editing a plan

The system SHALL display the shared exercises list when a user views or edits a workout plan.

#### Scenario: Shared exercises section shown in plan edit view

- **WHEN** user opens a plan for editing
- **THEN** a "Shared Exercises" (or equivalent) section is visible where exercises can be added or removed
