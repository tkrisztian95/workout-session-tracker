## MODIFIED Requirements

### Requirement: User name onboarding prompt

When the app loads and no user name is stored, the system SHALL display a name-entry prompt with a language selector before the user can interact with the main content.

#### Scenario: First launch shows name prompt with language selector

- **WHEN** the app loads and no name is found in local storage
- **THEN** a name-entry modal SHALL be displayed containing both a name input and a language selector

#### Scenario: Name prompt is not shown on subsequent launches

- **WHEN** the app loads and a name is already stored in local storage
- **THEN** the name-entry prompt SHALL NOT be displayed

#### Scenario: Submitting the name and language dismisses the prompt

- **WHEN** the user enters a non-empty name, selects a language, and submits the form
- **THEN** the name and locale SHALL be saved and the prompt SHALL be dismissed

#### Scenario: Empty name submission is rejected

- **WHEN** the user submits the form with an empty name
- **THEN** the prompt SHALL remain visible and neither the name nor the locale SHALL be saved

### Requirement: Language selection during onboarding

The onboarding prompt SHALL display a segmented language selector showing English, Magyar, and Deutsch as options. The user MUST select one before submitting.

#### Scenario: English is pre-selected by default

- **WHEN** the onboarding prompt is displayed
- **THEN** English SHALL be the pre-selected language option

#### Scenario: User can change language selection

- **WHEN** the user taps/clicks a language option that is not currently selected
- **THEN** that language SHALL become the active selection

#### Scenario: Submitting with Hungarian saves hu locale

- **WHEN** the user selects Magyar and submits
- **THEN** `wst_locale` SHALL be set to `hu` in localStorage

#### Scenario: Submitting with German saves de locale

- **WHEN** the user selects Deutsch and submits
- **THEN** `wst_locale` SHALL be set to `de` in localStorage
