## ADDED Requirements

### Requirement: Body metrics included in AI plan generation prompt

When age, height, or weight values are stored, `buildPlanSuggestionPrompt` SHALL include them in the prompt preamble alongside the existing sex field. Each metric SHALL be conditionally included only when its value is non-null.

#### Scenario: Age is included in prompt when set

- **WHEN** `getAge()` returns a non-null value and the user requests a new plan
- **THEN** the prompt sent to the AI SHALL include a line stating the user's age in years

#### Scenario: Age is omitted from prompt when not set

- **WHEN** `getAge()` returns `null` and the user requests a new plan
- **THEN** the prompt SHALL NOT include an age field

#### Scenario: Height is included in prompt when set

- **WHEN** `getHeightCm()` returns a non-null value and the user requests a new plan
- **THEN** the prompt sent to the AI SHALL include a line stating the user's height in cm

#### Scenario: Height is omitted from prompt when not set

- **WHEN** `getHeightCm()` returns `null` and the user requests a new plan
- **THEN** the prompt SHALL NOT include a height field

#### Scenario: Weight is included in prompt when set

- **WHEN** `getWeightKg()` returns a non-null value and the user requests a new plan
- **THEN** the prompt sent to the AI SHALL include a line stating the user's weight in kg

#### Scenario: Weight is omitted from prompt when not set

- **WHEN** `getWeightKg()` returns `null` and the user requests a new plan
- **THEN** the prompt SHALL NOT include a weight field

#### Scenario: All four body metrics appear together when all are set

- **WHEN** age, height, weight, and sex are all set and the user requests a new plan
- **THEN** all four values SHALL appear in the prompt preamble before the session history
