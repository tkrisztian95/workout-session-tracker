## ADDED Requirements

### Requirement: Sex selector on profile settings screen

The profile settings screen SHALL display a sex selector allowing the user to choose Male, Female, or leave it unset (Not specified).

#### Scenario: Sex selector is visible on the profile screen

- **WHEN** the user opens the profile settings screen
- **THEN** a sex selector card SHALL be displayed alongside the name, language, and AI config cards

#### Scenario: Default value is Not specified

- **WHEN** no sex value has been previously saved
- **THEN** the selector SHALL display "Not specified" as the active selection

#### Scenario: Selecting Male saves the value

- **WHEN** the user selects "Male" from the sex selector and saves
- **THEN** `wst_user_sex` SHALL be set to `"male"` in localStorage

#### Scenario: Selecting Female saves the value

- **WHEN** the user selects "Female" from the sex selector and saves
- **THEN** `wst_user_sex` SHALL be set to `"female"` in localStorage

#### Scenario: Selection persists across page reloads

- **WHEN** the user has previously saved a sex value and reloads the app
- **THEN** the sex selector SHALL display the previously saved value

### Requirement: saveSex and getSex storage helpers

The storage module SHALL expose `saveSex(sex: Sex): void` and `getSex(): Sex | null` functions for persisting and retrieving the user's sex under the `wst_user_sex` localStorage key.

#### Scenario: saveSex persists the value

- **WHEN** `saveSex('male')` is called
- **THEN** localStorage SHALL contain `wst_user_sex = "male"`

#### Scenario: getSex returns null when not set

- **WHEN** `wst_user_sex` is not present in localStorage
- **THEN** `getSex()` SHALL return `null`

#### Scenario: getSex returns the stored value

- **WHEN** `wst_user_sex` is set to `"female"` in localStorage
- **THEN** `getSex()` SHALL return `"female"`

### Requirement: Sex value included in AI plan generation prompt

When the user's sex is set, the plan generation request SHALL include the sex value in the user message so the AI can tailor the generated workout plan accordingly.

#### Scenario: Sex is included in plan generation prompt when set

- **WHEN** `getSex()` returns a non-null value and the user requests a new plan
- **THEN** the user message sent to the AI SHALL include a line stating the user's biological sex

#### Scenario: Sex is omitted from plan generation prompt when not set

- **WHEN** `getSex()` returns `null` and the user requests a new plan
- **THEN** the user message SHALL NOT include a sex field
