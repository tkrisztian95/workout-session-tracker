## ADDED Requirements

### Requirement: Plan detail page shows weekly volume summary

The plan detail page SHALL display a "Weekly Volume" section showing total working sets per muscle category, computed across all training days (compound + accessory exercises, shared exercises included). Exercises without a category are grouped under "Other".

#### Scenario: Volume summary shows sets per muscle group

- **WHEN** a plan with categorised exercises is viewed on the detail page
- **THEN** a "Weekly Volume" section lists each category with its total set count (e.g., "Chest: 12 sets", "Back: 16 sets")

#### Scenario: Uncategorised exercises appear in Other bucket

- **WHEN** some plan exercises have no category
- **THEN** their sets are counted under an "Other" label in the volume summary

#### Scenario: Volume summary absent when plan has no exercises

- **WHEN** a plan has no exercises across any day
- **THEN** no volume summary section is rendered

#### Scenario: Volume is recomputed on plan load, not stored

- **WHEN** the plan detail page is loaded
- **THEN** the volume numbers are derived from the live plan data (not a cached field)

### Requirement: Volume summary accounts for all exercise lists

The volume count SHALL include sets from compound exercises, accessory exercises, and shared exercises across all training days.

#### Scenario: Shared exercises counted in volume

- **WHEN** a plan has shared exercises (e.g., warm-up sets on a specific muscle group)
- **AND** those exercises have a category set
- **THEN** their sets are included in the weekly volume count for that category

#### Scenario: Duration-only exercises excluded from set count

- **WHEN** an exercise has type `duration` (no `sets` field)
- **THEN** it is not counted in the volume summary (no applicable set count)
