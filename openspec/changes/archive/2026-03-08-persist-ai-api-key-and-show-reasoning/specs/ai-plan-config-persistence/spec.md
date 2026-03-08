## ADDED Requirements

### Requirement: Skip config form when API key is already saved

When the user opens the AI Plan Suggestion modal and a saved LLM config with a non-empty API key already exists in local storage, the system SHALL bypass the config form and initiate plan generation immediately without requiring any user input.

#### Scenario: Modal opens with saved config

- **WHEN** the user opens the AI Plan Suggestion modal
- **AND** a previously saved LLM config with a non-empty API key exists
- **THEN** the config form is not shown
- **AND** plan generation starts automatically

#### Scenario: Modal opens without saved config

- **WHEN** the user opens the AI Plan Suggestion modal
- **AND** no saved LLM config exists (or the API key is empty)
- **THEN** the config form is displayed as normal

### Requirement: Edit settings affordance when config is saved

When plan generation is initiated automatically (because a saved config was detected), the system SHALL display the model name and a "Change" or "Edit settings" control so the user can modify the API key or model selection.

#### Scenario: User wants to change the saved API key

- **WHEN** the modal is in auto-generate or loading state
- **AND** the user taps the "Change" / "Edit settings" control
- **THEN** the config form is displayed with the current key and model pre-filled
- **AND** the user can update them and re-trigger generation

### Requirement: Config is saved on successful generation

After a plan is successfully generated, the system SHALL persist the API key and model used so that subsequent modal opens skip the config form.

#### Scenario: Successful generation saves config

- **WHEN** a plan is successfully generated using a provided API key and model
- **THEN** the config (API key + model) is saved to local storage
- **AND** the next time the modal is opened, the config form is skipped
