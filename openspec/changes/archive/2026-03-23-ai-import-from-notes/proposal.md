## Why

Users who track workouts in text notes (e.g., journals, messaging apps) have no fast path to import those records into the app — they must manually re-enter every exercise, set, and rep. Adding an AI-powered import option lets users paste raw notes and have the AI produce a structured session record, with exercise names normalized to the app's UI language and aligned with existing history, reducing friction for manual history entry.

## What Changes

- The "Add history record" modal gains a third entry mode: **Import from notes (AI)**
- The new mode is only visible when a valid LLM config (API key) is saved in `wst_llm_config`
- The user pastes free-form workout notes into a text area; the AI parses them into a structured session JSON
- Exercise names are normalized: translated to the active UI language, deduplicated across inconsistent spelling/language variants, and aligned with names already present in the workout history
- A confirmation step shows the parsed session in a human-readable preview before any data is written
- On confirmation the session JSON is saved to localStorage exactly as a manually entered session would be; no existing records are modified

## Capabilities

### New Capabilities

- `ai-import-from-notes`: AI-assisted import of workout sessions from free-text notes, including exercise name normalization and a user confirmation step before persistence

### Modified Capabilities

- `history-manual-record`: The history add modal gains a third mode entry point (AI import); existing manual-entry flow is unchanged

## Impact

- **Components**: `NewHistorySessionSheet.tsx` — new import mode tab/option; new `AiImportNotesModal` (or sheet step) component for the text input and confirmation UI
- **AI integration**: New prompt engineering for the LLM call; reads `wst_llm_config` from localStorage for API key/model; reads existing history exercise names for normalization context
- **localStorage**: Session written using the same schema as `history-manual-record`; no migrations needed
- **Localization**: New translation keys for the import UI (en/hu/de)
- **Dependencies**: No new packages; reuses existing OpenAI API call pattern from `AiPlanSuggestionModal`
