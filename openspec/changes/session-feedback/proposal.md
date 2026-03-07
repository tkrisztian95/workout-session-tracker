## Why

Users currently see a completion overlay with stats after finishing a workout, but have no way to capture how they felt about the session. Adding a simple rating (emoji-based) lets users reflect on session quality and builds richer workout history over time.

## What Changes

- Add an emoji/star rating prompt to the session completion overlay, shown after the stats animation
- Persist the rating alongside the saved session record
- Display the rating in workout history entries
- New optional field `rating` on the session data model

## Capabilities

### New Capabilities

- `session-rating`: User can rate a completed session using emoji or star picker; rating is saved with the session and shown in history

### Modified Capabilities

- `session-completion-feedback`: Completion overlay gains a rating step before final dismissal/save
- `workout-history`: History entries display the session rating if one was given

## Impact

- `src/components/SessionCompleteOverlay.tsx` — add rating UI step
- `src/lib/types.ts` — add optional `rating` field to session type
- `src/app/history/` — render rating badge in history list
- Local storage / session persistence layer — include rating when saving
