## ADDED Requirements

### Requirement: Start screen offers an ad-hoc timed workout entry

The system SHALL present a "Timed workout" entry on the session start screen alongside the existing plan/free options, launching an ad-hoc timed-session configuration flow not tied to any plan.

#### Scenario: Timed workout entry is available

- **WHEN** the session start screen is displayed
- **THEN** a "Timed workout" option is shown alongside "Follow a Plan" and "Free Session"

#### Scenario: Selecting timed workout opens configuration

- **WHEN** the user taps "Timed workout"
- **THEN** the system opens the timed-session configuration flow

### Requirement: User configures the timed mode and its parameters

The configuration flow SHALL let the user pick one of the four modes (`tabata`, `amrap`, `emom`, `for-time`) and set the parameters relevant to that mode. The flow SHALL apply sensible defaults per mode and SHALL only show parameters that apply to the selected mode.

#### Scenario: Tabata parameters

- **WHEN** the user selects `tabata`
- **THEN** the flow exposes work duration, rest duration, and number of rounds, defaulted to a standard 20s/10s/8 configuration

#### Scenario: AMRAP parameters

- **WHEN** the user selects `amrap`
- **THEN** the flow exposes a single total-duration field

#### Scenario: EMOM parameters

- **WHEN** the user selects `emom`
- **THEN** the flow exposes the period length and number of intervals

#### Scenario: For Time parameters

- **WHEN** the user selects `for-time`
- **THEN** the flow exposes the prescribed work and an optional time cap (`capSec`); with no cap it counts up indefinitely

#### Scenario: Irrelevant parameters are hidden

- **WHEN** a mode is selected
- **THEN** only the parameters that apply to that mode are shown

### Requirement: User selects the circuit exercises for the timed session

The configuration flow SHALL let the user pick the ordered exercise(s) that form the timed session's circuit, reusing the existing exercise selection/catalog UI. The selected order SHALL be preserved as the circuit sequence, and one round SHALL be one pass through the full circuit.

#### Scenario: Add exercises to the circuit

- **WHEN** the user picks exercises in the configuration flow
- **THEN** those exercises are attached to the session as the ordered circuit

#### Scenario: Exercise order defines the circuit sequence

- **WHEN** multiple exercises are selected for a circuit (Tabata, EMOM, or AMRAP)
- **THEN** the engine walks them in the selected order, one round per full pass

### Requirement: Launching the ad-hoc timed session starts the engine

Confirming the configuration SHALL create an active session carrying the chosen mode and config and immediately start the timed engine. The session SHALL NOT carry plan references.

#### Scenario: Confirm starts the auto-flow

- **WHEN** the user confirms a valid timed configuration
- **THEN** an active session is created with the mode/config and the timed engine begins in its first phase

#### Scenario: Ad-hoc timed session has no plan origin

- **WHEN** an ad-hoc timed session is created
- **THEN** the session has no `planId` or `planDayId`
