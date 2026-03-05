## ADDED Requirements

### Requirement: Sessions are persisted to localStorage
The system SHALL save completed workout sessions to `localStorage` under the key `wst_sessions`.

#### Scenario: Completed session is saved
- **WHEN** user finishes and confirms a workout session
- **THEN** the session is appended to the `wst_sessions` array in localStorage with a timestamp and unique ID

#### Scenario: Discarded session is not saved
- **WHEN** user discards an active session
- **THEN** no session entry is written to localStorage

### Requirement: Active session persisted across page refreshes
The system SHALL persist the in-progress session to `localStorage` under the key `wst_active_session` so it survives accidental refreshes.

#### Scenario: Refresh restores active session
- **WHEN** user refreshes the browser during an active session
- **THEN** the session is restored from `wst_active_session` and the user can continue

#### Scenario: Active session cleared on finish or discard
- **WHEN** user finishes or discards a session
- **THEN** `wst_active_session` is removed from localStorage

### Requirement: Session optionally links to a plan day
A saved session MAY include `planId` and `planDayId` fields when it originated from a plan.

#### Scenario: Plan session includes plan references
- **WHEN** a session started from a plan day is saved
- **THEN** the session object includes `planId` (string) and `planDayId` (string) fields

#### Scenario: Free session omits plan references
- **WHEN** a free session is saved
- **THEN** the session object does not include `planId` or `planDayId` fields
