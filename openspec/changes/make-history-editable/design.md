## Context

The session detail view at `/history/[id]` renders a completed `WorkoutSession` from localStorage. Sessions are stored as JSON blobs via `getSessions()` / `saveSession()` in `src/lib/storage.ts`. Currently `storage.ts` only appends new sessions — there is no update path. The detail page is purely presentational; it holds no mutable state.

## Goals / Non-Goals

**Goals:**

- Let users toggle an edit mode on the session detail view
- In edit mode, allow numeric edits to sets/reps/duration per exercise
- In edit mode, allow toggling an exercise's completed/dismissed state
- Persist changes back to localStorage on save
- Return to read-only view after saving, with updated data shown

**Non-Goals:**

- Editing session-level metadata (date, plan association, duration timestamps)
- Adding or removing exercises from a past session
- Bulk editing across multiple sessions
- Undo/redo beyond a simple cancel-without-save flow

## Decisions

### 1. Add `updateSession` to `storage.ts`

**Decision:** Add a new `updateSession(session: WorkoutSession): void` function that finds and replaces a session by `id` in the stored array, then writes back.

**Rationale:** `saveSession` only appends; we need an in-place update. Keeping it in storage.ts preserves the existing abstraction boundary. The implementation mirrors the existing `savePlan` pattern exactly.

**Alternative considered:** Mutate inline inside the page component using raw `localStorage` calls. Rejected — breaks the storage abstraction and makes testing harder.

---

### 2. Edit mode as local component state, not a new route

**Decision:** A single `isEditing: boolean` state flag toggles between read and edit UI in the same page component. A `draft` state holds a copy of the session during editing; saving replaces the live session and exits edit mode; cancelling discards the draft.

**Rationale:** No routing change is needed. The edit surface is confined to one page. Using a draft copy means the user can cancel without any write.

**Alternative considered:** A separate `/history/[id]/edit` route. Rejected — unnecessary complexity for what is essentially an in-place toggle.

---

### 3. Controlled inputs for numeric exercise fields

**Decision:** Sets, reps, and duration fields render as `<input type="number">` in edit mode. Values are kept in the draft state and only flushed to storage on Save.

**Rationale:** Standard controlled-input pattern; keeps the save action explicit. Empty/NaN inputs fall back to `undefined` (matching the existing nullable type).

## Risks / Trade-offs

- **Data loss on bad input** → Mitigation: Cancel button always restores pre-edit state; Save only writes if inputs parse cleanly (NaN coerced to `undefined`, not 0).
- **Stale list on back-navigation** → The history list page initialises its `sessions` state once on mount. After editing and going back, the list will reflect the updated data because `useState` reinitialises on remount. No additional cache invalidation needed.
- **No conflict handling** → If two tabs have the same session open and both edit, last write wins. Acceptable given single-device PWA usage pattern.
