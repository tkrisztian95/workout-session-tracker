### Requirement: Plans can be searched by name

The Plans page SHALL provide a search input that filters the visible plan cards by name using a case-insensitive substring match.

#### Scenario: Matching plans are shown

- **WHEN** the user types text into the search input
- **THEN** only plans whose name contains that text (ignoring case) SHALL remain in the list
- **AND** the remaining plans SHALL keep the currently selected sort order

#### Scenario: Empty search shows all plans

- **WHEN** the search input is empty
- **THEN** the search SHALL not exclude any plan
- **AND** the list content SHALL be governed only by the active sort and filters

#### Scenario: Search can be cleared

- **WHEN** the search input contains text
- **THEN** a clear control SHALL be available that empties the input and restores the unsearched list

### Requirement: Plans can be sorted

The Plans page SHALL let the user order the plan list by one of: recently created, recently followed, last updated, or name (A–Z).

#### Scenario: Sort by recently created

- **WHEN** the user selects the "recently created" sort
- **THEN** plans SHALL be ordered by their `createdAt` timestamp, newest first

#### Scenario: Sort by last updated

- **WHEN** the user selects the "last updated" sort
- **THEN** plans SHALL be ordered by their `updatedAt` timestamp, most recently updated first

#### Scenario: Sort by name

- **WHEN** the user selects the "name" sort
- **THEN** plans SHALL be ordered alphabetically by name (case-insensitive, ascending)

### Requirement: "Recently followed" ordering is derived from session history

The "recently followed" sort SHALL rank each plan by the most recent completed workout session associated with that plan.

#### Scenario: Plan with completed sessions ranks by its latest session

- **WHEN** the user selects the "recently followed" sort
- **AND** a plan has one or more completed sessions whose `planId` matches it
- **THEN** that plan's rank SHALL be the latest `completedAt` among those sessions
- **AND** the plan with the most recent such session SHALL appear first

#### Scenario: Plans never followed sort last

- **WHEN** the user selects the "recently followed" sort
- **AND** a plan has no completed session whose `planId` matches it
- **THEN** that plan SHALL appear after every plan that has been followed

#### Scenario: In-progress sessions do not count as followed

- **WHEN** the only session associated with a plan is still in progress and has no completion timestamp
- **THEN** that plan SHALL be treated as never followed for the "recently followed" sort

### Requirement: Plans can be filtered by status

The Plans page SHALL let the user filter plans by status: active only, completed only, or all.

#### Scenario: Active filter is the default

- **WHEN** the Plans page is opened and no filter has been changed
- **THEN** only plans with status `active` (or no status) SHALL be shown

#### Scenario: Completed filter

- **WHEN** the user sets the status filter to "completed"
- **THEN** only plans with status `completed` SHALL be shown

#### Scenario: All statuses

- **WHEN** the user sets the status filter to "all"
- **THEN** plans of every status SHALL be shown together, ordered by the active sort

### Requirement: Plans can be filtered by AI-generated origin

The Plans page SHALL let the user filter plans by whether they were AI-generated.

#### Scenario: AI-only filter

- **WHEN** the user sets the AI filter to "AI-generated"
- **THEN** only plans with `aiGenerated` true SHALL be shown

#### Scenario: Manual-only filter

- **WHEN** the user sets the AI filter to "manually created"
- **THEN** only plans without `aiGenerated` true SHALL be shown

### Requirement: Plans can be filtered by muscle and by training-day count

The Plans page SHALL let the user filter plans by a muscle the plan trains and by the plan's number of training days.

#### Scenario: Muscle filter

- **WHEN** the user selects a muscle in the filter
- **THEN** only plans that include at least one exercise targeting that muscle SHALL be shown

#### Scenario: Training-days filter

- **WHEN** the user selects a training-day count in the filter
- **THEN** only plans whose number of training days equals that count SHALL be shown

#### Scenario: Filter options reflect the current plan set

- **WHEN** the user opens the filter controls
- **THEN** the muscle and training-day options SHALL list only values present in at least one of the user's plans

#### Scenario: Search, sort, and filter controls open from a single trigger

- **WHEN** the user has at least one plan
- **THEN** a single control on the Plans page SHALL open a popover containing the search input, sort options, and all filters

#### Scenario: Active controls are indicated on the trigger

- **WHEN** the search text, sort, or any filter is set away from its default value
- **THEN** the popover trigger SHALL show an indicator that controls are in effect

### Requirement: A no-results state is shown when search or filters exclude every plan

When the user has at least one plan but the active search and filters match none of them, the Plans page SHALL show a no-results message rather than the "no plans yet" empty state.

#### Scenario: No matches shows a distinct message

- **WHEN** the user has one or more plans
- **AND** the active search and filters match no plan
- **THEN** a "no plans match" message SHALL be shown
- **AND** a control to clear the active search and filters SHALL be available

#### Scenario: Clearing restores the list

- **WHEN** the no-results state is shown
- **AND** the user clears the search and filters
- **THEN** the full plan list SHALL be shown again under the default sort
