## ADDED Requirements

### Requirement: Sex field on profile settings screen

The profile settings screen SHALL include a sex selector card that allows the user to set their biological sex (Male / Female) or leave it unspecified.

#### Scenario: Sex card appears on profile screen

- **WHEN** the user navigates to the profile settings screen
- **THEN** a sex selector card SHALL be visible below the language card

#### Scenario: Sex selection is pre-filled with stored value

- **WHEN** the user opens the profile screen and a sex value is already stored
- **THEN** the sex selector SHALL display the stored value

#### Scenario: Changing and saving sex updates localStorage

- **WHEN** the user selects a different sex option and saves
- **THEN** `wst_user_sex` SHALL be updated in localStorage to reflect the new selection
