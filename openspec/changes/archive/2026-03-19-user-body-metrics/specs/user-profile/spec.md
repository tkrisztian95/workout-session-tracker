## ADDED Requirements

### Requirement: Body metrics step in onboarding

After the user submits their name and language, the onboarding flow SHALL present a second step for collecting age, height, weight, and sex. All four fields SHALL be optional. The user SHALL be able to proceed without filling any of them. Submitted values SHALL be persisted via the respective storage helpers.

#### Scenario: Second onboarding step appears after name submission

- **WHEN** the user enters a valid name and language and submits the first step
- **THEN** a second onboarding step SHALL be displayed with fields for age, height (cm), weight (kg), and sex

#### Scenario: Proceeding with all fields empty is valid

- **WHEN** the second onboarding step is displayed and the user submits without entering any values
- **THEN** no body-metric values SHALL be saved and onboarding SHALL complete normally

#### Scenario: Age is saved when provided

- **WHEN** the user enters a valid age and submits the second onboarding step
- **THEN** `saveAge` SHALL be called with the entered value

#### Scenario: Height is saved when provided

- **WHEN** the user enters a valid height and submits the second onboarding step
- **THEN** `saveHeightCm` SHALL be called with the entered value

#### Scenario: Weight is saved when provided

- **WHEN** the user enters a valid weight and submits the second onboarding step
- **THEN** `saveWeightKg` SHALL be called with the entered value

#### Scenario: Sex selection is saved when provided

- **WHEN** the user selects a sex option and submits the second onboarding step
- **THEN** `saveSex` SHALL be called with the selected value

#### Scenario: Second step is not shown if user has already completed onboarding

- **WHEN** the app loads and a stored user name is found (i.e., onboarding was previously completed)
- **THEN** neither onboarding step SHALL be shown, regardless of whether body metrics are stored
