## 1. Update AI layer for multi-session output

- [x] 1.1 Update `IMPORT_SYSTEM_PROMPT` in `src/lib/ai.ts` to instruct the LLM to return `{ "sessions": [...] }` (array of session objects under a root key)
- [x] 1.2 Add `importSessions(notes, language, existingNames, config): Promise<AiImportResult[]>` to `src/lib/ai.ts` — unwrap `parsed.sessions` and validate it is a non-empty array
- [x] 1.3 Remove the old `importSession` export from `src/lib/ai.ts`

## 2. Build the SessionDraftCard component

- [x] 2.1 Create `src/components/SessionDraftCard.tsx` — accepts a `WorkoutSession` draft + callbacks and renders editable date (`<input type="date">`), duration (`<input type="number">`), and exercise rows
- [x] 2.2 Add inline editable fields per exercise row: name (text input), sets, reps/duration, weight — keep layout compact (matches existing exercise row style)
- [x] 2.3 Add "Remove exercise" button per exercise row; disable/hide save if the resulting exercise list would be empty
- [x] 2.4 Add "Add exercise" button at the bottom of each card's exercise list, inserting a blank exercise row
- [x] 2.5 Add "Remove session" button in the card header; emit a callback to the parent

## 3. Refactor AiImportNotesSheet for bulk + review flow

- [x] 3.1 Replace `parsedSession: WorkoutSession | null` state with `draftSessions: WorkoutSession[]`
- [x] 3.2 Replace `view: 'input' | 'confirm'` with `view: 'input' | 'review'`
- [x] 3.3 Call `importSessions` instead of `importSession`; map each `AiImportResult` through `buildSession` to populate `draftSessions`
- [x] 3.4 Implement the `review` view: scrollable list of `SessionDraftCard` components, replacing the old read-only confirm view
- [x] 3.5 Wire up all draft mutation callbacks in the sheet (field updates, exercise add/remove, session remove) using index-based state updaters
- [x] 3.6 Update `onConfirm` prop type to `(sessions: WorkoutSession[]) => void` and call it with all remaining drafts on save
- [x] 3.7 Update the save button label to show draft count (e.g., "Save 3 sessions"); disable when `draftSessions` is empty or any draft has zero exercises

## 4. Update parent integration

- [x] 4.1 Update the caller of `AiImportNotesSheet` (in `NewHistorySessionSheet.tsx` or wherever `onConfirm` is handled) to accept and save an array of sessions instead of a single session

## 5. Localisation

- [x] 5.1 Add i18n keys for new UI strings: session count in save button, "Add exercise", "Remove exercise", "Remove session", review step title (e.g., `ai_import_review_title`, `ai_import_save_n_sessions`, etc.)
- [x] 5.2 Add translations for all supported locales (`en`, `hu`, `de`)
