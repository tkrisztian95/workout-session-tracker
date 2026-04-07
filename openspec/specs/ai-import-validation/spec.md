## ADDED Requirements

### Requirement: Import agent rejects clearly non-workout input

The import agent SHALL embed a `valid` boolean and an optional `validationError` string in the LLM response schema. When the submitted text is clearly unrelated to a workout session (e.g. a recipe, news article, code snippet, or random prose), the agent SHALL throw an `AiValidationError` with the model's rejection reason instead of returning session data.

#### Scenario: Valid workout notes are accepted

- **WHEN** the user submits free-form text that describes exercises, sets, reps, or a training session
- **THEN** the agent SHALL return parsed session data as normal (no validation error thrown)

#### Scenario: Recipe text is rejected

- **WHEN** the user submits text that describes cooking steps, ingredients, or food preparation
- **THEN** the agent SHALL throw an `AiValidationError` with a human-readable reason (e.g. "This looks like a recipe, not a workout session.")

#### Scenario: Blank or whitespace-only input is rejected before the LLM call

- **WHEN** the submitted text is empty or contains only whitespace
- **THEN** the agent SHALL throw an `AiValidationError` without making an API call

#### Scenario: Ambiguous or sparse notes are accepted by default

- **WHEN** the submitted text is vague but could plausibly be a workout (e.g. "did legs today, felt good")
- **THEN** the agent SHALL NOT reject the input; it SHALL attempt to parse it as a session

#### Scenario: validationError message is in the active UI language

- **WHEN** the agent rejects input with `valid: false`
- **THEN** the `validationError` string SHALL be written in the same language specified for exercise name output

#### Scenario: Missing valid field in response defaults to accepted

- **WHEN** the LLM returns a response that omits the `valid` field
- **THEN** the agent SHALL treat `valid` as `true` and proceed with normal parsing
