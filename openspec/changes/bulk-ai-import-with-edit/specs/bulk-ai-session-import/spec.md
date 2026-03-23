## ADDED Requirements

### Requirement: User can paste notes describing multiple sessions in a single import

The AI import text area SHALL accept free-form notes that describe any number of workout sessions separated by natural language markers (e.g., different dates, "Day 1 / Day 2", blank lines between sessions).

#### Scenario: Single session notes still work

- **WHEN** the user pastes notes that describe only one session
- **THEN** the system SHALL parse and return exactly one session draft
- **AND** the behaviour SHALL be identical to the previous single-session flow

#### Scenario: Multi-session notes are parsed into multiple drafts

- **WHEN** the user pastes notes that describe two or more sessions
- **THEN** the system SHALL return an ordered list of session drafts, one per identified session
- **AND** each draft SHALL have its own inferred date, duration, and exercise list

#### Scenario: Sessions are ordered chronologically in the result

- **WHEN** the parsed notes contain sessions with identifiable dates
- **THEN** the returned list SHALL be ordered from oldest to newest

### Requirement: LLM returns a structured list of sessions

The system SHALL send a prompt that instructs the LLM to return a JSON array of session objects rather than a single session object.

#### Scenario: Response schema is an array

- **WHEN** the LLM call succeeds
- **THEN** the parsed response SHALL be a JSON array where each element conforms to the single-session draft schema (id, startedAt, completedAt, exercises)

#### Scenario: Single-element array for single-session input

- **WHEN** the user's notes describe only one session
- **THEN** the LLM response array SHALL contain exactly one element

#### Scenario: Error shown when response is not a valid array

- **WHEN** the LLM returns a response that cannot be parsed as a JSON array of sessions
- **THEN** an error message SHALL be displayed and the user SHALL be able to edit their notes and retry

### Requirement: All sessions in a bulk import are saved atomically on confirmation

When the user confirms the import, all reviewed sessions SHALL be written to localStorage in a single operation.

#### Scenario: All drafts saved on confirm

- **WHEN** the user confirms the bulk import
- **THEN** every session draft in the review list SHALL be saved to localStorage using the existing session schema
- **AND** all newly saved sessions SHALL immediately appear in the history list

#### Scenario: No sessions are saved if the user cancels

- **WHEN** the user cancels or dismisses the import at any point before confirming
- **THEN** no sessions SHALL be written to localStorage
- **AND** no existing history records SHALL be modified
