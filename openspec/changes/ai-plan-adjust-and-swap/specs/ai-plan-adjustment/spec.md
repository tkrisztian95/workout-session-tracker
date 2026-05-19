## ADDED Requirements

### Requirement: Adjust with AI entry point in the plan editor

The system SHALL render an "Adjust with AI" button in the plan editor whenever an LLM API key is configured. The button SHALL NOT be shown when no API key is configured.

#### Scenario: Button shown with AI configured

- **WHEN** the plan editor is opened and an LLM API key is stored
- **THEN** an "Adjust with AI" button SHALL be visible

#### Scenario: Button hidden without AI

- **WHEN** the plan editor is opened and no LLM API key is stored
- **THEN** the "Adjust with AI" button SHALL NOT be rendered

### Requirement: AI adjusts the plan from a preset or instruction

The system SHALL let the user choose a quick-adjustment preset (increase intensity, make it easier, add volume, shorter sessions, more variety, beginner-friendly) and/or enter a free-text instruction, then send the current plan and the instruction to the LLM. Generation SHALL be disabled until at least one preset or non-empty instruction is provided.

#### Scenario: Generate with a preset

- **WHEN** the user selects a preset and confirms
- **THEN** the system SHALL display a loading state, call the LLM with the current plan and the preset instruction, and render a preview of the reworked plan

#### Scenario: Generate with a custom instruction

- **WHEN** the user types a free-text instruction and confirms
- **THEN** the system SHALL call the LLM with the current plan and that instruction

#### Scenario: No instruction provided

- **WHEN** neither a preset nor a custom instruction is provided
- **THEN** the generate action SHALL be disabled

#### Scenario: Instruction not fitness-related

- **WHEN** the LLM rejects the instruction as not fitness-related
- **THEN** the system SHALL display a rejection message and offer to try again

#### Scenario: API failure

- **WHEN** the LLM call fails or returns malformed data
- **THEN** the system SHALL display an error message and let the user retry

### Requirement: User previews and applies the adjusted plan

The system SHALL display the reworked plan and any reasoning in a preview before changing the editor. Applying the adjustment SHALL replace the plan name, days, shared exercises, and scheduled weeks in the editor without saving; dismissing the modal SHALL leave the plan unchanged.

#### Scenario: Apply adjustment

- **WHEN** the user confirms the previewed adjustment
- **THEN** the editor SHALL be populated with the reworked plan and the modal SHALL close

#### Scenario: Regenerate

- **WHEN** the user chooses to regenerate from the preview
- **THEN** the system SHALL return to the instruction step for another attempt

#### Scenario: Dismiss without applying

- **WHEN** the user closes the modal without applying
- **THEN** the plan in the editor SHALL remain unchanged
