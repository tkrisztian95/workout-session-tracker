## ADDED Requirements

### Requirement: Swap with AI action on plan exercises

The system SHALL render a "Swap with AI" action on every plan exercise row — core, optional, and shared — whenever an LLM API key is configured. The action SHALL NOT be shown when no API key is configured.

#### Scenario: Swap action shown with AI configured

- **WHEN** the plan editor is opened with an LLM API key stored
- **THEN** each exercise row SHALL show a "Swap with AI" action

#### Scenario: Swap action hidden without AI

- **WHEN** no LLM API key is stored
- **THEN** no exercise row SHALL show a "Swap with AI" action

### Requirement: AI suggests a single replacement exercise

The system SHALL send the full plan, the targeted exercise, its training day (or shared list), and an optional user instruction to the LLM, and receive a single replacement exercise. The replacement SHALL keep the original exercise's role (core or optional).

#### Scenario: Request a swap

- **WHEN** the user triggers "Swap with AI" on an exercise and confirms
- **THEN** the system SHALL display a loading state, call the LLM, and render the suggested replacement alongside the original

#### Scenario: Swap with preferences

- **WHEN** the user enters preferences (e.g. "no equipment") before confirming
- **THEN** the system SHALL include those preferences in the LLM request

#### Scenario: Instruction not fitness-related

- **WHEN** the LLM rejects the request as not fitness-related
- **THEN** the system SHALL display a rejection message and offer to try again

#### Scenario: API failure

- **WHEN** the LLM call fails or returns malformed data
- **THEN** the system SHALL display an error message and let the user retry

### Requirement: User previews and applies the swap

The system SHALL display the original and suggested exercises with any reasoning before changing the plan. Applying the swap SHALL replace the targeted exercise in place, preserving its position and identity; dismissing the modal SHALL leave the exercise unchanged.

#### Scenario: Apply the swap

- **WHEN** the user confirms the suggested replacement
- **THEN** the targeted exercise SHALL be replaced in place with the same role and the modal SHALL close

#### Scenario: Regenerate

- **WHEN** the user chooses to regenerate from the preview
- **THEN** the system SHALL request another replacement suggestion

#### Scenario: Dismiss without applying

- **WHEN** the user closes the modal without applying
- **THEN** the targeted exercise SHALL remain unchanged
