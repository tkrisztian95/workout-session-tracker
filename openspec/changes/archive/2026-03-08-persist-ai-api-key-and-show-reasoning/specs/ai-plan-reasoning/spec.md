## ADDED Requirements

### Requirement: AI returns reasoning with the plan

The `suggestPlan` function SHALL request a `reasoning` field (1–3 sentences) from the AI alongside the plan JSON, explaining why the suggested plan suits the user's history and goals.

#### Scenario: AI includes reasoning in response

- **WHEN** the AI successfully returns a plan
- **AND** the response includes a `reasoning` field
- **THEN** the reasoning string is returned alongside the plan data

#### Scenario: AI omits reasoning field

- **WHEN** the AI returns a plan without a `reasoning` field
- **THEN** the plan is still accepted and used normally
- **AND** no reasoning text is displayed in the UI

### Requirement: Reasoning is displayed in the preview

The preview view SHALL display the AI's reasoning text prominently above the plan summary card, so the user understands why this plan was suggested before deciding to use it.

#### Scenario: Reasoning shown in preview with text

- **WHEN** the preview view is displayed
- **AND** a non-empty `reasoning` string was returned by the AI
- **THEN** the reasoning text is shown above the plan summary

#### Scenario: Reasoning absent in preview

- **WHEN** the preview view is displayed
- **AND** no `reasoning` string was returned
- **THEN** no reasoning section is rendered (no empty placeholder shown)
