## ADDED Requirements

### Requirement: Body metrics storage helpers

The storage module SHALL expose six helpers for persisting and retrieving the user's age, height, and weight:

- `saveAge(age: number): void` / `getAge(): number | null`
- `saveHeightCm(cm: number): void` / `getHeightCm(): number | null`
- `saveWeightKg(kg: number): void` / `getWeightKg(): number | null`

Data is stored under `wst_user_age`, `wst_user_height_cm`, and `wst_user_weight_kg` respectively in localStorage.

#### Scenario: saveAge persists the value

- **WHEN** `saveAge(30)` is called
- **THEN** localStorage SHALL contain `wst_user_age = "30"`

#### Scenario: getAge returns null when not set

- **WHEN** `wst_user_age` is not present in localStorage
- **THEN** `getAge()` SHALL return `null`

#### Scenario: getAge returns the stored value

- **WHEN** `wst_user_age` is set to `"30"` in localStorage
- **THEN** `getAge()` SHALL return `30` as a number

#### Scenario: saveHeightCm persists the value

- **WHEN** `saveHeightCm(175)` is called
- **THEN** localStorage SHALL contain `wst_user_height_cm = "175"`

#### Scenario: saveWeightKg persists the value

- **WHEN** `saveWeightKg(70.5)` is called
- **THEN** localStorage SHALL contain `wst_user_weight_kg = "70.5"`

#### Scenario: getHeightCm returns null when not set

- **WHEN** `wst_user_height_cm` is not present in localStorage
- **THEN** `getHeightCm()` SHALL return `null`

#### Scenario: getWeightKg returns null when not set

- **WHEN** `wst_user_weight_kg` is not present in localStorage
- **THEN** `getWeightKg()` SHALL return `null`

### Requirement: Body metrics editable on profile settings screen

The profile settings screen SHALL display editable fields for age, height (cm), and weight (kg). All fields SHALL be optional. Values SHALL be saved immediately on blur (matching the existing name save-on-blur pattern). Invalid or out-of-range input SHALL be silently ignored (field reverts to last valid value).

Valid ranges: age 10–120, height 50–300 cm, weight 20–500 kg.

#### Scenario: Age field is visible on profile screen

- **WHEN** the user opens the profile settings screen
- **THEN** an age input field SHALL be displayed

#### Scenario: Height field is visible on profile screen

- **WHEN** the user opens the profile settings screen
- **THEN** a height input field with "cm" unit label SHALL be displayed

#### Scenario: Weight field is visible on profile screen

- **WHEN** the user opens the profile settings screen
- **THEN** a weight input field with "kg" unit label SHALL be displayed

#### Scenario: Age saved on blur

- **WHEN** the user enters a valid age and moves focus away from the age field
- **THEN** `saveAge` SHALL be called with the entered value and the field SHALL retain that value

#### Scenario: Height saved on blur

- **WHEN** the user enters a valid height and moves focus away
- **THEN** `saveHeightCm` SHALL be called with the entered value

#### Scenario: Weight saved on blur

- **WHEN** the user enters a valid weight and moves focus away
- **THEN** `saveWeightKg` SHALL be called with the entered value

#### Scenario: Out-of-range age is not saved

- **WHEN** the user enters an age outside 10–120 and moves focus away
- **THEN** the field SHALL revert to the previously stored value (or empty if none) and `saveAge` SHALL NOT be called with the invalid value

#### Scenario: Stored values pre-populate fields on load

- **WHEN** the user opens the profile settings screen and body metrics are already stored
- **THEN** each field SHALL display the previously saved value
