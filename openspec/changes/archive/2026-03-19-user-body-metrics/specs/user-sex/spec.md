## ADDED Requirements

### Requirement: Sex selector in onboarding step

The second onboarding step SHALL include a sex selector with the same options as the profile screen: Male, Female, and Not specified (default). Selecting a value and submitting SHALL persist it via `saveSex`.

#### Scenario: Sex selector is visible in onboarding second step

- **WHEN** the second onboarding step is displayed
- **THEN** a sex selector SHALL be visible with options Male, Female, and Not specified

#### Scenario: Default selection in onboarding is Not specified

- **WHEN** the second onboarding step is first displayed
- **THEN** "Not specified" SHALL be the pre-selected option in the sex selector

#### Scenario: Selecting Male during onboarding saves the value

- **WHEN** the user selects "Male" in the onboarding sex selector and submits
- **THEN** `wst_user_sex` SHALL be set to `"male"` in localStorage

#### Scenario: Selecting Female during onboarding saves the value

- **WHEN** the user selects "Female" in the onboarding sex selector and submits
- **THEN** `wst_user_sex` SHALL be set to `"female"` in localStorage

#### Scenario: Leaving Not specified during onboarding does not write to storage

- **WHEN** the user leaves the sex selector at "Not specified" and submits the onboarding step
- **THEN** `wst_user_sex` SHALL NOT be written to localStorage
