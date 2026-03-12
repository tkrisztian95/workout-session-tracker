## Context

The `SessionView` component renders all remaining exercises in a single flat list using `ExerciseCard`. The `remaining` array is derived by filtering `session.exercises` for non-completed, non-dismissed entries. The "active" exercise is implicitly the first in that list, but nothing in the UI communicates this. `ExerciseCard` shows name, sets/reps detail, and `scalingNote`, but never `weightKg` — which is the primary plan-specific detail users need while lifting.

## Goals / Non-Goals

**Goals:**

- Visually separate `remaining[0]` as the currently active exercise
- Surface `weightKg` and `scalingNote` prominently on the active card
- Allow the user to promote any queued exercise to the active slot without losing plan structure
- Keep all changes in the session view layer; no data model changes

**Non-Goals:**

- Persisting a separate "active exercise ID" to storage — position in the array is the source of truth
- Changing plan exercise order (reorder is session-local only)
- Drag-and-drop reordering of the full queue

## Decisions

### 1. Position-based active tracking (no new state field)

`remaining[0]` is always the active exercise. To change the active exercise, reorder `session.exercises` so the chosen exercise comes first among remaining ones. This avoids adding an `activeExerciseId` field to `ActiveSession` and keeps state minimal.

**Alternative considered**: Add `activeExerciseId` to `ActiveSession`. Rejected — adds storage schema complexity and requires migration handling for existing sessions.

### 2. `isActive` prop on `ExerciseCard` (not a separate component)

A boolean `isActive` prop drives all visual differences in `ExerciseCard`. The component handles both modes internally, avoiding duplication of button logic and avoiding a new file.

**Alternative considered**: Separate `ActiveExerciseCard` component. Rejected — the logic overlap (complete/dismiss buttons, done states) would require shared utilities and two files to maintain.

### 3. `handleSetActive` reorders the exercises array

When the user taps the play button on a queued card, `handleSetActive` splices the target exercise to the position of the current active exercise in `session.exercises`, then calls `onUpdate`. The reordered session is persisted to localStorage immediately.

Splice logic: find `targetIndex` and `activeIndex` in `session.exercises`. Remove target from array, insert at `activeIndex` (adjusting for the removal if `targetIndex < activeIndex`).

### 4. `onSetActive` prop — only passed to queue cards

The play button only appears when `onSetActive` is provided. Active-card and completed/dismissed cards receive no `onSetActive`, so the button only renders in the queue. This avoids a separate `isQueued` prop.

## Risks / Trade-offs

- **Reorder on free sessions with manually-added exercises**: Works identically — `handleSetActive` operates on the exercises array regardless of plan origin.
- **Race condition with rapid taps**: `onUpdate` writes to localStorage synchronously; no async concern.
- **Array splice correctness when target is before active**: The `insertAt = targetIndex < activeIndex ? activeIndex - 1 : activeIndex` adjustment handles this. The `-1` accounts for the array shrinking by one after the splice.
