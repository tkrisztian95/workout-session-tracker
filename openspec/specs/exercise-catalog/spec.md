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

### Requirement: Disambiguate similar entries with aliases and hints

To help users who cannot tell near-identical machines apart, the catalog SHALL
support optional, localized alternative names (aliases) and a short
disambiguating hint per entry. Clear duplicates SHALL be represented as a single
canonical entry whose alternative labels are aliases rather than separate
entries. Catalog search SHALL match an entry by its name, aliases, or hint in
any supported locale, so a query in one language finds an entry shown in
another. The picker and browse screen SHALL show an entry's hint and "also
called" aliases when present.

#### Scenario: Duplicate machine is a single entry

- **WHEN** two notes refer to the same machine under different names (e.g.
  "Glute machine" and "Glute trainer")
- **THEN** the catalog SHALL contain one entry, and the other name SHALL be an
  alias of it rather than a separate entry

#### Scenario: Search matches an alias

- **WHEN** the user searches for an alias of an entry (e.g. "vertical bench
  press" for the chest press machine)
- **THEN** the canonical entry SHALL appear in the results

#### Scenario: Cross-locale search

- **WHEN** the user searches using an entry's name from a non-active locale
  (e.g. the German "Beinpresse" while the UI is English)
- **THEN** the matching entry SHALL appear in the results

#### Scenario: Hint and aliases shown

- **WHEN** an entry with a hint and/or aliases is listed in the picker or browse
  screen
- **THEN** its hint and "also called" alias names SHALL be shown beneath its name

### Requirement: Difficulty annotation

Every catalog entry SHALL carry a difficulty level of `beginner`,
`intermediate`, or `advanced`, with a localized label in every supported locale.
The difficulty SHALL be shown as a badge alongside the muscle badge in both the
picker and the browse screen.

#### Scenario: Every entry has a difficulty

- **WHEN** the catalog is loaded
- **THEN** each entry SHALL have one of the levels beginner, intermediate, or
  advanced

#### Scenario: Difficulty badge shown

- **WHEN** an entry is listed in the picker or browse screen
- **THEN** its difficulty SHALL be shown as a localized badge next to its muscle

### Requirement: Filter the catalog by muscle group and difficulty

The picker and the browse screen SHALL provide filter chips for muscle group and
for difficulty. Selection SHALL be multi-select within each dimension, and an
empty selection for a dimension SHALL impose no constraint on it. The active
filters SHALL combine with the text search and with each other using AND logic.

#### Scenario: Filter chips shown alongside search

- **WHEN** the user opens the catalog picker or browse screen
- **THEN** muscle-group and difficulty filter chips SHALL be shown near the
  search box

#### Scenario: Multi-select within a dimension

- **WHEN** the user selects more than one chip in the same dimension
- **THEN** entries matching ANY of the selected chips in that dimension SHALL be
  shown

#### Scenario: Filters and search combine with AND

- **WHEN** the user has a text query and one or more filter chips active
- **THEN** only entries that match the query AND every active dimension SHALL be
  shown

#### Scenario: No filters means no constraint

- **WHEN** no chip in a dimension is selected
- **THEN** that dimension SHALL NOT restrict the results
