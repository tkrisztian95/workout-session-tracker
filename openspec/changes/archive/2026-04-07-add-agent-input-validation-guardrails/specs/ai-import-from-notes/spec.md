## MODIFIED Requirements

### Requirement: AI parses notes into a structured session with normalized exercise names

On submit the system SHALL validate that the notes are fitness-related and then call the configured LLM with the user's notes, the active UI locale, and a list of exercise names already present in workout history, and return a structured session draft. If the notes are not fitness-related, the system SHALL display a rejection message and allow the user to edit their input.

#### Scenario: Exercise names translated to active UI language

- **WHEN** the parsed session is returned by the LLM
- **THEN** all exercise names SHALL be in the active UI language (e.g., Hungarian when locale is `hu`)

#### Scenario: Inconsistent exercise names deduplicated

- **WHEN** the notes contain the same exercise referred to by different spellings or in different languages
- **THEN** the parsed session SHALL consolidate these into a single exercise entry using a consistent name

#### Scenario: Exercise names aligned to existing history names

- **WHEN** a parsed exercise name closely matches a name already used in workout history
- **THEN** the system SHALL use the existing history name rather than a novel variant

#### Scenario: Loading state shown during AI call

- **WHEN** the LLM call is in flight
- **THEN** a loading indicator SHALL be displayed and the submit button SHALL be disabled

#### Scenario: Error state shown on LLM failure

- **WHEN** the LLM call fails or returns unparseable JSON
- **THEN** an error message SHALL be displayed and the user SHALL be able to edit their notes and retry

#### Scenario: Validation rejection shown when input is not a workout

- **WHEN** the LLM returns `valid: false` in its response
- **THEN** the import sheet SHALL display the model's rejection reason (or a fallback locale string) instead of a session draft
- **AND** the submit button SHALL be re-enabled so the user can edit their notes and resubmit
- **AND** no session data SHALL be created or stored
