## Why

Not all exercises have sets and reps (e.g., running, elliptic), yet the current model requires duration data uniformly. Users also lack feedback during and after sessions, and navigating multi-day plans requires manual tracking of which day to follow next.

## What Changes

- Introduce a 3-way exercise type: `sets & reps` (classic lifting), `sets & duration` (timed sets like planks), or `duration` only (cardio like running — no sets)
- Add support for shared exercises in workout plans (e.g., warmups applied to all days)
- Make exercise cards tickable during a session so users can track completed vs remaining exercises
- Replace the remove icon on exercises with a "dismiss/omit" option to skip for the current session only
- Display a live timer during an active session
- Show a success animation and stat summary when a session is completed
- When following a plan, auto-focus the next incomplete day rather than defaulting to day 1

## Capabilities

### New Capabilities

- `session-exercise-tracking`: Tickable exercise cards, dismiss/omit action, and live session timer during an active plan session
- `session-completion-feedback`: Success animation and stat summary shown upon completing a session
- `plan-shared-exercises`: Shared exercises (e.g., warmups) that apply to all days in a plan

### Modified Capabilities

- `workout-plans`: Adding shared exercises to plan structure changes plan requirements
- `workout-sessions`: Exercise dismissal, tickable state, 3-way exercise type, and next-day auto-focus change session behavior requirements
- `plan-session-start`: Auto-focus logic for next incomplete day changes how a plan session is started

## Impact

- Exercise data model: `type` field changes from `'reps' | 'duration'` to `'sets-reps' | 'sets-duration' | 'duration'`; `sets` becomes absent (not required) for the `duration` mode
- Plan data model: new `sharedExercises` array at plan level
- Session state: needs to track per-exercise completion/dismissed state and elapsed time
- UI: exercise cards, plan day picker, session completion screen
- No external API or dependency changes expected
