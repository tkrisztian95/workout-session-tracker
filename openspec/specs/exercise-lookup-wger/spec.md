## ADDED Requirements

### Requirement: Exercise suggestions via wger API

The system SHALL query the wger public REST API to provide exercise name suggestions as the user types in an exercise name input field. Suggestions SHALL include the exercise name and category. The input SHALL remain fully usable for custom (non-wger) names when the user ignores or dismisses suggestions.

#### Scenario: Suggestions appear after typing

- **WHEN** the user types 3 or more characters in the exercise name field
- **THEN** the system debounces 300 ms and queries wger API for matching exercises
- **THEN** up to 8 matching exercises are displayed in a dropdown below the input, each showing name and category

#### Scenario: Suggestion selection fills the input and persists category

- **WHEN** the user taps or clicks a suggestion item
- **THEN** the exercise name input is set to the selected exercise's name
- **THEN** a read-only category label is shown below the input
- **THEN** the selected category is stored and will be persisted when the exercise is saved
- **THEN** the manual category selector is hidden
- **THEN** the dropdown is dismissed

#### Scenario: Category label clears on manual edit

- **WHEN** the user modifies the exercise name input after selecting a suggestion
- **THEN** the category label is removed
- **THEN** the manual category selector becomes visible again

#### Scenario: Custom name submitted without error

- **WHEN** the user types a name not present in any suggestion and submits the form
- **THEN** the exercise is added with the typed name and whatever category the user selected in the manual selector (or no category if none selected)

### Requirement: In-session suggestion caching

The system SHALL cache wger API responses for each query string within the browser session. Repeated queries for the same string SHALL use the cached result without issuing a network request.

#### Scenario: Cache hit avoids network

- **WHEN** the user types a query that was already fetched in the current session
- **THEN** suggestions appear immediately from cache with no API call

### Requirement: Graceful offline degradation

The system SHALL handle wger API failures (network error, non-200 response) silently. The exercise name input SHALL remain functional for free-text entry when the API is unavailable.

#### Scenario: API unavailable

- **WHEN** the wger API returns an error or is unreachable
- **THEN** no suggestions are shown
- **THEN** no error message is displayed to the user
- **THEN** the user can still type and submit any exercise name

### Requirement: Loading indicator during fetch

The system SHALL display a subtle loading state on the suggestion area while a wger API request is in-flight.

#### Scenario: Loading state visible

- **WHEN** the system is waiting for a wger API response
- **THEN** a loading indicator is shown in or near the suggestion area
