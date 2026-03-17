## ADDED Requirements

### Requirement: User can configure LLM provider settings

The system SHALL allow the user to enter and persist an OpenAI API key and select a model (defaulting to `gpt-4o-mini`). The configuration SHALL be stored in localStorage under `wst_llm_config`.

#### Scenario: First-time API key entry

- **WHEN** the user opens the AI suggestion modal for the first time
- **THEN** the system SHALL display an API key input field and a model selector before the Generate button is active

#### Scenario: API key persisted across sessions

- **WHEN** the user has previously saved an API key
- **THEN** the system SHALL pre-fill the API key field and skip to the generation view on subsequent opens

#### Scenario: User clears API key

- **WHEN** the user deletes the API key from the input and saves
- **THEN** the system SHALL remove the key from localStorage and return to the configuration view

### Requirement: AI Suggest button appears on Plans tab

The system SHALL render an "AI Suggest" button on the Plans tab, visually distinct from but adjacent to the "New Plan" action.

#### Scenario: Button visible with or without existing plans

- **WHEN** the Plans tab is displayed regardless of plan count
- **THEN** the "AI Suggest" button SHALL be visible and tappable

### Requirement: System generates a plan suggestion using LLM

The system SHALL collect existing plans and the last 20 completed workout sessions, construct a prompt, and call the OpenAI Chat Completions API with `response_format: { type: "json_object" }`. The returned JSON SHALL be parsed into a `WorkoutPlan` object.

#### Scenario: Successful plan generation with history

- **WHEN** the user taps "Generate" with a valid API key and history exists
- **THEN** the system SHALL display a loading indicator, call the API, parse the response, and render a plan preview

#### Scenario: Generation with no history

- **WHEN** the user taps "Generate" with a valid API key but no completed sessions
- **THEN** the system SHALL include a note in the prompt and still attempt generation with only existing plan context

#### Scenario: API call fails or returns malformed JSON

- **WHEN** the OpenAI API returns an error or the response cannot be parsed
- **THEN** the system SHALL display a user-friendly error message and enable a "Retry" action

#### Scenario: History truncation

- **WHEN** the user has more than 20 completed sessions
- **THEN** the system SHALL include only the 20 most recent sessions in the prompt context

### Requirement: User can preview and apply the suggested plan

The system SHALL display the AI-suggested plan in a read-only preview within the modal. The user SHALL be able to apply the suggestion (which pre-fills and opens the plan creation form) or regenerate.

#### Scenario: Apply suggestion

- **WHEN** the user taps "Use this plan" on the preview
- **THEN** the system SHALL close the modal and open the plan creation/edit form pre-populated with the suggested plan data

#### Scenario: Regenerate

- **WHEN** the user taps "Regenerate" on the preview
- **THEN** the system SHALL make a new API call and replace the displayed suggestion

#### Scenario: Dismiss modal

- **WHEN** the user closes the modal without applying
- **THEN** no plan SHALL be created or modified
