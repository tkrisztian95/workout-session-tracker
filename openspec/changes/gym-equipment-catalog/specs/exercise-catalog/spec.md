## ADDED Requirements

### Requirement: Built-in localized exercise catalog

The system SHALL provide a fixed, code-defined catalog of exercises. Each
catalog entry SHALL have a stable id, a muscle from the app's muscle taxonomy, a
default exercise type, and type-appropriate default sets/reps/duration. Each
entry SHALL have a display name localized in every supported locale
(`en`, `hu`, `de`). The catalog SHALL be read-only in this version: there SHALL
be no in-app creation, editing, or deletion of catalog entries and no new
persisted storage.

#### Scenario: Every entry is fully localized

- **WHEN** the catalog is loaded
- **THEN** every entry SHALL resolve to a non-empty display name in each
  supported locale

#### Scenario: Entry defaults match its type

- **WHEN** a catalog entry has type `sets-reps`
- **THEN** it SHALL provide default sets and reps
- **WHEN** a catalog entry has type `sets-duration` or `duration`
- **THEN** it SHALL provide a default duration

#### Scenario: Catalog name falls back to id

- **WHEN** a catalog entry's localized name is missing for the active locale
- **THEN** the system SHALL display the entry's id rather than an empty string

### Requirement: Pick from catalog in the Add Exercise flow

The system SHALL offer a "Pick from catalog" action in both the in-session Add
Exercise modal and the plan Add Exercise modal, alongside the existing "Pick
from history" action. Selecting a catalog entry SHALL pre-fill the exercise form
with the entry's localized name, muscle, type, and default sets/reps/duration,
leaving the user free to edit any field before saving.

#### Scenario: Catalog action available in both modals

- **WHEN** the user opens the Add Exercise modal from a session or from the plan
  editor
- **THEN** a "Pick from catalog" action SHALL be shown next to "Pick from
  history"

#### Scenario: Selecting an entry pre-fills the form

- **WHEN** the user picks an entry from the catalog
- **THEN** the catalog picker SHALL close and the Add Exercise form SHALL be
  populated with that entry's localized name, muscle, type, and defaults

#### Scenario: Pre-filled values remain editable

- **WHEN** the form has been pre-filled from a catalog entry
- **THEN** the user SHALL be able to change any field before saving, and saving
  SHALL produce an ordinary exercise with the final field values

#### Scenario: Dismiss without selecting

- **WHEN** the user closes the catalog picker without choosing an entry
- **THEN** the Add Exercise form SHALL be left unchanged

### Requirement: Browse the catalog on a standalone screen

The system SHALL provide a standalone screen that lists every catalog entry
grouped by muscle group, each shown with its localized name and muscle, and
SHALL provide a search box to filter entries by name. The screen SHALL be
reachable from the Profile page.

#### Scenario: Entries grouped by muscle group

- **WHEN** the user opens the catalog browse screen
- **THEN** entries SHALL be listed grouped by muscle group with each entry's
  localized name and muscle shown

#### Scenario: Search filters the list

- **WHEN** the user types a query into the catalog search box
- **THEN** only entries whose localized name matches the query SHALL be shown

#### Scenario: Reachable from Profile

- **WHEN** the user is on the Profile page
- **THEN** there SHALL be a link that opens the catalog browse screen
