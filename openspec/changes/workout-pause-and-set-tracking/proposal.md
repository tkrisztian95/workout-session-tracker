## Why

Active workout sessions currently have no way to pause — the timer keeps running even if the user takes a break, leading to inaccurate session durations. Additionally, there is no granular record of when each exercise was completed or what weight/reps were used per set, making it impossible to track progress over time.

## What Changes

- Add **pause/resume** functionality to the active workout session timer, halting elapsed time while paused
- Record a **completion timestamp** on each exercise when it is marked done, preserving the order exercises were performed
- Allow users to **log individual sets** (weight + reps) for exercises that have sets/reps, building a per-exercise set history within a session

## Capabilities

### New Capabilities

- `session-pause-resume`: Pause and resume an active workout session; the session timer stops accumulating time while paused
- `exercise-set-logging`: Log individual sets for an exercise during a session, capturing weight and reps per set

### Modified Capabilities

- `session-exercise-tracking`: Exercise entries now store a `completedAt` timestamp and an optional array of logged sets (weight + reps)

## Impact

- **Data model**: Session exercise records gain `completedAt` (timestamp) and `sets` (array of `{ weight, reps, loggedAt }`)
- **Session state**: Active session gains `pausedAt` / `isPaused` fields; elapsed time calculation must account for accumulated pause durations
- **UI**: Active session screen needs pause/resume button, per-exercise set-logging UI, and display of logged sets
- **Persistence**: Changes stored locally (AsyncStorage / DB) and synced to backend if applicable
