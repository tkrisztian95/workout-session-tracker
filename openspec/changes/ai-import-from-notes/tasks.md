## 1. AI Layer

- [x] 1.1 Add `importSession(notes, locale, existingExerciseNames, config)` function to `src/lib/ai.ts` that builds the system prompt and calls the OpenAI API, returning a parsed `WorkoutSession`
- [x] 1.2 Write the system prompt for session parsing: instruct the LLM to output a `WorkoutSession`-compatible JSON, translate exercise names to the given locale, deduplicate variants, and prefer names from the provided `existingExerciseNames` list
- [x] 1.3 Add a helper in `src/lib/ai.ts` (or `src/lib/storage.ts`) that collects distinct exercise names from existing sessions, deduplicates them, and caps the list at 100 most-recently-used entries

## 2. Import Sheet Component

- [x] 2.1 Create `src/components/AiImportNotesSheet.tsx` with two internal views: `input` (textarea + submit) and `confirm` (read-only session preview + save/discard)
- [x] 2.2 Implement the `input` view: multiline textarea, disabled submit when empty, loading state during LLM call, error state on failure with retry support
- [x] 2.3 Implement the `confirm` view: display inferred date, duration, and exercise list (name, sets/reps/weight); "Save" and "Discard" actions
- [x] 2.4 On "Save" in the confirm view, invoke the `onConfirm(session)` callback passed from the parent; do not call `saveSession` directly inside the sheet

## 3. Integration into NewHistorySessionSheet

- [x] 3.1 In `NewHistorySessionSheet.tsx`, read `getLlmConfig()` on mount and store the result in component state
- [x] 3.2 In the `type-select` step, conditionally render the "Import from notes (AI)" button when LLM config is present
- [x] 3.3 Add state to track whether `AiImportNotesSheet` is open and wire its `onConfirm` callback to call `saveSession(session)` then `onSaved(session.id)` and close both sheets
- [x] 3.4 Render `<AiImportNotesSheet>` alongside the existing `<AddExerciseModal>` at the bottom of the component

## 4. Localization

- [x] 4.1 Add translation keys for the AI import option label and description (type-select step) to all three locale files (`en`, `hu`, `de`)
- [x] 4.2 Add translation keys for the import sheet: textarea placeholder, submit button, loading message, error message, confirm view title, save and discard button labels
- [x] 4.3 Verify all new keys resolve to non-empty strings in all three locales

## 5. Verification

- [x] 5.1 Confirm that the AI import option is hidden when no LLM config is set and visible when config is present
- [x] 5.2 Confirm that an imported session appears in the history list with the correct date, duration, and exercises
- [x] 5.3 Confirm that exercise names in the imported session use the active UI language and match existing history names where applicable
- [x] 5.4 Confirm that cancelling/discarding on the confirmation step leaves history unchanged
