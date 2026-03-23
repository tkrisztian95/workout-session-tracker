## Why

The current AI import flow only supports pasting a single workout session at a time, which is slow when a user has a backlog of notes to catch up on. Additionally, the parsed result is not editable before saving, meaning any AI mistake requires discarding and re-importing. Both gaps reduce trust and practicality of the AI import feature.

## What Changes

- The AI import text area now accepts notes describing **multiple sessions** in a single paste; the LLM parses and returns a list of sessions rather than one.
- After parsing, the user sees an **editable review step** for each imported session before confirming — they can correct exercise names, sets, reps, weights, dates, and duration directly in the UI.
- Saving commits all reviewed sessions to history in one action.
- The single-session confirmation view (read-only) is replaced by the new editable review flow, which handles one or many sessions uniformly.

## Capabilities

### New Capabilities

- `bulk-ai-session-import`: Parse and import multiple workout sessions from a single free-text paste via AI, returning an ordered list of session drafts.
- `ai-import-session-editor`: Inline editing of AI-parsed session drafts (exercises, sets, reps, weights, date, duration) before committing to history.

### Modified Capabilities

- `ai-import-from-notes`: The LLM prompt, response schema, and post-parse flow change — the spec must be updated to reflect multi-session output and the replacement of the read-only confirmation step with the editable review step.

## Impact

- `src/` AI import components and hooks (LLM call, prompt, response parsing).
- New review/edit UI components for session draft editing.
- The existing single-session confirmation step is replaced — no separate read-only confirmation component is needed going forward.
- No changes to localStorage schema; each saved session continues to use the existing session structure.
- Locale/i18n strings for new UI labels (edit fields, bulk save action, session count indicator).
