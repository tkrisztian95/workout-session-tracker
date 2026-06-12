## ADDED Requirements

### Requirement: A plan day or exercise block can be flagged as timed

The plan editor SHALL allow a plan day (or an exercise block within it) to be flagged as a timed block and to carry a timed-mode configuration (mode + parameters) that is persisted with the plan.

#### Scenario: Flag a plan day as timed

- **WHEN** the user enables the timed-block option on a plan day in the editor
- **THEN** the editor exposes mode and parameter controls and persists them on the plan day

#### Scenario: Timed config persists with the plan

- **WHEN** a plan with a timed block is saved and reloaded
- **THEN** the timed-block mode and parameters are restored from storage

#### Scenario: Non-timed days are unaffected

- **WHEN** a plan day is not flagged as timed
- **THEN** it has no timed configuration and behaves exactly as a standard plan day

### Requirement: Timed-block config is validated in the editor

The plan editor SHALL validate timed-block parameters against the selected mode before allowing the plan to be saved, surfacing the same per-mode parameter rules used by the ad-hoc quick-start flow.

#### Scenario: Valid config saves

- **WHEN** the user supplies valid parameters for the selected mode
- **THEN** the plan saves with the timed-block configuration

#### Scenario: Invalid config is rejected

- **WHEN** a required parameter for the selected mode is missing or out of range
- **THEN** the editor blocks saving and indicates the offending field
