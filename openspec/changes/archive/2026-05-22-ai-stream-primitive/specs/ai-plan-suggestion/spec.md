## MODIFIED Requirements

### Requirement: System generates a plan suggestion using LLM

The system SHALL collect existing plans and the last 20 completed workout sessions, construct a prompt, and call the OpenAI Chat Completions API with `response_format: { type: "json_object" }`. The returned JSON SHALL include a `valid` boolean field; if `valid` is false the system SHALL display the model's rejection reason instead of a plan preview. If `valid` is true (or absent), the returned JSON SHALL be parsed into a `WorkoutPlan` object. The modal SHALL orchestrate the loading / preview / rejected / retry states through the shared `useAiStream` hook from `[[ai-stream-primitive]]` rather than a local view enum, and the loading region SHALL be wrapped in an ARIA live region (`role="status"`, `aria-live="polite"`) so assistive tech announces the in-flight state.

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

#### Scenario: Validation rejection shown when preferences are irrelevant

- **WHEN** the LLM returns `valid: false` in its response
- **THEN** the plan modal SHALL display the model's rejection reason (or a fallback locale string) instead of a plan preview
- **AND** the "Regenerate" action SHALL remain available so the user can update preferences and retry
- **AND** no plan data SHALL be created or stored

#### Scenario: Loading region announced via ARIA live region

- **WHEN** the user taps "Generate" and the modal enters the loading state
- **THEN** the loading region SHALL be rendered inside an element with `role="status"` and `aria-live="polite"`
- **AND** assistive tech SHALL receive a polite announcement when the state transitions to loading, done, or error
