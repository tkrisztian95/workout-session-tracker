## Context

The app tracks active workout sessions via an `ActiveSession` object persisted to `localStorage`. The timer (`SessionTimer.tsx`) runs as isolated local component state — it computes elapsed time on mount from `startedAt` and counts up with `setInterval`. Session exercises are completed/dismissed as a binary unit — no per-set granularity exists. There is no pause concept, no completion ordering, and no set logging.

## Goals / Non-Goals

**Goals:**

- Allow the user to pause and resume an active session; the timer stops accumulating during pauses
- Record a `completedAt` timestamp on each exercise at the moment of completion
- Let users log individual sets (weight + reps) against a sets-reps exercise during a session

**Non-Goals:**

- Backend sync or cloud persistence (localStorage-only, consistent with current architecture)
- Editing logged sets after session completion
- Set logging for `sets-duration` or `duration` exercises (only `sets-reps` exercises)
- Any changes to the session history / completed-session views

## Decisions

### 1. Pause state stored in `ActiveSession`, not component state

**Decision**: Add `pausedAt?: string` and `totalPausedMs: number` to `ActiveSession`. When the user pauses, write `pausedAt = new Date().toISOString()` and persist. On resume, calculate `(Date.now() - pausedAt) + totalPausedMs`, clear `pausedAt`, and persist.

**Why**: The timer already derives elapsed time from `startedAt`. Extending this to `elapsedSeconds = (now - startedAt) - totalPausedMs` (plus ongoing pause if `pausedAt` is set) requires no new state layer. Storing it in `ActiveSession` means the pause survives a page refresh.

**Alternative considered**: Track pause in React state only. Rejected — a hard refresh would lose the paused duration.

---

### 2. Timer receives `totalPausedMs` + `pausedAt` as props

**Decision**: `SessionTimer` currently accepts only `startedAt`. Extend its props to `{ startedAt, totalPausedMs, pausedAt }`. Elapsed time becomes:

```
pauseOffset = isPaused ? (Date.now() - pausedAt) : 0
elapsed = (Date.now() - startedAt) - totalPausedMs - pauseOffset
```

When `pausedAt` is set, the `setInterval` still ticks (to keep display current), but the value displayed is frozen to the moment of pause — or we simply stop the interval when paused and restart on resume.

**Why simple interval stop is better**: When paused, display is frozen — no need to tick. Simpler, less CPU. The interval is cleared on pause and restarted on resume.

---

### 3. `completedAt` added as an optional field on `Exercise`

**Decision**: Add `completedAt?: string` (ISO timestamp) to the `Exercise` type. Set it in `handleComplete` when toggling `completed` to `true`; clear it when toggling back to `false`.

**Why**: Minimal change to existing type. The completion overlay already sums `completed` exercises; ordering can be derived from `completedAt` when displaying history. No separate array needed.

---

### 4. Per-set logging stored as `loggedSets` array on `Exercise`

**Decision**: Add `loggedSets?: LoggedSet[]` to `Exercise`, where:

```typescript
interface LoggedSet {
  weight: number; // kg
  reps: number;
  loggedAt: string; // ISO timestamp
}
```

The UI shows a compact "Add Set" button on the active/upcoming exercise card for `sets-reps` type exercises. Tapping it opens an inline form (weight + reps inputs), and on confirm the set is appended to `loggedSets` and persisted.

**Why inline rather than modal**: Keeps the workout flow fast. The user should be able to log a set without leaving the exercise card context. A small collapsible form below the exercise card is sufficient.

**Weight default**: Pre-fill weight field with the exercise's `weightKg` target (if set) or the last logged set's weight, for speed.

---

### 5. No changes to `WorkoutSession` (completed session model)

**Decision**: `WorkoutSession` already copies the `exercises` array from `ActiveSession`. Since `completedAt` and `loggedSets` live on `Exercise`, they are automatically included in the saved session without schema changes to `WorkoutSession`.

## Risks / Trade-offs

- **Pause survives refresh but not storage clear**: Consistent with current architecture limitations. Acceptable.
- **No server-side validation of `totalPausedMs`**: A user could theoretically manipulate localStorage. Out of scope for this app.
- **`loggedSets` weight in kg only**: The app currently expresses weight in kg. No unit conversion needed.
- **Elapsed time in `sessionUtils.calcSessionStats`**: Currently uses `Date.now() - startedAt`. Must be updated to subtract `totalPausedMs` for accuracy in completed session stats.
