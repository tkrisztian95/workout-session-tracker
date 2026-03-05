## MODIFIED Requirements

### Requirement: User can select a plan and training day to follow — next incomplete day is auto-focused

When following a plan, the system SHALL auto-focus the first incomplete day based on the user's completed session history for that plan.

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

## MODIFIED Requirements

### Requirement: Session pre-filled from plan day includes shared exercises

When a plan day is selected and the plan has shared exercises, the system SHALL include shared exercises in the session.

#### Scenario: Shared exercises prepended to session exercise list

- **WHEN** user starts a session from a plan day whose plan has shared exercises
- **THEN** the shared exercises appear at the top of the session exercise list, before the day's exercises

#### Scenario: No shared exercises — session unchanged

- **WHEN** user starts a session from a plan day whose plan has no shared exercises
- **THEN** the session contains only the day's exercises as before
