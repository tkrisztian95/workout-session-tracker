## Why

Users have no immediate context on the home screen about when they last worked out or what they did, reducing motivation and continuity. Showing the last session summary beneath the welcome greeting gives users a quick glance at their recent activity without navigating away.

## What Changes

- Add a "last session" summary card below the greeting on the home start screen
- Display relative time (e.g. "Yesterday", "3 days ago", "Today") and what the session was (plan day name or "Free session")
- Show when there are no previous sessions with a subtle "No sessions yet" hint
- Only visible on the `start` step (not during active session or plan-picking flows)

## Capabilities

### New Capabilities

- `home-last-session-summary`: Displays the most recent completed workout session info (relative date + session name) on the home start screen beneath the greeting.

### Modified Capabilities

<!-- None — no existing spec-level requirements are changing -->

## Impact

- `src/app/page.tsx`: `StartScreen` component receives the last session data as a prop; `HomePage` reads sessions from storage and computes the last session summary
- `src/lib/storage.ts`: `getSessions` already exists and returns all sessions — no changes needed
- `src/lib/types.ts`: `WorkoutSession` type already has `completedAt`, `planId`, `planDayId` — may need to look up plan name from plans list
- Locale strings: new translation keys for relative time labels and "no sessions" text
