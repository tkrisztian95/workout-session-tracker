## ADDED Requirements

### Requirement: Starting a timed-flagged plan day launches the auto-flow

When the user starts a session from a plan day (or block) flagged as a timed block, the system SHALL create the active session with that block's timed mode and configuration and start the timed engine, rather than the standard manual tracking flow. The session SHALL still record its plan origin (`planId`, `planDayId`).

#### Scenario: Timed plan day routes into auto-flow

- **WHEN** the user starts a session from a plan day flagged as a timed block
- **THEN** the active session is created with the block's mode/config and the timed engine starts in its first phase

#### Scenario: Timed plan session keeps plan origin

- **WHEN** a timed plan-day session is created
- **THEN** the session records `planId` and `planDayId` as a normal plan session does

#### Scenario: Non-timed plan day unchanged

- **WHEN** the user starts a session from a plan day that is not flagged as timed
- **THEN** the standard manual tracking flow starts as before
