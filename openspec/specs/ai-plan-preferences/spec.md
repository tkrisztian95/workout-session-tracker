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
