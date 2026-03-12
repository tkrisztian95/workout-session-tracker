## 1. Data Model Updates

- [ ] 1.1 Add `pausedAt?: string`, `totalPausedMs: number` fields to `ActiveSession` type in `src/lib/types.ts`
- [ ] 1.2 Add `completedAt?: string` field to `Exercise` type in `src/lib/types.ts`
- [ ] 1.3 Define `LoggedSet` interface (`weight: number`, `reps: number`, `loggedAt: string`) in `src/lib/types.ts`
- [ ] 1.4 Add `loggedSets?: LoggedSet[]` field to `Exercise` type in `src/lib/types.ts`

## 2. Session Pause/Resume Logic

- [ ] 2.1 Add `handlePause` handler in `SessionView` (`page.tsx`): set `pausedAt = now`, persist updated `ActiveSession`
- [ ] 2.2 Add `handleResume` handler in `SessionView`: add `(now - pausedAt)` to `totalPausedMs`, clear `pausedAt`, persist
- [ ] 2.3 Derive `isPaused` boolean from `activeSession.pausedAt !== undefined` in `SessionView`
- [ ] 2.4 Pass `isPaused` / `handlePause` / `handleResume` down and wire up a pause/resume button in the session header or action bar

## 3. Timer Updates

- [ ] 3.1 Extend `SessionTimer` props to accept `totalPausedMs: number` and `pausedAt?: string`
- [ ] 3.2 Update `SessionTimer` elapsed calculation: `elapsed = (now - startedAt) - totalPausedMs - (pausedAt ? now - pausedAt : 0)`
- [ ] 3.3 Stop the `setInterval` when `pausedAt` is set; restart it when `pausedAt` is cleared (pause/resume the interval)
- [ ] 3.4 Show a visual paused indicator (e.g., pause icon or "Paused" label) in `SessionTimer` when `pausedAt` is set

## 4. Exercise Completion Timestamp

- [ ] 4.1 In `handleComplete` (`page.tsx`), set `completedAt = new Date().toISOString()` when toggling `completed` to `true`
- [ ] 4.2 In `handleComplete`, clear `completedAt` (set to `undefined`) when toggling `completed` back to `false`
- [ ] 4.3 Update `calcSessionStats` in `src/lib/sessionUtils.ts` to subtract `totalPausedMs` from elapsed time calculation

## 5. Set Logging UI

- [ ] 5.1 Add an "Add Set" button to `ExerciseCard.tsx` — visible only when exercise type is `sets-reps`
- [ ] 5.2 Implement an inline collapsible set-entry form (weight + reps inputs) within `ExerciseCard`
- [ ] 5.3 Pre-fill weight input with `exercise.weightKg` if set, otherwise with the last `loggedSets` entry's weight
- [ ] 5.4 On form submit, append `{ weight, reps, loggedAt: new Date().toISOString() }` to `exercise.loggedSets` and persist `ActiveSession`
- [ ] 5.5 Display logged sets list on the exercise card (each row: weight kg × reps)

## 6. Persist & Restore Paused State

- [ ] 6.1 Ensure `getActiveSession` / `setActiveSession` in `src/lib/storage.ts` correctly round-trip the new fields (`pausedAt`, `totalPausedMs`, `completedAt`, `loggedSets`)
- [ ] 6.2 Initialize `totalPausedMs: 0` when creating a new `ActiveSession` (wherever `startSession` / new session creation happens)
