## MODIFIED Requirements

### Requirement: Persistent user name storage

The system SHALL persist the user's name in local storage so it survives page refreshes and browser sessions. The name MAY be updated after initial onboarding via the profile settings screen.

#### Scenario: Name persists after page reload

- **WHEN** the user has previously entered their name and reloads the page
- **THEN** the stored name SHALL be retrievable and the onboarding prompt SHALL NOT appear

#### Scenario: Name can be updated from profile settings

- **WHEN** the user changes their name from the profile settings screen and saves
- **THEN** the updated name SHALL be stored under `wst_user_name` and the personalized greeting on the home screen SHALL reflect the new name

## ADDED Requirements

### Requirement: saveUserName storage helper

The storage module SHALL expose a `saveUserName(name: string): void` function that persists the user's display name to localStorage under `wst_user_name`. This function is used by both the onboarding modal and the profile settings screen.

#### Scenario: saveUserName persists the provided name

- **WHEN** `saveUserName("Alice")` is called
- **THEN** localStorage SHALL contain `wst_user_name = "Alice"`
