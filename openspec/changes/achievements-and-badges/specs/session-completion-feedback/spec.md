## ADDED Requirements

### Requirement: Achievement check after session completion

After the session completion rating overlay is dismissed (either by selecting a rating or tapping Skip), the system SHALL run the achievement engine and display the celebration overlay for any newly unlocked achievements.

#### Scenario: Achievement celebration follows rating dismissal

- **WHEN** the user dismisses the session completion overlay (rating selected or skipped)
- **THEN** the system SHALL check for newly unlocked achievements and display the celebration overlay if any are found

#### Scenario: No disruption when no new achievements

- **WHEN** the user dismisses the session completion overlay and no new achievements are unlocked
- **THEN** the app SHALL return to the home screen with no additional overlays
