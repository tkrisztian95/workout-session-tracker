## MODIFIED Requirements

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
