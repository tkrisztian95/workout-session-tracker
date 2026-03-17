## ADDED Requirements

### Requirement: WebMCP server initialises on app load

The app SHALL register an MCP server via the WebMCP browser API (`window.__webmcp__`) once when the root layout mounts. If the WebMCP API is not available (extension not installed), the initialisation SHALL silently no-op without errors.

#### Scenario: Extension installed

- **WHEN** the app loads in a browser with the Chrome WebMCP extension active
- **THEN** an MCP server named "Workout Sessions Tracker" is registered and discoverable by AI agents

#### Scenario: Extension not installed

- **WHEN** the app loads in a browser without the Chrome WebMCP extension
- **THEN** no error is thrown and the app functions identically to before

---

### Requirement: list_plans tool returns all workout plans

The system SHALL expose an MCP tool `list_plans` that returns the array of all `WorkoutPlan` objects from localStorage.

#### Scenario: Plans exist

- **WHEN** an AI agent calls `list_plans`
- **THEN** the tool returns a JSON array of all plans with their full structure

#### Scenario: No plans exist

- **WHEN** an AI agent calls `list_plans` and no plans have been created
- **THEN** the tool returns an empty array

---

### Requirement: get_plan tool returns a single plan

The system SHALL expose an MCP tool `get_plan` that accepts a `planId: string` parameter and returns the matching `WorkoutPlan`.

#### Scenario: Plan found

- **WHEN** an AI agent calls `get_plan` with a valid plan ID
- **THEN** the tool returns the full plan object

#### Scenario: Plan not found

- **WHEN** an AI agent calls `get_plan` with an unknown ID
- **THEN** the tool returns an error result with message "Plan not found"

---

### Requirement: list_sessions tool returns completed sessions

The system SHALL expose an MCP tool `list_sessions` that accepts an optional `limit: number` parameter and returns the most recent completed `WorkoutSession` objects, newest first.

#### Scenario: Sessions exist with no limit

- **WHEN** an AI agent calls `list_sessions` without a limit
- **THEN** the tool returns all completed sessions ordered by `completedAt` descending

#### Scenario: Sessions exist with limit

- **WHEN** an AI agent calls `list_sessions` with `limit: 5`
- **THEN** the tool returns at most 5 sessions

---

### Requirement: get_active_session tool returns in-progress session

The system SHALL expose an MCP tool `get_active_session` that returns the current `ActiveSession` from localStorage, or `null` if none is in progress.

#### Scenario: Active session exists

- **WHEN** an AI agent calls `get_active_session` and a session is in progress
- **THEN** the tool returns the full active session object including exercises and their logged sets

#### Scenario: No active session

- **WHEN** an AI agent calls `get_active_session` and no session is in progress
- **THEN** the tool returns `null`

---

### Requirement: get_profile tool returns user profile

The system SHALL expose an MCP tool `get_profile` that returns the user's stored name and profile settings.

#### Scenario: Profile exists

- **WHEN** an AI agent calls `get_profile`
- **THEN** the tool returns an object with `name` (string or null) and any other persisted profile fields

---

### Requirement: start_session tool creates an active session

The system SHALL expose an MCP tool `start_session` that accepts a `planId: string` and `planDayId: string`, creates a new `ActiveSession` from the specified plan day's exercises, and persists it.

#### Scenario: Valid plan day

- **WHEN** an AI agent calls `start_session` with a valid plan ID and day ID
- **THEN** a new active session is created with the day's core and optional exercises, persisted to localStorage, and the new session is returned

#### Scenario: Session already in progress

- **WHEN** an AI agent calls `start_session` while another session is active
- **THEN** the tool returns an error result with message "A session is already in progress"

#### Scenario: Invalid plan or day ID

- **WHEN** an AI agent calls `start_session` with an unknown plan ID or day ID
- **THEN** the tool returns an error result describing which ID was not found

---

### Requirement: log_exercise_set tool appends a set to an exercise

The system SHALL expose an MCP tool `log_exercise_set` that accepts `exerciseId: string`, `weight: number` (kg), and `reps: number`, and appends a `LoggedSet` to the matching exercise in the active session.

#### Scenario: Valid exercise in active session

- **WHEN** an AI agent calls `log_exercise_set` with a valid exercise ID and set data
- **THEN** the set is appended to the exercise's `loggedSets` array and the updated session is persisted

#### Scenario: No active session

- **WHEN** an AI agent calls `log_exercise_set` and no session is in progress
- **THEN** the tool returns an error result with message "No active session"

#### Scenario: Exercise not found

- **WHEN** an AI agent calls `log_exercise_set` with an unknown exercise ID
- **THEN** the tool returns an error result with message "Exercise not found in active session"

---

### Requirement: complete_session tool finalises the active session

The system SHALL expose an MCP tool `complete_session` that moves the current `ActiveSession` to the completed sessions list in localStorage and clears the active session key.

#### Scenario: Active session exists

- **WHEN** an AI agent calls `complete_session`
- **THEN** the session is appended to the sessions list with a `completedAt` timestamp, the active session is cleared, and the completed session is returned

#### Scenario: No active session

- **WHEN** an AI agent calls `complete_session` and no session is in progress
- **THEN** the tool returns an error result with message "No active session to complete"
