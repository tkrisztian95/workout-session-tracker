## ADDED Requirements

### Requirement: Timed sessions log sets via the engine instead of manual taps

When a session is running in a timed mode, the system SHALL drive set logging from the timed engine — auto-writing a `LoggedSet` on each work-phase completion — rather than requiring the user to open the manual "Log Set" / "Log Time" form for every set. Manual editing of logged sets SHALL remain available after the fact.

#### Scenario: Auto-log replaces manual ticking in timed mode

- **WHEN** a session is running in a timed mode and a work phase completes
- **THEN** the set is logged automatically without the user opening the manual logging form

#### Scenario: Manual edit still available after auto-log

- **WHEN** a set has been auto-logged during a timed session
- **THEN** the user can still adjust its values using the existing set-editing flow

#### Scenario: Standard sessions keep manual logging

- **WHEN** a session is running in standard (non-timed) mode
- **THEN** set logging continues to require explicit user taps as before

### Requirement: Timed sessions surface engine state in the active session UI

The active session screen SHALL display the engine-driven state for a timed session — the large phase clock (count-down or count-up), the current phase (work/rest), and the round/interval tracker — in place of or alongside the standard per-exercise card controls.

#### Scenario: Live phase clock and tracker shown

- **WHEN** a timed session is active
- **THEN** the session screen shows the phase clock, current phase indicator, and round/interval progress

#### Scenario: Standard session UI unchanged

- **WHEN** a standard session is active
- **THEN** the session screen shows the existing per-exercise cards and manual controls with no timed UI
