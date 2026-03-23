## ADDED Requirements

### Requirement: History page has a date range filter button in the header

The system SHALL display a calendar icon button in the History page header that opens a date range picker sheet.

#### Scenario: Calendar button is always visible in History header

- **WHEN** the user is on the History page
- **THEN** a calendar icon button is visible in the header alongside the add-session button

#### Scenario: Tapping the calendar button opens the picker sheet

- **WHEN** the user taps the calendar icon button
- **THEN** a bottom sheet slides up containing the date range picker

### Requirement: Date range picker uses mobile drum-scroll columns for year, month, and day

The system SHALL render the date range picker as two endpoints (From and To), each with three vertically-scrolling drum columns: Year, Month, and Day. The columns SHALL use CSS scroll-snap so that each scroll action settles on a discrete value.

#### Scenario: Picker opens with sensible defaults

- **WHEN** the picker opens with no previously active range
- **THEN** the From endpoint defaults to 30 days before today
- **AND** the To endpoint defaults to today

#### Scenario: Picker opens with current range pre-selected

- **WHEN** the picker opens while a date range filter is active
- **THEN** the From and To drum columns are initialised to the currently active range values

#### Scenario: Scrolling a column changes the selected value

- **WHEN** the user scrolls the Year, Month, or Day column of either endpoint
- **THEN** the column settles on the nearest item via scroll-snap
- **AND** the selected date for that endpoint updates accordingly

#### Scenario: To date is clamped to be on or after From date

- **WHEN** the user changes the From date to be later than the current To date
- **THEN** the To date is automatically updated to equal the new From date

### Requirement: Applying the range filters the history list

The system SHALL filter the displayed session groups to only those whose date falls within the selected From–To range (inclusive) when the user confirms the range.

#### Scenario: Apply button closes picker and filters list

- **WHEN** the user taps the Apply button in the picker sheet
- **THEN** the sheet closes
- **AND** the history list shows only session groups with a date between From and To (inclusive)

#### Scenario: No sessions in range shows empty state

- **WHEN** the active range contains no completed sessions
- **THEN** the history list shows the empty state

### Requirement: Active date range is indicated in the History header

The system SHALL display a compact label showing the active range when a date range filter is set.

#### Scenario: Active range label is shown in header

- **WHEN** a date range filter is active
- **THEN** a label such as "Mar 1 – Mar 23" is displayed in the History header

#### Scenario: No range label shown when filter is inactive

- **WHEN** no date range filter is active
- **THEN** no range label is shown in the header

### Requirement: Active date range filter can be cleared

The system SHALL provide a dismiss control on the active range label that removes the filter and restores the full session list.

#### Scenario: Tapping clear on the range label removes the filter

- **WHEN** the user taps the × control on the active range label
- **THEN** the range filter is cleared
- **AND** all sessions are shown in the history list
- **AND** the range label is removed from the header

#### Scenario: Tapping Clear in the picker sheet removes the filter

- **WHEN** the user opens the picker while a range is active and taps the Clear button
- **THEN** the sheet closes
- **AND** the range filter is cleared
- **AND** all sessions are shown
