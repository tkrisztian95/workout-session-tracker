## ADDED Requirements

### Requirement: Timed-session cue preferences on profile settings screen

The profile settings screen SHALL include an opt-in cue preference for timed-session phase transitions, controlling whether an audible chime and/or device vibration fires in addition to the always-on visual cue. The preference SHALL be persisted in localStorage and SHALL be a single shared setting that the rest-timer feature (issue #49) reuses rather than introducing a parallel one.

#### Scenario: Cue preference card appears on profile screen

- **WHEN** the user navigates to the profile settings screen
- **THEN** a cue preference control (chime / vibration toggles) SHALL be visible

#### Scenario: Cue preference pre-filled with stored value

- **WHEN** the user opens the profile screen and a cue preference is already stored
- **THEN** the control SHALL display the stored opt-in state

#### Scenario: Changing and saving cue preference updates localStorage

- **WHEN** the user changes the chime/vibration opt-in and saves
- **THEN** the stored cue preference SHALL be updated in localStorage

#### Scenario: Disabled cues suppress chime and vibration

- **WHEN** the cue preference is disabled and a timed phase transition occurs
- **THEN** only the visual cue fires; no chime or vibration is produced

#### Scenario: Setting is shared with the rest timer

- **WHEN** the rest-timer feature emits a transition cue
- **THEN** it reads the same persisted cue preference rather than a separate setting
