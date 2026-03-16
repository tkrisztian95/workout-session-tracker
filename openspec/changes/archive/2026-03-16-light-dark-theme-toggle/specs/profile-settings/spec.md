## ADDED Requirements

### Requirement: Theme selector on profile screen

The profile screen SHALL include a theme selector control that allows the user to choose between Light, System, and Dark theme preferences.

#### Scenario: Theme selector is visible on profile screen

- **WHEN** the user navigates to the profile/settings screen
- **THEN** a theme selector control SHALL be displayed, visually consistent with the language selector card

#### Scenario: Current preference is highlighted

- **WHEN** the profile screen is displayed
- **THEN** the currently active theme option (Light, System, or Dark) SHALL appear selected/highlighted

#### Scenario: Selecting a theme applies it immediately

- **WHEN** the user taps a theme option
- **THEN** the app theme SHALL switch immediately without requiring a save or reload

#### Scenario: Theme selection persists

- **WHEN** the user selects a theme from the profile screen and navigates away or reloads
- **THEN** the selected theme SHALL still be active on next visit
