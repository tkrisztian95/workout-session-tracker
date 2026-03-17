## ADDED Requirements

### Requirement: User can log individual sets for a sets-reps exercise

The system SHALL allow the user to log individual sets with weight and reps for exercises of type `sets-reps` during an active session.

#### Scenario: Add Set button is visible for sets-reps exercises

- **WHEN** the active session contains an exercise of type `sets-reps`
- **THEN** an "Add Set" button (or equivalent affordance) is displayed on that exercise's card

#### Scenario: User logs a set

- **WHEN** the user taps "Add Set" and submits a weight (kg) and reps value
- **THEN** a new logged set entry is appended to the exercise, showing the weight, reps, and a logged timestamp

#### Scenario: Weight field pre-fills with target weight

- **WHEN** the "Add Set" form opens and the exercise has a `weightKg` target
- **THEN** the weight input is pre-filled with that target value

#### Scenario: Weight field pre-fills with last logged set weight

- **WHEN** the "Add Set" form opens, the exercise has no `weightKg` target, but a previous set has been logged
- **THEN** the weight input is pre-filled with the most recent logged set's weight

#### Scenario: Logged sets are displayed on the exercise card

- **WHEN** one or more sets have been logged for an exercise
- **THEN** the card displays each logged set (weight and reps) in the order they were added

#### Scenario: Add Set is not shown for non-sets-reps exercises

- **WHEN** an exercise is of type `sets-duration` or `duration`
- **THEN** no "Add Set" button is displayed for that exercise

### Requirement: Logged sets are preserved in the completed session

The system SHALL persist all logged sets when the session is finished, so they are available in session history.

#### Scenario: Logged sets saved on session completion

- **WHEN** the user finishes the session
- **THEN** all logged sets (weight, reps, loggedAt) for each exercise are included in the saved `WorkoutSession` record
