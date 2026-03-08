## ADDED Requirements

### Requirement: Exercise role labels use gym-standard terms

The UI SHALL display "Compound" in place of "Core" and "Accessory" in place of "Optional" for exercise role labels everywhere they appear (plan editor, session start screen, exercise add modal). The internal data value `role: 'optional'` is unchanged.

#### Scenario: Role toggle shows Compound and Accessory

- **WHEN** the user opens the Add Exercise modal in a plan day
- **THEN** the role toggle shows "Compound" and "Accessory" as its two options (not "core" / "optional")

#### Scenario: Plan day editor section headers use gym terms

- **WHEN** the user views a plan day in the editor
- **THEN** the section headers read "Compound Exercises" and "Accessory Exercises" (not "Core Exercises" / "Optional Exercises")

#### Scenario: Session start screen uses gym terms

- **WHEN** the user is on the session start screen choosing exercises
- **THEN** the subtitle reads "Compound exercises are pre-selected. Add accessory ones below."

#### Scenario: Empty state messages use gym terms

- **WHEN** a plan day has no compound exercises
- **THEN** the empty state reads "No compound exercises yet"
- **WHEN** a plan day has no accessory exercises
- **THEN** the empty state reads "No accessory exercises"

### Requirement: Progression note replaces scaling note in UI labels

The label "Scaling Note" SHALL be replaced with "Progression Note" everywhere in the UI. The internal field `scalingNote` is unchanged.

#### Scenario: Add exercise form shows Progression Note label

- **WHEN** the user views the exercise add/edit form
- **THEN** the label reads "Progression Note" (not "Scaling Note")

#### Scenario: Progression note placeholder reflects purpose

- **WHEN** the user taps the Progression Note field
- **THEN** the placeholder guides toward progressive overload language (e.g., "e.g. Add 2.5 kg when all reps are clean")

### Requirement: Week structure section is labelled Microcycle

In the plan detail/edit view, the section showing the weekly training days SHALL be headed "Microcycle" (or "Week Structure (Microcycle)") to introduce correct periodization vocabulary.

#### Scenario: Plan editor section header reads Microcycle

- **WHEN** the user views or edits a plan
- **THEN** the training days section is headed with "Microcycle" terminology
