## ADDED Requirements

### Requirement: User can start a day import from a YouTube link

The Plans screen SHALL provide an entry point that opens a YouTube day-import
flow where the user pastes a video link.

#### Scenario: Entry point opens the import modal

- **WHEN** the user activates the "Import from YouTube" entry on the Plans screen
- **THEN** the system SHALL open a modal with a field to paste a YouTube link

#### Scenario: Invalid link is rejected inline

- **WHEN** the user enters text that contains no recognizable YouTube video id
- **THEN** the system SHALL indicate the link is invalid and SHALL NOT attempt a
  fetch

### Requirement: The description is parsed into a single workout day via AI

After fetching the video description, the system SHALL send it through the
existing LLM pipeline (using the user's configured provider and key) and parse
the result into one workout day with core and optional exercises.

#### Scenario: Description parses into a day

- **WHEN** the fetched description describes a workout
- **THEN** the system SHALL produce one day draft containing a day name and a
  list of exercises with their type, sets, reps or duration as available
- **AND** each parsed exercise SHALL satisfy the existing exercise field rules
  (the `reps`/`repsPerSet` mutual exclusion and a valid muscle value)

#### Scenario: Response language follows the user's locale

- **WHEN** the user's locale is set
- **THEN** the parsed day name and exercise names SHALL be produced in that
  language

#### Scenario: Non-workout description is rejected

- **WHEN** the fetched description does not describe a workout
- **THEN** the system SHALL show a validation message explaining the link could
  not be turned into a workout
- **AND** SHALL NOT save anything

#### Scenario: Missing AI configuration is surfaced

- **WHEN** the user has not configured an AI provider/key
- **THEN** the system SHALL prompt the user to configure AI before parsing

### Requirement: User reviews and edits the parsed day before saving

The system SHALL show the parsed day in an editable review step so the user can
correct it before it is committed.

#### Scenario: Parsed day is editable

- **WHEN** the day draft is shown for review
- **THEN** the user SHALL be able to edit the day name, weekdays, and the core
  and optional exercises before saving

#### Scenario: Cancelling discards the draft

- **WHEN** the user cancels or dismisses the flow before confirming
- **THEN** no plan SHALL be created or modified

### Requirement: User chooses a destination plan for the day

Before saving, the system SHALL let the user add the day to an existing plan or
create a new plan containing the day.

#### Scenario: Add the day to an existing plan

- **WHEN** the user selects an existing plan as the destination and confirms
- **THEN** the parsed (and possibly edited) day SHALL be appended to that plan's
  days
- **AND** the updated plan SHALL be saved and reflected in the plan list

#### Scenario: Create a new plan from the day

- **WHEN** the user chooses to create a new plan and confirms
- **THEN** the system SHALL create a new plan whose only day is the parsed day
- **AND** the new plan SHALL be saved and appear in the plan list

#### Scenario: New plan name defaults from the video

- **WHEN** the user chooses to create a new plan
- **THEN** the new plan's name SHALL default to the video title and remain
  editable before saving

### Requirement: The import makes no persisted schema changes

The day-import flow SHALL only write existing plan and day structures; it SHALL
NOT introduce new persisted keys, types, or migrations.

#### Scenario: Saved data uses existing structures

- **WHEN** a day is saved to an existing or new plan via this flow
- **THEN** the written data SHALL conform to the existing plan and day structures
  with no additional persisted fields beyond those already defined
