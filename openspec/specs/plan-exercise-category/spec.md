### Requirement: Exercises carry an optional typed muscle classification

The `Exercise` and `PlanExercise` data models SHALL each include an optional `muscle` field of a typed enum covering the 12 canonical muscle keys: `chest`, `back`, `shoulders`, `arms`, `quads`, `hamstrings`, `glutes`, `calves`, `abs`, `obliques`, `lower_back`, `cardio`. The field MAY be absent; its absence is valid and indicates no muscle was assigned. The previous free-form `category: string` field is REMOVED from both models.

#### Scenario: Exercise saved with a muscle

- **WHEN** a user adds an exercise and selects a muscle from the picker or accepts a wger-suggested muscle
- **THEN** the saved record includes `muscle` set to one of the 12 canonical keys

#### Scenario: Exercise saved without a muscle

- **WHEN** a user adds an exercise without selecting or inheriting a muscle
- **THEN** the saved record has no `muscle` field

#### Scenario: Type narrows to the canonical enum

- **WHEN** code reads `exercise.muscle` or `planExercise.muscle`
- **THEN** the value SHALL be one of the 12 canonical keys or `undefined` — arbitrary strings SHALL NOT be assignable

### Requirement: Each muscle resolves to exactly one muscle group

The system SHALL provide a static `MUSCLE_TO_GROUP` map that resolves every `Muscle` value to one `MuscleGroup` value (`upper`, `lower`, `core`, or `cardio`). The `group` SHALL NOT be stored on the exercise record — it is derived on demand.

#### Scenario: Group derived from muscle

- **WHEN** a consumer needs the group of an exercise
- **THEN** the system SHALL look up `MUSCLE_TO_GROUP[exercise.muscle]` and return that value

#### Scenario: Group mapping covers all muscles

- **WHEN** any new muscle is added to the `Muscle` union in future
- **THEN** the `MUSCLE_TO_GROUP` map SHALL be exhaustively typed so the TypeScript compiler fails the build until a group is assigned

### Requirement: Muscle auto-filled from wger suggestion

When a user selects an exercise from the wger suggestion dropdown, the muscle inferred for that exercise's wger category SHALL be automatically set as the exercise's `muscle` and persisted on save.

#### Scenario: wger suggestion with a known category

- **WHEN** the user selects a wger suggestion whose category maps to a canonical muscle
- **THEN** the `muscle` field is set to the mapped value
- **THEN** the muscle is persisted when the exercise is saved

#### Scenario: wger "Legs" suggestion defaults to quads

- **WHEN** the user selects a wger suggestion with category `Legs`
- **THEN** the `muscle` field is set to `quads`
- **AND** the user MAY reclassify the muscle via the manual picker before saving

#### Scenario: wger suggestion with no category

- **WHEN** the user selects a wger suggestion that has no category
- **THEN** no muscle is set; the manual muscle picker becomes available

### Requirement: Manual muscle picker groups muscles by tier

`AddPlanExerciseModal` and `AddExerciseModal` SHALL display a muscle picker beneath the exercise name input. The picker SHALL visually group muscles under their `MuscleGroup` (Upper / Lower / Core / Cardio) — for the native `<select>` implementation this means one `<optgroup>` per group. The picker SHALL appear when no suggestion-sourced muscle is active.

#### Scenario: Picker shows all four groups with their muscles

- **WHEN** the picker is visible
- **THEN** it SHALL render four group headers (Upper, Lower, Core, Cardio) localised via `muscle_group_labels`
- **AND** each group SHALL list its muscles localised via `muscle_labels`
- **AND** an empty/none default option SHALL be available

#### Scenario: Picker hidden when suggestion muscle is active

- **WHEN** the user has selected a wger suggestion that provides a muscle
- **THEN** the manual picker is hidden; a read-only muscle label is shown instead

#### Scenario: Manual muscle persisted on save

- **WHEN** the user picks a muscle from the manual picker and submits the form
- **THEN** the exercise is saved with the chosen muscle key

#### Scenario: No muscle selected leaves muscle absent

- **WHEN** the user leaves the muscle picker at its empty/none default and submits the form
- **THEN** the exercise is saved without a `muscle` field

### Requirement: Muscle displayed on plan exercise rows

In the plan detail view, exercise rows for `PlanExercise` entries that have a `muscle` SHALL display the muscle visually (as a small badge or label) near the exercise name. The badge SHALL show the localised muscle label and an icon associated with that muscle.

#### Scenario: Muscle badge visible on plan

- **WHEN** the user views the plan detail page and an exercise has a `muscle` value
- **THEN** the muscle is rendered as a badge or label on the exercise row

#### Scenario: No badge when muscle absent

- **WHEN** the user views the plan detail page and an exercise has no `muscle`
- **THEN** no badge or placeholder is shown for that exercise row

### Requirement: Legacy category values are migrated on first read

When the system loads sessions or plans from localStorage and encounters records that carry the legacy `category` string field, it SHALL rewrite each record's classification into the new `muscle` enum and persist the migrated data back. Migration SHALL be idempotent.

#### Scenario: Legacy category values map to canonical muscles

- **WHEN** a stored record has `category` set to one of `Arms`, `Abs`, `Chest`, `Back`, `Shoulders`, `Calves`, or `Cardio`
- **THEN** the record SHALL be rewritten to carry `muscle` set to the corresponding lowercase canonical key (`arms`, `abs`, `chest`, `back`, `shoulders`, `calves`, `cardio`)
- **AND** the `category` field SHALL be removed

#### Scenario: Legacy "Legs" defaults to quads

- **WHEN** a stored record has `category` set to `Legs`
- **THEN** the record SHALL be rewritten to carry `muscle: 'quads'`

#### Scenario: Legacy "Core" maps to abs

- **WHEN** a stored record has `category` set to `Core` (emitted by older AI prompts)
- **THEN** the record SHALL be rewritten to carry `muscle: 'abs'`

#### Scenario: Unknown legacy values dropped

- **WHEN** a stored record has a `category` value that does not match any known mapping
- **THEN** the record SHALL be rewritten without any `muscle` field

#### Scenario: Already-migrated records left untouched

- **WHEN** a stored record already has a `muscle` field and no `category` field
- **THEN** the record SHALL be left as-is and SHALL NOT trigger an unnecessary localStorage write

### Requirement: User is informed once about the Legs → Quads migration

On the first app load after the muscle taxonomy update, the system SHALL display a one-time, dismissible notice informing the user that `Legs`-tagged exercises were mapped to `Quads` and can be reclassified via the existing edit flow. The notice SHALL NOT reappear after it has been dismissed.

#### Scenario: Notice shown on first load post-update

- **WHEN** the app loads for the first time after the muscle taxonomy update is deployed
- **AND** the user has any sessions or plans that previously contained a `Legs` category
- **THEN** a dismissible notice SHALL be displayed explaining the migration

#### Scenario: Notice not shown when no migration occurred

- **WHEN** the app loads for the first time after the update
- **AND** no records required migration
- **THEN** the notice SHALL NOT be displayed

#### Scenario: Notice does not reappear after dismissal

- **WHEN** the user dismisses the notice
- **THEN** a persistent flag SHALL be stored in localStorage
- **AND** subsequent loads SHALL NOT display the notice again
