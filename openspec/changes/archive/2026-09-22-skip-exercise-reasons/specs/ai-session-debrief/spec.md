## ADDED Requirements

### Requirement: Skip reasons in debrief input

When the finished session contains skipped exercises, the facts sent to the model for the debrief SHALL list each skipped exercise by name with its skip reason and skip note when present. The debrief system prompt SHALL instruct the model that it may acknowledge a pain or injury skip with a brief, non-medical remark, and SHALL NOT give medical advice or diagnoses. Skipped exercises without a reason SHALL still be listed by name.

#### Scenario: Pain skip reaches the prompt

- **WHEN** a session finishes with "Overhead Press" skipped for Pain / injury with note "right shoulder"
- **THEN** the debrief request includes "Overhead Press", the pain reason, and the note "right shoulder"

#### Scenario: Skip without reason reaches the prompt

- **WHEN** a session finishes with an exercise skipped without a reason
- **THEN** the debrief request lists that exercise as skipped with no reason

#### Scenario: No skips

- **WHEN** a session finishes with no skipped exercises
- **THEN** the debrief request contains no skipped-exercise section
