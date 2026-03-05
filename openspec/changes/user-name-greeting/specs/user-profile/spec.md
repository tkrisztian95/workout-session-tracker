## ADDED Requirements

### Requirement: User name onboarding prompt
When the app loads and no user name is stored, the system SHALL display a name-entry prompt before the user can interact with the main content.

#### Scenario: First launch shows name prompt
- **WHEN** the app loads and no name is found in local storage
- **THEN** a name-entry modal/prompt SHALL be displayed

#### Scenario: Name prompt is not shown on subsequent launches
- **WHEN** the app loads and a name is already stored in local storage
- **THEN** the name-entry prompt SHALL NOT be displayed

#### Scenario: Submitting the name dismisses the prompt
- **WHEN** the user enters a non-empty name and submits the form
- **THEN** the name SHALL be saved and the prompt SHALL be dismissed

#### Scenario: Empty name submission is rejected
- **WHEN** the user submits the form with an empty name
- **THEN** the prompt SHALL remain visible and the name SHALL NOT be saved

### Requirement: Persistent user name storage
The system SHALL persist the user's name in local storage so it survives page refreshes and browser sessions.

#### Scenario: Name persists after page reload
- **WHEN** the user has previously entered their name and reloads the page
- **THEN** the stored name SHALL be retrievable and the prompt SHALL NOT appear

### Requirement: Personalized greeting on home screen
The home screen SHALL display a personalized greeting using the stored user name.

#### Scenario: First-time greeting after onboarding
- **WHEN** the user has just entered their name for the first time
- **THEN** the home screen SHALL display "Welcome, {name}!"

#### Scenario: Returning user greeting
- **WHEN** the app loads and a name is already stored
- **THEN** the home screen SHALL display "Welcome back, {name}!"
