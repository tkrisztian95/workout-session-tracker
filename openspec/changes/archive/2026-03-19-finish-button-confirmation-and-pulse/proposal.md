## Why

When a user taps "Finish" mid-session with exercises remaining, there is no safeguard against accidentally ending the session prematurely. Conversely, when all exercises are done, the finish button gives no visual cue that the session is complete and ready to close.

## What Changes

- The **Finish** button will show a confirmation dialog when there are remaining exercises in the session, asking the user to confirm they want to end early.
- The **Finish** button will display a pulsing animation when all exercises in the session have been completed, drawing attention to the natural end of the workout.

## Capabilities

### New Capabilities

- `finish-button-confirmation`: Confirmation dialog shown when the user taps Finish and there are still incomplete exercises remaining in the session.
- `finish-button-completion-pulse`: Pulsing visual effect on the Finish button when all exercises in the session are completed.

### Modified Capabilities

<!-- No existing spec-level requirements are changing -->

## Impact

- Session screen component (Finish button area)
- Exercise tracking state logic (determining "all done" vs "exercises remaining")
- UI: new confirmation dialog component or reuse of existing modal/dialog pattern
