## ADDED Requirements

### Requirement: Success animation is shown when a session is completed

The system SHALL display a visual success animation when the user finishes a session.

#### Scenario: Animation plays on session finish

- **WHEN** user taps the "Finish" action to complete a session
- **THEN** a full-screen or prominent success animation plays (e.g., scale-in + fade, or celebratory effect)

#### Scenario: Animation is dismissible

- **WHEN** the success animation is showing
- **THEN** user can tap or interact to dismiss it and proceed

### Requirement: Session stat summary is shown on completion

The system SHALL display key stats for the completed session alongside the success animation.

#### Scenario: Stats shown after session finish

- **WHEN** user finishes a session
- **THEN** the completion screen displays: total exercises completed (excluding dismissed), total sets completed, and elapsed session time

#### Scenario: Dismissed exercises excluded from stats

- **WHEN** one or more exercises were dismissed during the session
- **THEN** the stat summary counts only non-dismissed exercises and their sets

#### Scenario: Stats shown before save confirmation

- **WHEN** the completion screen is displayed
- **THEN** the stats and animation are visible before the user confirms saving the session
