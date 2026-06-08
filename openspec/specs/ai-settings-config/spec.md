## ADDED Requirements

### Requirement: AI Configuration section on profile screen

The profile screen SHALL include an AI Configuration section where users can choose an AI provider (OpenAI or Gemini) and enter and save the API key and preferred model for that provider.

#### Scenario: Section is visible on profile screen

- **WHEN** the user navigates to the profile screen
- **THEN** an AI Configuration section SHALL be displayed with a provider selector, an API key input, and a model selector

#### Scenario: Fields are pre-filled from saved config

- **WHEN** a saved LLM config exists in localStorage
- **THEN** the provider selector SHALL reflect the saved provider, the API key field SHALL be pre-filled with the saved key, and the model selector SHALL reflect the saved model

#### Scenario: Fields default when no config is saved

- **WHEN** no LLM config exists in localStorage
- **THEN** the provider selector SHALL default to `openai`, the API key field SHALL be empty, and the model selector SHALL default to that provider's default model (`gpt-4o-mini`)

#### Scenario: Model options follow the selected provider

- **WHEN** the user changes the provider selector
- **THEN** the model selector SHALL show only models valid for that provider
- **AND** the model selection SHALL reset to the newly selected provider's default model

#### Scenario: Saving persists the config

- **WHEN** the user selects a provider, enters a non-empty API key, optionally selects a model, and taps Save
- **THEN** the config SHALL be persisted to localStorage under `wst_llm_config`
- **AND** the saved config SHALL include the selected provider (`openai` or `gemini`), the entered API key, and the selected model

#### Scenario: Empty API key cannot be saved

- **WHEN** the API key field is empty and the user taps Save
- **THEN** the save action SHALL be disabled or rejected and no config SHALL be written

### Requirement: AI Plan modal redirects to settings when no config is saved

When the user opens the AI Plan Suggestion modal and no API key is configured, the modal SHALL display a prompt directing the user to the profile settings page instead of an inline config form.

#### Scenario: Modal opened with no saved config

- **WHEN** the user opens the AI Plan Suggestion modal
- **AND** no LLM config with a non-empty API key exists in localStorage
- **THEN** the modal SHALL show a "no config" state with a message and a link or button to the profile settings page
- **AND** the modal SHALL NOT display an inline API key input or model selector

#### Scenario: Modal opened with saved config

- **WHEN** the user opens the AI Plan Suggestion modal
- **AND** a saved LLM config with a non-empty API key exists
- **THEN** the modal SHALL show the preferences form directly
- **AND** the modal SHALL NOT display an API key input or model selector
