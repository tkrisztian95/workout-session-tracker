## Why

When creating simple workout plans, users don't always want to pin training days to specific weekdays — they just want to define how many sessions they'll do per week and let scheduling happen naturally. The current UI forces weekday selection even when it's not needed, adding unnecessary friction.

## What Changes

- Plans can be created without assigning weekdays to any training days
- The day scheduling UI (weekday picker) is hidden unless the user explicitly opts into day-based scheduling
- Users can toggle between "simple" (occasion-count-based) and "scheduled" (weekday-based) modes when adding/editing a training day
- Existing plans with weekday assignments continue to work unchanged

## Capabilities

### New Capabilities
- `flexible-day-scheduling`: Allow training days to be created without weekday assignments; hide the weekday picker UI unless explicitly needed

### Modified Capabilities
- `workout-plans`: The requirement that a training day has an "optional list of scheduled weekdays" is clarified — weekday selection UI is hidden by default and only shown on demand

## Impact

- Plan creation/edit form: training day component needs a toggle or conditional rendering for weekday selection
- Data model: no breaking change — weekdays field remains optional (already supported)
- Session start logic: plans with no weekday assignments continue to work (days are chosen manually)
