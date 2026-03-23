## Context

The existing AI import flow lives in two files:

- **`src/lib/ai.ts`** — `importSession()` calls the OpenAI API and returns a single `AiImportResult` (`{ date, durationMins, exercises }`). The system prompt instructs the LLM to return one JSON object.
- **`src/components/AiImportNotesSheet.tsx`** — manages `input` → `confirm` view state. The confirm view is read-only: the user can only save or discard.

The OpenAI API's `response_format: { type: 'json_object' }` requires a root JSON object (not an array), which is why multi-session output needs a wrapper key. The confirmation step currently accepts no edits, so any AI mistake forces a full discard-and-retry.

## Goals / Non-Goals

**Goals:**

- Support bulk import: one paste → many session drafts parsed in a single LLM call.
- Replace the read-only confirm step with an editable review step that works for 1..N sessions.
- Keep the existing `WorkoutSession` schema; no localStorage format changes.

**Non-Goals:**

- Per-session re-parsing / selective retry (the whole paste is re-submitted if the user goes back).
- Editing exercise category (complex picker, deferred).
- Reordering sessions within the review list.

## Decisions

### 1. LLM response schema: wrap sessions in a root key

The `json_object` response format requires a top-level object. The new system prompt will return:

```json
{ "sessions": [ { "date": "...", "durationMins": 60, "exercises": [...] } ] }
```

**Why**: Minimal change to the calling code — we just unwrap `parsed.sessions`. Alternative (`json_schema` structured output) would also work but requires listing the full schema and is not used elsewhere in the codebase.

### 2. Add `importSessions()` alongside existing `importSession()`

Add a new exported function `importSessions(notes, language, existingNames, config): Promise<AiImportResult[]>` in `src/lib/ai.ts`. The old `importSession` can be removed since `AiImportNotesSheet` is its only caller.

**Why**: Keeps the change isolated to `ai.ts` and the sheet component. No other file references the old function.

### 3. Replace `confirm` view with `review` view in `AiImportNotesSheet`

View enum: `'input' | 'review'`. State changes:

| Before                                  | After                             |
| --------------------------------------- | --------------------------------- |
| `parsedSession: WorkoutSession \| null` | `draftSessions: WorkoutSession[]` |
| `view: 'input' \| 'confirm'`            | `view: 'input' \| 'review'`       |

**Why**: The existing two-view pattern is simple and works well; extending it to a third view is not necessary — "review" directly replaces "confirm".

### 4. Draft editing via direct state mutation helpers

Each editable field in a session card dispatches an updater to the `draftSessions` array using index-based helpers (e.g., `updateDraftDate(index, value)`, `updateDraftExercise(sessionIdx, exIdx, field, value)`). No separate reducer or context needed.

**Why**: The draft is local component state with a bounded, synchronous lifecycle. A reducer would add indirection without benefit at this scale.

### 5. New `SessionDraftCard` sub-component

Extract the editable session card UI into `src/components/SessionDraftCard.tsx`. It receives a single `WorkoutSession` draft and callbacks for all mutations (field update, exercise update, exercise add/remove, session remove).

**Why**: Keeps `AiImportNotesSheet` from growing too large. The card is self-contained and will be reused if a future change adds inline editing elsewhere.

### 6. Save action label includes count

The save button renders "Save N session(s)" using the draft array length.

**Why**: Gives the user clear feedback about how many sessions will be committed, especially after they have removed some drafts from the list.

## Risks / Trade-offs

- **LLM prompt change is a breaking change to the response schema** — old `importSession` is removed; no other callers exist, so risk is contained.
- **Inline editing UX complexity** — many editable fields in a scrollable list may feel dense on mobile. Mitigation: each exercise row uses compact inline inputs; date/duration fields use native `<input type="date">` and `<input type="number">` for keyboard convenience.
- **No per-field validation on draft** — invalid values (e.g., negative reps) will be saved as-is. Acceptable for a first iteration; validation can be layered on later.

## Migration Plan

1. Update `IMPORT_SYSTEM_PROMPT` and add `importSessions` in `src/lib/ai.ts`.
2. Remove `importSession`; update `AiImportNotesSheet` to call `importSessions`.
3. Replace `confirm` view with `review` view and `SessionDraftCard` sub-component.
4. Add/update i18n strings for new UI labels.
5. No data migration needed — localStorage schema unchanged.

## Open Questions

- Should the date field in a draft card use a date picker (native `<input type="date">`) or a plain text input? Native date input is simplest; use it unless UX review says otherwise.
- Should removed session drafts be recoverable (undo)? Not in scope for v1 — the user can go back to the paste step.
