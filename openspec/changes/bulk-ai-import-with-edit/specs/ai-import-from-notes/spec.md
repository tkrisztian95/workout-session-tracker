## MODIFIED Requirements

### Requirement: AI parses notes into a structured session with normalized exercise names

On submit the system SHALL call the configured LLM with the user's notes, the active UI locale, and a list of exercise names already present in workout history, and return a **list of structured session drafts** (one or more).

#### Scenario: Exercise names translated to active UI language

- **WHEN** the parsed sessions are returned by the LLM
- **THEN** all exercise names in all session drafts SHALL be in the active UI language (e.g., Hungarian when locale is `hu`)

#### Scenario: Inconsistent exercise names deduplicated

- **WHEN** the notes contain the same exercise referred to by different spellings or in different languages
- **THEN** each parsed session SHALL consolidate these into a single exercise entry using a consistent name

#### Scenario: Exercise names aligned to existing history names

- **WHEN** a parsed exercise name closely matches a name already used in workout history
- **THEN** the system SHALL use the existing history name rather than a novel variant

#### Scenario: Loading state shown during AI call

- **WHEN** the LLM call is in flight
- **THEN** a loading indicator SHALL be displayed and the submit button SHALL be disabled

#### Scenario: Error state shown on LLM failure

- **WHEN** the LLM call fails or returns unparseable JSON
- **THEN** an error message SHALL be displayed and the user SHALL be able to edit their notes and retry

### Requirement: User reviews and edits session drafts before saving

After successful parsing the system SHALL display an **editable review step** showing all parsed session drafts. The user SHALL be able to correct any field before saving. The previous read-only confirmation view is replaced by this editable flow.

#### Scenario: Review step shows parsed session drafts

- **WHEN** the LLM returns one or more valid session drafts
- **THEN** the review step SHALL display each draft in an editable session card
- **AND** each card SHALL show the inferred date, duration, and list of exercises with their sets/reps/weights as editable fields

#### Scenario: User can discard the import

- **WHEN** the user taps "Cancel" or "Discard" at any point before saving
- **THEN** no session is saved and the import sheet is dismissed without modifying history

#### Scenario: User confirms and all reviewed sessions are saved

- **WHEN** the user taps "Save" on the review step
- **THEN** all remaining session drafts SHALL be saved to localStorage using the same schema and key as manually created sessions
- **AND** the new sessions SHALL appear in the history list
- **AND** no existing history records SHALL be modified
