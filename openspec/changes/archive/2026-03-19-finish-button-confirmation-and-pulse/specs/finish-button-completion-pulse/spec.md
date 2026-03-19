## ADDED Requirements

### Requirement: Finish button pulses when all exercises are complete

When all exercises in the session are either completed or dismissed (and the session has at least one exercise), the Finish button SHALL display a continuous pulsing visual effect to signal that the session is ready to be finished.

#### Scenario: Pulse applied when all exercises are done

- **WHEN** all exercises in the session are completed or dismissed
- **AND** the session has at least one exercise
- **THEN** the Finish button SHALL display a pulsing animation

#### Scenario: No pulse when exercises remain

- **WHEN** at least one exercise is neither completed nor dismissed
- **THEN** the Finish button SHALL NOT display a pulsing animation

#### Scenario: No pulse on session with no exercises

- **WHEN** the session has zero exercises
- **THEN** the Finish button SHALL NOT display a pulsing animation regardless of remaining count
