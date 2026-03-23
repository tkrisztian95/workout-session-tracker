## MODIFIED Requirements

### Requirement: History page provides a way to create a manual session record

The system SHALL display a button on the History page that opens a new-session creation sheet.

#### Scenario: New session button is visible on History page

- **WHEN** the user is on the History page
- **THEN** a button to create a new past session is visible (e.g., a "+" icon or "New session" label)

#### Scenario: Opening the creation sheet

- **WHEN** the user taps the new session button
- **THEN** a bottom sheet opens for creating a new past workout session

### Requirement: Type-select step offers up to three entry modes

The type-select step SHALL offer "From plan", "Free entry", and optionally "Import from notes (AI)" entry modes. The AI import option SHALL only appear when a valid LLM config exists.

#### Scenario: Two options shown without LLM config

- **WHEN** the type-select step is displayed
- **AND** no valid LLM config is saved
- **THEN** exactly two options SHALL be shown: "From plan" and "Free entry"

#### Scenario: Three options shown with LLM config

- **WHEN** the type-select step is displayed
- **AND** a valid LLM config with a non-empty API key is saved
- **THEN** three options SHALL be shown: "From plan", "Free entry", and "Import from notes (AI)"
