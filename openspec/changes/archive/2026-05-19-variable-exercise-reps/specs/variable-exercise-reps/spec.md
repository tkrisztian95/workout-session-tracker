## ADDED Requirements

### Requirement: Per-set rep scheme on an exercise

A `sets-reps` exercise SHALL be able to define a per-set rep scheme via an optional `repsPerSet` array of positive integers, as an alternative to the single fixed `reps` value. An exercise SHALL carry either `reps` (uniform) or `repsPerSet` (variable), never both. When `repsPerSet` is present, `sets` SHALL equal `repsPerSet.length`.

#### Scenario: Uniform reps unchanged

- **WHEN** an exercise has `reps` set and no `repsPerSet`
- **THEN** it SHALL behave exactly as before, targeting the same rep count for every set

#### Scenario: Variable reps defined

- **WHEN** an exercise has `repsPerSet` set to `[15, 12, 8, 4]`
- **THEN** it SHALL represent four sets targeting 15, 12, 8 and 4 reps respectively, and `sets` SHALL be 4

#### Scenario: Existing data has no scheme

- **WHEN** a plan or session stored before this change is loaded
- **THEN** it SHALL have no `repsPerSet` and SHALL continue to use its fixed `reps` value

### Requirement: Authoring a rep scheme

The add/edit exercise UI — in the plan editor and in an active session — SHALL let the user choose, for `sets-reps` exercises, between a fixed rep count and a per-set scheme.

#### Scenario: Switch to per-set mode

- **WHEN** the user selects per-set mode for a `sets-reps` exercise
- **THEN** the UI SHALL present a field to enter the rep scheme and SHALL derive the set count from the number of entries

#### Scenario: Enter a scheme

- **WHEN** the user enters `15, 12, 8, 4` as the scheme and saves
- **THEN** the exercise SHALL be stored with `repsPerSet` `[15, 12, 8, 4]` and `sets` `4`, and without `reps`

#### Scenario: Editing an exercise that has a scheme

- **WHEN** the user opens an exercise that already has `repsPerSet`
- **THEN** the editor SHALL open in per-set mode pre-filled with the existing scheme

#### Scenario: Degenerate scheme falls back to fixed

- **WHEN** the user is in per-set mode but the entered scheme yields fewer than two valid numbers
- **THEN** the exercise SHALL be saved as a fixed-reps exercise using the first valid number

### Requirement: Displaying a rep scheme

Wherever an exercise's rep target is shown — plan exercise rows, the session exercise card, the optional-exercise picker, and the history editors — a variable exercise SHALL display its scheme (e.g. `15/12/8/4`) instead of a single rep count.

#### Scenario: Scheme shown on a plan row

- **WHEN** a plan exercise with `repsPerSet` `[15, 12, 8, 4]` is rendered in the plan editor
- **THEN** its detail line SHALL show the scheme `15/12/8/4`

#### Scenario: Per-set slot targets in a session

- **WHEN** a session exercise with a rep scheme is the active exercise
- **THEN** each unlogged set slot SHALL indicate that set's individual rep target

### Requirement: Logging sets against a scheme

When logging a set for an exercise with a rep scheme, the set-entry form SHALL prefill the reps input with the target of the set about to be logged.

#### Scenario: Prefill the next set's target

- **WHEN** the user opens the set-logging form having already logged 2 of 4 sets of an exercise with scheme `[15, 12, 8, 4]`
- **THEN** the reps input SHALL prefill with `8` (the third set's target)

#### Scenario: Prefill past the end of the scheme

- **WHEN** the user opens the set-logging form having already logged every targeted set
- **THEN** the reps input SHALL prefill with the last scheme entry

### Requirement: AI flows support rep schemes

The AI plan-suggestion and notes-import flows SHALL be able to produce and consume exercises with `repsPerSet`. Exercise summaries sent to the model SHALL render a scheme rather than a fixed count, and parsed responses SHALL be normalised so the `reps` / `repsPerSet` mutual-exclusion invariant holds.

#### Scenario: AI returns a scheme

- **WHEN** the model returns an exercise with a valid non-empty `repsPerSet` array
- **THEN** the exercise SHALL be kept with that `repsPerSet`, `sets` set to its length, and `reps` removed

#### Scenario: AI returns both fields

- **WHEN** the model returns an exercise with both `reps` and a valid `repsPerSet`
- **THEN** `repsPerSet` SHALL take precedence and `reps` SHALL be dropped

### Requirement: Rep schemes round-trip through history

The exercise-history picker and the "new history session" plan prefill SHALL carry `repsPerSet` so that re-using a past exercise preserves its rep scheme.

#### Scenario: Re-using an exercise with a scheme

- **WHEN** the user picks a past exercise that had `repsPerSet` from the history picker
- **THEN** the populated exercise SHALL retain that rep scheme
