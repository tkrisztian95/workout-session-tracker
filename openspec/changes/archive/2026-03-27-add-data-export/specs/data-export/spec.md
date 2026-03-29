## ADDED Requirements

### Requirement: Export all user data as JSON

The system SHALL provide a way for users to download all their stored data as a single JSON file from the Profile page. The export SHALL include workout plans, session history, and profile data.

#### Scenario: Export card is visible on the profile page

- **WHEN** the user navigates to the Profile page
- **THEN** an "Export Data" card SHALL be visible in the settings section above the Danger Zone card

#### Scenario: Tapping the export button triggers a file download

- **WHEN** the user taps the export button inside the Export Data card
- **THEN** the browser SHALL initiate a download of a file named `workout-data.json` containing all user data

#### Scenario: Exported JSON contains all data categories

- **WHEN** the user downloads the export file
- **THEN** the JSON SHALL contain the following top-level keys: `schemaVersion`, `exportedAt`, `profile`, `plans`, and `sessions`

#### Scenario: Export works when some data is missing

- **WHEN** the user has no workout plans or sessions stored
- **THEN** the export SHALL still succeed and the corresponding keys SHALL contain empty arrays

### Requirement: Export payload is versioned

The exported JSON file SHALL include a `schemaVersion` field to allow future tooling to detect and handle schema changes.

#### Scenario: Schema version is present in every export

- **WHEN** a user downloads the export file
- **THEN** the root JSON object SHALL contain a `schemaVersion` field with a string value (e.g. `"1"`)

#### Scenario: Export timestamp is included

- **WHEN** a user downloads the export file
- **THEN** the root JSON object SHALL contain an `exportedAt` field with an ISO 8601 timestamp representing the time of export
