## ADDED Requirements

### Requirement: Sessions record their timed-mode metadata

The system SHALL persist additive timed-mode metadata on both the active session (`wst_active_session`) and the saved session (`wst_sessions`) so a session records how it was driven. The metadata SHALL include the mode (`tabata`, `amrap`, `emom`, or `for-time`) and the interval configuration (e.g. work/rest durations, rounds, period, total duration) relevant to that mode. Sessions without timed metadata SHALL continue to be treated as standard manually-tracked sessions.

#### Scenario: Active timed session persists mode and config

- **WHEN** a timed session is started
- **THEN** the active session in localStorage includes the mode and its interval configuration

#### Scenario: Saved timed session retains mode and config

- **WHEN** a timed session is finished and saved
- **THEN** the saved `WorkoutSession` includes the mode and configuration used

#### Scenario: Standard sessions omit timed metadata

- **WHEN** a standard (manually tracked) session is saved
- **THEN** the session object carries no timed-mode metadata and reads back as a standard session

#### Scenario: Legacy sessions remain readable

- **WHEN** a session saved before this change (no timed metadata) is read
- **THEN** it loads successfully and is treated as a standard session

### Requirement: Export schema version is bumped for timed metadata

The system SHALL bump the `ExportPayload` `schemaVersion` to account for the additive timed-mode fields, and the export/import round-trip SHALL preserve timed metadata while still importing older payloads.

#### Scenario: Export includes timed metadata

- **WHEN** data containing timed sessions is exported
- **THEN** the export payload uses the bumped `schemaVersion` and includes each session's timed metadata

#### Scenario: Older export payloads still import

- **WHEN** an export payload from a previous schema version is imported
- **THEN** the import succeeds and its sessions are treated as standard sessions
