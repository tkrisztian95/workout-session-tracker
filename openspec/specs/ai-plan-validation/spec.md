## ADDED Requirements

### Requirement: Plan agent rejects clearly irrelevant preferences text

The plan agent SHALL embed a `valid` boolean and an optional `validationError` string in the LLM response schema. When the user's free-text preferences/goals contain content that is clearly unrelated to fitness (e.g. grocery lists, random text, programming questions), the agent SHALL throw an `AiValidationError` with the model's rejection reason instead of returning a plan.

#### Scenario: Fitness-relevant preferences are accepted

- **WHEN** the user provides preferences such as training focus, days per week, or a fitness goal
- **THEN** the agent SHALL return a generated plan as normal

#### Scenario: Completely irrelevant preferences text is rejected

- **WHEN** the user's goals/preferences field contains text with no fitness relevance (e.g. "buy milk, call dentist")
- **THEN** the agent SHALL throw an `AiValidationError` with a human-readable reason

#### Scenario: Empty preferences are accepted

- **WHEN** the user provides no preferences text
- **THEN** the agent SHALL proceed with plan generation using only history context; no validation error is thrown

#### Scenario: Missing valid field in response defaults to accepted

- **WHEN** the LLM returns a response that omits the `valid` field
- **THEN** the agent SHALL treat `valid` as `true` and proceed with normal plan parsing
