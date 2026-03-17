## Context

The app already has a `SessionCompleteOverlay` component that shows an animation + stats when a session finishes. Sessions are saved as `WorkoutSession` objects in local storage (`wst_sessions`). The history page renders a list of past sessions. There is no current mechanism for users to rate or react to a session.

## Goals / Non-Goals

**Goals:**

- Let users assign an emoji rating to a completed session directly from the completion overlay
- Persist the rating as part of the saved `WorkoutSession` record
- Display the rating in the workout history list

**Non-Goals:**

- Requiring a rating (it stays optional)
- Server-side storage or analytics on ratings
- Editing a rating after the session is saved
- Complex multi-dimension feedback (effort, mood, pain) — keep it simple

## Decisions

### 1. Emoji picker over star rating

**Decision:** Use 5 emoji options (e.g., 😩 😕 😐 💪 🔥) instead of a star row.

**Rationale:** Emojis are more expressive, fit the mobile-first UI, and are more fun. Stars feel generic. An emoji maps to a numeric 1–5 value internally so history sorting/filtering is possible later.

**Alternative considered:** Star rating — dismissed for being less visually distinctive and engaging.

### 2. Rating shown as an extra step in the completion overlay, before dismiss

**Decision:** After the stats cards animate in, a rating row appears below them. User taps an emoji; tapping any emoji immediately saves the session with that rating and dismisses the overlay. A "skip" text link lets users skip rating.

**Rationale:** Keeps the flow linear — finish → rate → done. Avoids adding a separate modal or page. The overlay is already the right moment for reflection.

**Alternative considered:** Rating prompt shown in history after-the-fact — dismissed because it's too easy to ignore.

### 3. `rating` stored as optional numeric 1–5 on `WorkoutSession`

**Decision:** Add `rating?: 1 | 2 | 3 | 4 | 5` to `WorkoutSession`. Emoji display is derived from the number in the UI layer.

**Rationale:** Keeps data model clean and sortable. Emoji-to-number mapping lives in a single UI constant, easy to update.

### 4. History displays rating as emoji badge on the session card

**Decision:** Show the corresponding emoji in a small badge on each history card that has a rating. Cards without a rating show nothing (no placeholder).

**Rationale:** Non-intrusive. Users who skip rating don't see an empty slot.

## Risks / Trade-offs

- **Overlay becoming too busy** → Mitigation: rating row is visually minimal (emoji row + skip link), appears after stats so it doesn't compete with the celebration moment.
- **Existing saved sessions have no rating** → No migration needed; `rating` is optional and history handles `undefined` gracefully.
- **Emoji rendering differences across OS** → Mitigation: stick to widely-supported emoji from the standard set; test on iOS/Android.

## Migration Plan

No data migration required. `rating` field is optional — existing sessions without it continue to work normally. Deploy is a standard release with no rollback complexity.
