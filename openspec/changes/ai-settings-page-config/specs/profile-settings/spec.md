## ADDED Requirements

### Requirement: AI Configuration section on profile screen

The profile screen SHALL include an AI Configuration section that allows users to configure their OpenAI API key and model selection for AI plan generation.

#### Scenario: AI Configuration section is visible

- **WHEN** the user navigates to the profile screen
- **THEN** an AI Configuration section SHALL be visible, positioned between the Language section and the Danger Zone

#### Scenario: API key input is masked

- **WHEN** the AI Configuration section is displayed
- **THEN** the API key input SHALL render as a password field (masked characters)

#### Scenario: "Get API key" link is shown

- **WHEN** the AI Configuration section is displayed
- **THEN** a link to the OpenAI API keys page SHALL be shown alongside the API key field

#### Scenario: Privacy note is shown

- **WHEN** the AI Configuration section is displayed
- **THEN** a note SHALL be shown indicating the API key is stored locally on the device
