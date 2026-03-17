## ADDED Requirements

### Requirement: User can rate a completed session with an emoji

The system SHALL present a row of emoji options on the session completion overlay, allowing the user to rate the session before dismissing.

#### Scenario: Rating row appears after stats animate in

- **WHEN** the session completion overlay is displayed
- **THEN** a row of 5 emoji options (😩 😕 😐 💪 🔥) is shown below the stats cards

#### Scenario: Tapping an emoji saves the rating and dismisses the overlay

- **WHEN** user taps one of the emoji rating options
- **THEN** the session is saved with that rating value (1–5) and the overlay is dismissed

#### Scenario: User can skip rating

- **WHEN** the rating row is displayed
- **THEN** a "Skip" text action is available that saves the session without a rating and dismisses the overlay

### Requirement: Session rating is persisted with the session record

The system SHALL store the selected rating as an optional numeric field (1–5) on the `WorkoutSession` record in local storage.

#### Scenario: Rated session stored with rating field

- **WHEN** user selects an emoji rating
- **THEN** the saved `WorkoutSession` record includes a `rating` value between 1 and 5 corresponding to the chosen emoji

#### Scenario: Skipped rating stored without rating field

- **WHEN** user skips the rating
- **THEN** the saved `WorkoutSession` record has no `rating` field (or `rating` is undefined)

#### Scenario: Existing sessions without rating remain valid

- **WHEN** a session saved before this feature was introduced is loaded
- **THEN** the absence of a `rating` field is treated as no rating given, with no errors
