# plan-overview Specification

## Purpose

Provide a calm, read-only overview when opening a plan at `/plans/[id]` instead of dropping the user straight into the editable form. The overview surfaces plan identity, stat tiles, muscle groups, a flat details list, and a per-day exercise breakdown, with an explicit Edit action to enter the existing plan form. Completed plans stay read-only with a reactivate affordance.

## Requirements

### Requirement: Plan opens in a read-only overview by default

Opening a plan at `/plans/[id]` SHALL render a read-only overview of the plan by default. The page SHALL NOT render the editable plan form until the user explicitly chooses to edit. The page SHALL hold a mode of either `overview` or `edit`, initialized to `overview`.

#### Scenario: Active plan opens in overview

- **WHEN** a user opens an active plan from the plans list
- **THEN** the read-only overview is shown
- **AND** the editable plan form is not shown

#### Scenario: Completed plan opens in overview

- **WHEN** a user opens a completed plan
- **THEN** the read-only overview is shown

#### Scenario: Unknown plan id

- **WHEN** a user opens `/plans/[id]` for an id that does not exist
- **THEN** a "plan not found" message is shown and no overview or form is rendered

### Requirement: Overview shows plan identity and badges

The overview SHALL display the plan name. It SHALL show a completed-status indicator when the plan status is `completed`, and an AI-generated badge when `aiGenerated` is `true`.

#### Scenario: AI-generated plan shows AI badge

- **WHEN** the overview renders a plan with `aiGenerated: true`
- **THEN** an AI badge is shown alongside the plan name

#### Scenario: Manual plan shows no AI badge

- **WHEN** the overview renders a plan without `aiGenerated`
- **THEN** no AI badge is shown

### Requirement: Overview shows plan stat tiles

The overview SHALL show stat tiles for the training-day count (number of plan days), the total exercise count, and the follow count. The total exercise count SHALL be the sum of all shared exercises plus every day's core and optional exercises. The follow count SHALL be the number of completed sessions logged against the plan.

#### Scenario: Counts reflect plan contents

- **WHEN** a plan has 3 days totaling 12 day-exercises and 2 shared exercises
- **THEN** the training-day tile shows 3 and the exercise tile shows 14

#### Scenario: Follow count reflects logged sessions

- **WHEN** 5 completed sessions reference the plan
- **THEN** the follow-count tile shows 5

### Requirement: Overview shows muscle groups present in the plan

The overview SHALL list the muscle groups present across the plan's exercises, grouped using the `MuscleGroup` taxonomy, each with its constituent muscle badges. Muscles with no group are omitted.

#### Scenario: Muscles grouped by taxonomy

- **WHEN** a plan trains chest and quads
- **THEN** the overview shows the Upper body group with a chest badge and the Lower body group with a quads badge

#### Scenario: Plan with no muscle-tagged exercises

- **WHEN** no exercise in the plan has a muscle assigned
- **THEN** the muscle-groups section is omitted

### Requirement: Overview shows a flat read-only details list

The overview SHALL show a flat list of plan details as label/value rows. It SHALL include the created date and, when present, scheduled weeks, scheduled weekdays, last-followed date, and completed-on date. When the plan has never been followed, the last-followed value SHALL indicate that explicitly.

#### Scenario: Scheduled fields shown when present

- **WHEN** a plan has `scheduledWeeks: 6` and days scheduled on Mon/Wed
- **THEN** the details list shows 6 weeks and the Mon, Wed weekdays

#### Scenario: Never-followed plan

- **WHEN** a plan has no completed sessions
- **THEN** the last-followed row indicates the plan has never been followed

#### Scenario: Completed-on shown for completed plan

- **WHEN** a completed plan has a `completedAt` timestamp
- **THEN** the details list shows the completed-on date

### Requirement: Overview shows a per-day exercise breakdown

The overview SHALL list each training day with its name and scheduled weekdays, and under each day its core and optional exercises read-only, showing the exercise name, its sets×reps or duration detail, and a muscle badge when present. Shared exercises SHALL be listed in their own section.

#### Scenario: Day exercises listed read-only

- **WHEN** a day has a core exercise "Squat" of 3×5
- **THEN** the overview lists "Squat" with a 3×5 detail under that day, with no edit controls

#### Scenario: Shared exercises listed separately

- **WHEN** a plan has shared exercises
- **THEN** they are shown in a dedicated shared-exercises section

### Requirement: Edit action enters the edit form

The overview SHALL provide an Edit action that switches the page into `edit` mode, rendering the existing plan form. Saving or cancelling the edit SHALL return to the overview. For completed plans the Edit action SHALL NOT be offered; the plan remains read-only with a reactivate affordance, preserving current behaviour.

#### Scenario: Edit then return to overview

- **WHEN** the user taps Edit on an active plan and then saves or cancels
- **THEN** the page returns to the overview

#### Scenario: Completed plan offers no edit

- **WHEN** the overview renders a completed plan
- **THEN** no Edit action is shown
- **AND** a reactivate affordance is available
