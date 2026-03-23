### Requirement: New history record sheet opens with a session type selection step

The system SHALL present a session-type selection as the first step when the user opens the new history record sheet, offering "From a plan" and "Free session" options.

#### Scenario: Type selection is the first view shown

- **WHEN** the user opens the new history record sheet
- **THEN** the sheet displays two choices: "From a plan" and "Free session", before any date or exercise fields

#### Scenario: Choosing free session advances to the record form

- **WHEN** the user selects "Free session"
- **THEN** the sheet advances to the date, duration, and exercise form with no plan association

#### Scenario: Choosing from a plan advances to plan selection

- **WHEN** the user selects "From a plan"
- **THEN** the sheet advances to a plan picker step

#### Scenario: Cancelling at type selection closes the sheet

- **WHEN** the user dismisses or cancels at the type-selection step
- **THEN** the sheet closes without creating any session

### Requirement: Plan picker step lists available plans

The system SHALL display all existing workout plans for the user to select from when they have chosen "From a plan".

#### Scenario: All plans are listed

- **WHEN** the user is on the plan picker step
- **THEN** all saved workout plans are shown as a selectable list

#### Scenario: Selecting a plan advances to day selection

- **WHEN** the user taps a plan
- **THEN** the sheet advances to the day picker step for that plan

#### Scenario: No plans available shows empty state

- **WHEN** the user is on the plan picker step and no plans exist
- **THEN** an empty state message is shown and the user can go back to type selection

#### Scenario: Back action returns to type selection

- **WHEN** the user taps back on the plan picker step
- **THEN** the sheet returns to the session type selection step

### Requirement: Day picker step lists the selected plan's training days

The system SHALL display the training days of the selected plan for the user to choose from.

#### Scenario: All days of the plan are listed

- **WHEN** the user is on the day picker step
- **THEN** all training days of the selected plan are shown as a selectable list

#### Scenario: Selecting a day advances to the record form with exercises pre-filled

- **WHEN** the user taps a training day
- **THEN** the sheet advances to the date, duration, and exercise form with the day's exercises pre-populated

#### Scenario: No days in plan shows empty state

- **WHEN** the selected plan has no training days
- **THEN** an empty state message is shown and the user can go back to plan selection

#### Scenario: Back action returns to plan selection

- **WHEN** the user taps back on the day picker step
- **THEN** the sheet returns to the plan picker step
