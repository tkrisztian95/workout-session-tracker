### Requirement: AI import option is visible only when LLM config is present

The type-select step of the new-session sheet SHALL display an "Import from notes (AI)" option if and only if a valid LLM config (non-empty API key) is saved in localStorage.

#### Scenario: Import option shown when config exists

- **WHEN** the user opens the new-session sheet
- **AND** a saved LLM config with a non-empty API key exists in localStorage
- **THEN** a third entry option labeled "Import from notes" (or locale equivalent) SHALL be visible in the type-select step

#### Scenario: Import option hidden when no config

- **WHEN** the user opens the new-session sheet
- **AND** no LLM config exists or the API key is empty
- **THEN** the AI import option SHALL NOT be visible in the type-select step

### Requirement: User can paste workout notes for AI parsing

When the AI import option is selected, the system SHALL open an import sheet with a text area where the user can paste free-form workout notes.

#### Scenario: Import sheet opens on option tap

- **WHEN** the user taps the "Import from notes" option
- **THEN** an import sheet opens containing a multiline text input and a submit button

#### Scenario: Submit button is disabled when notes are empty

- **WHEN** the import sheet is open and the text area is empty
- **THEN** the submit/import button SHALL be disabled

#### Scenario: Submit button is enabled when notes are non-empty

- **WHEN** the user has entered at least one character in the text area
- **THEN** the submit/import button SHALL be enabled

### Requirement: AI parses notes into a structured session with normalized exercise names

On submit the system SHALL call the configured LLM with the user's notes, the active UI locale, and a list of exercise names already present in workout history, and return a structured session draft.

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

### Requirement: User reviews a confirmation step before the session is saved

After successful parsing the system SHALL display a confirmation view showing the parsed session details (date, duration, exercise list) before any data is written to localStorage.

#### Scenario: Confirmation view shows parsed session details

- **WHEN** the LLM returns a valid session
- **THEN** the confirmation view SHALL display the inferred date, duration, and list of exercises with their sets/reps/weights

#### Scenario: User can discard the import

- **WHEN** the user taps "Cancel" or "Discard" on the confirmation view
- **THEN** no session is saved and the import sheet is dismissed without modifying history

#### Scenario: User confirms and session is saved

- **WHEN** the user taps "Save" on the confirmation view
- **THEN** the parsed session SHALL be saved to localStorage using the same schema and key as manually created sessions
- **AND** the new session SHALL appear in the history list
- **AND** no existing history records SHALL be modified

### Requirement: AI import uses the same session schema as manual records

Sessions created via AI import SHALL be structurally identical to manually created sessions and SHALL NOT introduce new fields or break existing history consumers.

#### Scenario: Imported session has required fields

- **WHEN** an AI-imported session is saved
- **THEN** it SHALL have a unique `id`, `startedAt`, `completedAt`, and a non-empty `exercises` array

#### Scenario: Imported session appears in history filters

- **WHEN** an AI-imported session is saved
- **THEN** it SHALL be visible in the history list and subject to the same date-range and other filters as manually created sessions
