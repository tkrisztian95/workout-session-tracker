## Why

Skipping an exercise mid-workout is one tap today (`dismissed: true`), and nothing records _why_. A skip caused by a sore shoulder looks the same as a skip caused by a busy bench. That hides useful signal from the user, from the history view, and from the AI debrief. Repeated pain-driven skips on the same exercise are the clearest sign that a plan needs a swap, and right now the app cannot see them.

Refs #50 (per-exercise notes). That issue covers a general per-exercise note that persists across sessions. This change is narrower: a structured reason plus an optional note attached to a _skip_. It does not close #50, but its storage shape (`skipNote` on `Exercise`) should stay compatible with whatever #50 lands.

## What Changes

- Tapping **Skip** on the active exercise card, or the dismiss (X) icon on a queued card, opens a bottom sheet instead of skipping immediately.
- The sheet offers optional reason chips (**Pain / injury**, **Equipment broken**, **Equipment busy**, **Fatigue / low energy**, **Out of time**, **Other**) and an optional short free-text note.
- The sheet has a primary **Skip** action (saves the chosen reason and note) and a **Skip without reason** action, so skipping still takes at most two taps. Closing the sheet cancels the skip.
- The reason and note persist on the in-session `Exercise` (`skipReason`, `skipNote`) and carry into the saved `WorkoutSession`.
- Undoing a skip clears the reason and the note.
- The live session's **Skipped** section and the history detail page show the reason label and note under each skipped exercise.
- In history edit mode, the user can add, change, or clear the reason and note on a skipped exercise. Toggling an exercise from skipped to completed clears them.
- The AI session debrief prompt includes skipped exercises with their reasons and notes, so the debrief can mention an injury or a broken machine.
- **Pain streak hint:** when the same exercise was skipped with reason _Pain / injury_ in its two most recent appearances in history, the active exercise card shows a hint suggesting a swap in the plan.
- New `SkipReason` type and optional fields documented in `docs/data-structure.md`. New locale strings in `en`, `de`, and `hu`.

No breaking changes. Both new fields are optional. Old sessions without them render as today.

## Capabilities

### New Capabilities

- `skip-exercise-reasons`: the skip sheet (reason chips, note, skip / skip-without-reason / cancel), persisting `skipReason` and `skipNote`, clearing them on undo, showing them in the live session and history detail, and the pain streak hint on the active exercise card.

### Modified Capabilities

- `session-history-editing`: adds a requirement that edit mode lets the user set, change, or clear the skip reason and note on a skipped exercise, and that toggling to completed clears them.
- `ai-session-debrief`: adds a requirement that the finished-session facts sent to the model include skipped exercises with their reason and note.

## Impact

- **Types / storage:** `src/lib/types.ts` (`Exercise.skipReason`, `Exercise.skipNote`, new `SkipReason` union). No storage key change and no migration: the fields are optional. `docs/data-structure.md` updated in the same commit.
- **Session UI:** `src/app/_views/SessionView.tsx` (`handleDismiss`, `handleUndoDismiss`, Skipped section), `src/components/ExerciseCard.tsx` (both skip entry points, skipped-card reason line, pain hint), new `src/components/SkipExerciseSheet.tsx`.
- **History UI:** `src/app/history/[id]/page.tsx` (read-mode display, edit-mode reason editing).
- **AI:** `src/lib/ai/debrief.ts` (`formatFinishedSession` lists skipped exercises with reasons). Prompt version bump in `src/lib/ai/prompts/session-debrief/` if the system prompt text changes.
- **Logic:** new pure helper (e.g. `src/lib/skipReasons.ts`) for reason labels and the pain streak check against `getSessions()`, with unit tests.
- **i18n:** `src/locales/en.json`, `de.json`, `hu.json`.
- **GitHub issues:** checked open issues. #50 is related (linked above). No open issue covers skip reasons, so this change is the tracking artifact.
