### Requirement: Profile tab in bottom navigation

The system SHALL include a Profile tab in the bottom navigation bar alongside Home, Plans, and History.

#### Scenario: Profile tab is visible in nav

- **WHEN** any main screen is displayed
- **THEN** the bottom navigation SHALL show a Profile tab icon and label

#### Scenario: Profile tab navigates to profile screen

- **WHEN** the user taps the Profile tab
- **THEN** the app SHALL navigate to the profile settings screen

### Requirement: Edit display name from profile screen

The profile screen SHALL allow the user to view and update their stored display name.

#### Scenario: Current name is pre-filled

- **WHEN** the profile screen is displayed
- **THEN** the name field SHALL be pre-filled with the currently stored display name

#### Scenario: Saving a valid name persists it

- **WHEN** the user edits the name field to a non-empty value and saves
- **THEN** the new name SHALL be persisted in localStorage under `wst_user_name`

#### Scenario: Empty name cannot be saved

- **WHEN** the user clears the name field and attempts to save
- **THEN** the save action SHALL be disabled or rejected and the stored name SHALL not change

### Requirement: Change language from profile screen

The profile screen SHALL display a language selector allowing the user to switch their active locale.

#### Scenario: Current language is highlighted

- **WHEN** the profile screen is displayed
- **THEN** the currently active locale option SHALL appear selected

#### Scenario: Selecting a new language updates the app locale immediately

- **WHEN** the user selects a different language option and saves (or the change is applied immediately)
- **THEN** the active locale SHALL update and all translated strings SHALL reflect the new language

#### Scenario: Language change persists across reload

- **WHEN** the user changes the language from the profile screen and reloads the app
- **THEN** the newly selected locale SHALL still be active

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

### Requirement: Clear Data & Reset

The profile screen SHALL provide a Clear Data & Reset action that wipes all local app data and returns the app to its initial state.

#### Scenario: Confirmation step is required before reset

- **WHEN** the user taps Clear Data & Reset
- **THEN** a confirmation prompt or inline warning SHALL be displayed before any data is deleted

#### Scenario: Confirming the reset clears all data and reloads

- **WHEN** the user confirms the reset action
- **THEN** all localStorage keys SHALL be cleared and the app SHALL reload, displaying the onboarding prompt

#### Scenario: Cancelling the reset does nothing

- **WHEN** the user dismisses or cancels the confirmation prompt
- **THEN** no data SHALL be deleted and the profile screen SHALL remain visible
