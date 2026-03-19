## 1. Finish Button Confirmation Dialog

- [x] 1.1 Add `showFinishConfirm` boolean state to `SessionView` in `src/app/page.tsx`
- [x] 1.2 Update the Finish button `onClick` to check `remaining.length > 0`: if true, set `showFinishConfirm = true`; if false, open `SessionCompleteOverlay` directly
- [x] 1.3 Add the confirmation bottom-sheet JSX block (matching the existing discard-confirm pattern) with a cancel button and a confirm button
- [x] 1.4 Wire the confirm button to close the dialog and open `SessionCompleteOverlay`
- [x] 1.5 Wire the cancel button to close the dialog (`showFinishConfirm = false`)
- [x] 1.6 Include remaining exercise count in the confirmation dialog message

## 2. Finish Button Pulse Animation

- [x] 2.1 Compute `allDone` boolean: `session.exercises.length > 0 && remaining.length === 0`
- [x] 2.2 Conditionally apply `animate-pulse` Tailwind class to the Finish button when `allDone` is true
