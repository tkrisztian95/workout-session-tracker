### Requirement: Pick from history available in in-session add-exercise flow

The system SHALL provide a "Pick from history" entry point in the in-session add-exercise modal that opens an exercise history picker. The picker SHALL be reachable without leaving the active session.

#### Scenario: Picker entry point visible in active session

- **WHEN** the user has an active session in progress and opens the add-exercise modal
- **THEN** a "Pick from history" button is visible in the modal
- **AND** the manual name input and existing wger-based suggestions remain accessible

#### Scenario: Opening the picker

- **WHEN** the user taps the "Pick from history" button
- **THEN** the exercise history picker opens
- **AND** the underlying add-exercise modal stays in memory so its state is preserved when the picker closes

### Requirement: Pick from history available in plan editor

The system SHALL provide the same "Pick from history" entry point when adding an exercise to a plan day's core or optional list, and when adding to a plan's shared exercises list.

#### Scenario: Picker entry point visible in plan editor

- **WHEN** the user opens the add-exercise modal from a plan day or from the shared-exercises section
- **THEN** a "Pick from history" button is visible in that modal

### Requirement: History list derived from local sessions and plans

The system SHALL build the history list at picker open time by reading completed sessions and saved plans from local storage. The list SHALL NOT depend on any network call.

#### Scenario: History reflects current local data

- **WHEN** the picker opens
- **THEN** the list contains an entry for every distinct exercise found in the user's completed sessions, plan day exercises, and plan shared exercises
- **AND** the network is not contacted

#### Scenario: Empty history shows guidance

- **WHEN** the picker opens and the user has no completed sessions and no plans containing exercises
- **THEN** the picker displays an empty-state message explaining that history will appear after the user adds exercises to plans or completes sessions
- **AND** the user can close the picker and return to the previous modal

### Requirement: De-duplication by name and category

The system SHALL collapse multiple occurrences of the same exercise into a single picker entry, keyed on the trimmed lowercased name combined with the category. Different categories for the same name SHALL remain distinct entries.

#### Scenario: Same name and category collapse

- **WHEN** the user has logged "Bench Press" with category "Chest" in three different sessions
- **THEN** only one "Bench Press" / "Chest" entry appears in the picker

#### Scenario: Same name with different categories stay separate

- **WHEN** the user has one entry "Squat" with category "Legs" and another "Squat" with no category
- **THEN** the picker shows both as distinct rows

#### Scenario: Display name preserves original casing

- **WHEN** a deduplicated entry was last logged as "Bench Press" but earlier as "bench press"
- **THEN** the picker displays "Bench Press"

### Requirement: Sorting by most-recently-used

The system SHALL sort picker entries by the most recent timestamp at which the exercise appeared in any session or plan, descending. Sessions use `completedAt`; plans use the plan's `updatedAt`.

#### Scenario: Recent exercise appears first

- **WHEN** the user completed a session containing "Pull Ups" yesterday and a session containing "Deadlift" a month ago
- **THEN** "Pull Ups" appears above "Deadlift" in the picker

### Requirement: Search filter over history

The system SHALL provide a search input that filters the picker list by case-insensitive substring match against the exercise name and against the category.

#### Scenario: Filtering by name substring

- **WHEN** the user types "press" into the search input
- **THEN** only entries whose name contains "press" (case-insensitive) remain visible

#### Scenario: Filtering by category

- **WHEN** the user types a category label (e.g. "legs") into the search input
- **THEN** entries whose category matches that substring are also shown

### Requirement: Selecting an entry pre-fills the add-exercise form

The system SHALL, on selection, close the picker and pre-fill the originating add-exercise form with the entry's name, category, type, sets, reps, duration, and weight from its most-recent occurrence. The user SHALL be able to edit any field before confirming.

#### Scenario: Selection pre-fills name and category

- **WHEN** the user taps an entry "Bench Press / Chest" with most recent occurrence having sets=3, reps=8, weight=60kg
- **THEN** the picker closes
- **AND** the add-exercise modal regains focus with name="Bench Press", category="Chest", type=sets-reps, sets=3, reps=8, weight=60kg pre-filled
- **AND** the user can change any field before confirming

#### Scenario: Selection does not auto-submit

- **WHEN** the user taps an entry
- **THEN** the exercise is NOT added until the user explicitly confirms via the existing form's submit action

### Requirement: Hide entry from history

The system SHALL allow the user to hide a picker entry through a per-row action. Hidden entries SHALL be persisted in local storage and SHALL NOT appear in the picker on subsequent opens. Hiding SHALL NOT modify or delete any session or plan record.

#### Scenario: Hide an entry

- **WHEN** the user opens an entry's overflow menu and taps "Forget this exercise" (or equivalent label)
- **THEN** the entry is removed from the visible list immediately
- **AND** the entry's canonical key (lowercased name + category) is added to the persisted hidden set
- **AND** no session or plan data is modified

#### Scenario: Hidden entries stay hidden across opens

- **WHEN** the user closes the picker and reopens it later
- **THEN** previously hidden entries do not appear in the default list

#### Scenario: New occurrences of a hidden exercise stay hidden

- **WHEN** the user has hidden "Burpees" / "Cardio" and then completes a new session that includes that exercise
- **THEN** "Burpees" / "Cardio" still does not appear in the default picker list

### Requirement: Reveal hidden entries

The system SHALL provide a "Show hidden (n)" toggle in the picker that lists hidden entries and allows the user to restore them.

#### Scenario: Toggle reveals hidden entries

- **WHEN** the user taps "Show hidden"
- **THEN** the picker shows hidden entries marked visually as hidden
- **AND** each hidden row offers an "Unhide" action

#### Scenario: Unhide restores visibility

- **WHEN** the user taps "Unhide" on a hidden row
- **THEN** the entry's key is removed from the hidden set
- **AND** the entry appears in the default list on the next open

#### Scenario: Counter reflects hidden count

- **WHEN** zero entries are hidden
- **THEN** the "Show hidden" toggle is not displayed (or is disabled)

### Requirement: Hide action is non-destructive and clearly labeled

The system SHALL communicate that hiding an entry only affects the picker and does not delete past sessions or plans.

#### Scenario: Hide action label clarifies scope

- **WHEN** the user opens the per-row overflow menu
- **THEN** the hide option includes wording such as "Hide from picker — does not delete history" or shows a confirmation on first use clarifying the same

### Requirement: Picker coexists with wger suggestions

The system SHALL leave the existing wger-based suggestion behavior in `AddExerciseModal` unchanged. The history picker SHALL be an additional, equally-prominent path; selecting from history SHALL bypass the wger flow entirely.

#### Scenario: Wger suggestions still work for free-text entry

- **WHEN** the user dismisses the picker (or never opens it) and types into the name input
- **THEN** wger suggestions appear as before

#### Scenario: History selection ignores wger state

- **WHEN** the user opens the picker and selects an entry
- **THEN** the resulting pre-fill is taken from the user's history, not from wger
- **AND** any in-flight wger request is ignored
