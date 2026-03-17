## MODIFIED Requirements

### Requirement: Animation is dismissible

The system SHALL allow the user to dismiss the session completion overlay, but tapping the background SHALL NOT immediately dismiss — the user must use the emoji rating or the Skip action to proceed.

#### Scenario: Background tap no longer dismisses overlay

- **WHEN** the success animation/stats are showing
- **THEN** tapping the background outside the content does NOT dismiss the overlay

#### Scenario: Rating emoji dismisses overlay

- **WHEN** user taps an emoji rating option
- **THEN** the overlay is dismissed after saving

#### Scenario: Skip action dismisses overlay

- **WHEN** user taps the Skip action
- **THEN** the overlay is dismissed without a rating saved
