## Context

The session screen (`src/app/page.tsx` — `SessionView`) has a Finish button that currently opens the `SessionCompleteOverlay` immediately, with no guard when exercises are still incomplete. Exercise completion state is already derived from `session.exercises`:

```ts
const remaining = session.exercises.filter((e) => !e.completed && !e.dismissed);
// remaining.length === 0 → all done
```

The app already has an established bottom-sheet confirmation pattern (used for discard-session) with a dark overlay, a `rounded-t-3xl` container, and a two-button layout. The reusable `ModalSheet` component also exists as an alternative.

## Goals / Non-Goals

**Goals:**

- Show a confirmation dialog (consistent with the existing discard-confirm pattern) when the user taps Finish and `remaining.length > 0`.
- Apply a CSS pulse animation to the Finish button when `remaining.length === 0`, signalling completion readiness.

**Non-Goals:**

- Changing what happens after the user confirms (the existing `SessionCompleteOverlay` flow stays as-is).
- Modifying exercise completion logic or session state management.
- Adding persistence or analytics for early-finish events.

## Decisions

### 1. Confirmation dialog: inline bottom-sheet (same pattern as discard-confirm)

Use the same inline bottom-sheet style already used for the discard-session confirmation (`showDiscardConfirm`). Adding a new `showFinishConfirm` boolean state and a matching bottom-sheet JSX block keeps the implementation consistent with existing code without introducing new dependencies.

**Alternative considered:** Reuse `ModalSheet` component. Rejected for now — the inline pattern is already established in the same component, and the ModalSheet adds animation complexity without clear benefit for a simple two-button confirmation.

### 2. Pulse animation: Tailwind `animate-pulse` on the Finish button

When `remaining.length === 0`, apply Tailwind's built-in `animate-pulse` class to the Finish button. This avoids custom CSS and is immediately readable.

**Alternative considered:** Custom keyframe ring/glow animation. More visually impactful but adds CSS complexity. `animate-pulse` is sufficient and matches the app's minimal style.

### 3. Condition evaluation point

Both behaviours key off the same already-computed `remaining` array — no new state or props needed.

## Risks / Trade-offs

- **Pulse on empty session (0 exercises planned):** If a session has no exercises at all, `remaining.length === 0` is true from the start, so the button would pulse immediately. → Mitigation: only apply pulse when `session.exercises.length > 0 && remaining.length === 0`.
- **Dialog message copy:** The confirmation message should clearly state how many exercises are left. Using `remaining.length` in the message body makes this dynamic.
