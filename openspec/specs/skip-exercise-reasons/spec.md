# skip-exercise-reasons Specification

## Purpose

Lets users record why they skipped an exercise during a workout — a structured reason and an optional note — so the reason shows up in the session, in history, and in AI feedback, and so repeated pain-driven skips can prompt a plan change.

## Requirements

### Requirement: Skipping opens a reason sheet

When the user taps Skip on the active exercise card, or the dismiss icon on a non-active, non-completed exercise card, the system SHALL open a skip sheet instead of skipping at once. The sheet SHALL show the exercise name, a set of single-select reason chips, an optional note field, a primary Skip action, a Skip without reason action, and a way to cancel. The reason chips SHALL be, in order: Pain / injury, Equipment broken, Equipment busy, Fatigue / low energy, Out of time, Other.

#### Scenario: Sheet opens from the active card

- **WHEN** the user taps Skip on the active exercise card
- **THEN** the skip sheet opens for that exercise
- **AND** the exercise is not yet marked as skipped

#### Scenario: Sheet opens from a queued card

- **WHEN** the user taps the dismiss icon on a queued exercise card
- **THEN** the skip sheet opens for that exercise

#### Scenario: Only one reason can be selected

- **WHEN** the user taps a reason chip and then taps a different chip
- **THEN** only the last tapped chip is selected

#### Scenario: Tapping the selected chip clears it

- **WHEN** the user taps the chip that is already selected
- **THEN** no reason is selected

#### Scenario: Cancel does not skip

- **WHEN** the user closes the sheet without choosing a skip action
- **THEN** the exercise stays in its previous state
- **AND** no reason or note is saved

### Requirement: Skip reason and note are persisted

The system SHALL store the selected reason and the trimmed note on the skipped exercise in the active session, and SHALL carry them into the saved session when the workout finishes. The note SHALL be limited to 200 characters. An empty or whitespace-only note SHALL NOT be stored. Both values SHALL be optional.

#### Scenario: Skip with reason and note

- **WHEN** the user selects Pain / injury, types "left shoulder", and taps Skip
- **THEN** the exercise is marked as skipped with reason Pain / injury and note "left shoulder"

#### Scenario: Skip with note only

- **WHEN** the user types a note, selects no reason, and taps Skip
- **THEN** the exercise is marked as skipped with the note and no reason

#### Scenario: Skip without reason

- **WHEN** the user taps Skip without reason
- **THEN** the exercise is marked as skipped with no reason and no note, even if a chip was selected or a note was typed

#### Scenario: Reason survives finishing the workout

- **WHEN** the user finishes a session that contains a skipped exercise with a reason and note
- **THEN** the saved history session contains the same reason and note on that exercise

#### Scenario: Reason survives page reload

- **WHEN** the user reloads the page during an active session with a skipped exercise that has a reason
- **THEN** the reason and note are still shown for that exercise

#### Scenario: Note length is capped

- **WHEN** the user tries to enter more than 200 characters in the note field
- **THEN** the field accepts no more than 200 characters

### Requirement: Undoing a skip clears the reason

When the user undoes a skip, the system SHALL clear the stored reason and note along with the skipped state.

#### Scenario: Undo clears reason and note

- **WHEN** the user undoes the skip of an exercise that has a reason and note
- **THEN** the exercise is no longer skipped
- **AND** it has no reason and no note
- **AND** skipping it again opens an empty skip sheet

### Requirement: Skip reason and note are displayed

The system SHALL show the localized reason label and the note under each skipped exercise in the live session's Skipped section and in the Skipped section of the history detail page. Skipped exercises with no reason and no note SHALL render as they did before this change.

#### Scenario: Live session shows reason and note

- **WHEN** a skipped exercise has reason Equipment broken and note "cable snapped"
- **THEN** its card in the Skipped section shows "Equipment broken" and "cable snapped"

#### Scenario: History detail shows reason

- **WHEN** the user opens a history session with a skipped exercise that has reason Out of time
- **THEN** the Skipped section shows "Out of time" under that exercise

#### Scenario: Legacy skipped exercise

- **WHEN** a saved session has a skipped exercise with no reason and no note
- **THEN** the exercise renders with no reason line

#### Scenario: Labels follow the app language

- **WHEN** the app language is Hungarian or German
- **THEN** reason labels are shown in that language
- **AND** the user-written note is shown as written

### Requirement: Pain streak hint on the active exercise

When an exercise becomes the active exercise in a session, the system SHALL check the saved history for earlier appearances of an exercise with the same name, compared case-insensitively and ignoring surrounding whitespace. If the two most recent earlier appearances were both skipped with reason Pain / injury, the active exercise card SHALL show a hint that the exercise was skipped for pain in the last two sessions and that the user may want to swap it in the plan. The hint SHALL NOT block logging, completing, or skipping the exercise.

#### Scenario: Two consecutive pain skips show the hint

- **WHEN** the last two saved sessions that contain "Bench Press" both have it skipped with reason Pain / injury
- **AND** "Bench Press" becomes the active exercise
- **THEN** the active card shows the pain streak hint

#### Scenario: Streak broken by a completed appearance

- **WHEN** the most recent saved appearance of "Bench Press" was completed and the one before it was skipped for pain
- **THEN** no pain streak hint is shown

#### Scenario: Other reasons do not count

- **WHEN** the last two appearances were skipped with reasons Equipment busy and Pain / injury
- **THEN** no pain streak hint is shown

#### Scenario: Only one earlier appearance

- **WHEN** the exercise appears only once in history, skipped for pain
- **THEN** no pain streak hint is shown

#### Scenario: Name match ignores case

- **WHEN** history contains two pain skips of "bench press" and the active exercise is "Bench Press"
- **THEN** the pain streak hint is shown
