## ADDED Requirements

### Requirement: User can optionally specify training preferences before generating an AI plan

The AI Plan Suggestion modal config view SHALL display an optional preferences section below the model selector. The section SHALL contain three fields: Training Focus, Days per Week, and Fitness Goal. All fields SHALL be optional — leaving them unset is valid and results in no preference constraint being sent to the AI.

#### Scenario: User generates a plan with no preferences set

- **WHEN** the user taps "Save & Generate" with no preference fields selected
- **THEN** the AI plan is generated using only session history and existing plans, with no preference text in the prompt

#### Scenario: User selects a training focus

- **WHEN** the user selects a training focus option (e.g. Strength, Hypertrophy, Endurance, Flexibility, Weight loss)
- **THEN** the selected focus is included in the AI prompt as a training preference

#### Scenario: User selects days per week

- **WHEN** the user selects a days-per-week option (e.g. 2, 3, 4, 5+)
- **THEN** the selected frequency is included in the AI prompt as a scheduling preference

#### Scenario: User selects a fitness goal

- **WHEN** the user selects a fitness goal option (e.g. Build muscle, Lose weight, Improve cardio, Maintain fitness)
- **THEN** the selected goal is included in the AI prompt as a goal preference

#### Scenario: User selects multiple preferences

- **WHEN** the user selects values for two or more preference fields and taps "Save & Generate"
- **THEN** all selected preferences are combined and included in the AI prompt together

#### Scenario: Preferences are not retained after generation

- **WHEN** the user taps "Regenerate" or reopens the modal
- **THEN** all preference fields are reset to their default (unset) state

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
