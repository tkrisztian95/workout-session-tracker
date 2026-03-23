## MODIFIED Requirements

### Requirement: New session sheet allows entering date and duration

The system SHALL allow the user to specify the date and total duration (in minutes) for the new session. These fields are shown after the session type (and optionally plan/day) has been selected.

#### Scenario: Date defaults to today

- **WHEN** the user reaches the date/duration/exercise form step
- **THEN** the date field defaults to today's date

#### Scenario: User can change the date

- **WHEN** the user taps the date field in the form step
- **THEN** the system allows selecting a past (or current) date

#### Scenario: User can enter total duration in minutes

- **WHEN** the user fills in the duration field in the form step
- **THEN** the input accepts a positive integer representing total session length in minutes
