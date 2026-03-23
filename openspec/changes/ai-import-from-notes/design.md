## Context

The History page already supports two manual entry modes (from-plan and free-form) in `NewHistorySessionSheet.tsx`. An AI companion config (`wst_llm_config`) is stored in localStorage and already used by `AiPlanSuggestionModal` to call the OpenAI API via `src/lib/ai.ts`. The app supports three locales (en/hu/de) via a translation context. Workout sessions are persisted to localStorage under `wst_sessions` using `saveSession()`.

The new "Import from notes" path needs to: (1) accept raw text, (2) call the LLM to produce a structured `WorkoutSession` JSON, (3) normalize exercise names to the active UI language and align with existing history names, and (4) let the user confirm before saving.

## Goals / Non-Goals

**Goals:**

- Add a third entry option in the type-select step, visible only when LLM config exists
- Accept free-text workout notes and parse them to a structured `WorkoutSession` via LLM
- Normalize exercise names: translate to UI language, deduplicate variants, align to names already in history
- Show a confirmation/preview step before writing anything to localStorage
- Reuse the existing `saveSession()` and the established OpenAI call pattern from `src/lib/ai.ts`

**Non-Goals:**

- Editing existing history records during import
- Supporting multi-session imports (one paste → one session)
- Retrying failed parses automatically (user retries manually)
- Offline / non-OpenAI LLM providers beyond what `LlmConfig` already supports

## Decisions

### 1. Add a new `importSession` function in `src/lib/ai.ts`

**Decision**: Extend `ai.ts` with an `importSession(notes, locale, existingNames, llmConfig)` function that constructs the system prompt and calls the OpenAI API, returning a parsed `WorkoutSession`.

**Why**: Keeps all LLM logic in one place, consistent with how `suggestPlan` works. No new dependencies; reuses the existing fetch/error-handling pattern.

**Alternative considered**: A React hook that owns the prompt. Rejected — mixing network logic into hooks makes testing harder and breaks the existing separation already established in `ai.ts`.

---

### 2. Exercise name normalization via LLM prompt (not a post-processing step)

**Decision**: Include the active locale, the list of existing exercise names from history, and explicit instructions for name normalization inside the system prompt sent to the LLM.

**Why**: The LLM already understands multilingual exercise names and can do fuzzy matching far better than a client-side string distance algorithm. Sending the existing name list (de-duplicated, capped at ~100 entries) as context adds minimal tokens and avoids a separate normalization pass.

**Alternative considered**: Post-process the LLM output with a string-similarity library. Rejected — adds a dependency and would need its own locale-aware dictionary.

---

### 3. New `AiImportNotesSheet` component (not inline in `NewHistorySessionSheet`)

**Decision**: Add a new `AiImportNotesSheet.tsx` component that opens as a second `ModalSheet` from within `NewHistorySessionSheet`, similar to how `AddExerciseModal` is used.

**Why**: `NewHistorySessionSheet` is already large. The import flow has its own distinct steps (paste → loading → confirm), and isolating it keeps each component focused.

**Alternative considered**: Adding more steps directly to `NewHistorySessionSheet`. Rejected — would further complicate the existing step machine and make the component harder to maintain.

---

### 4. Two-step internal flow in `AiImportNotesSheet`: `input` → `confirm`

**Decision**: The sheet has two internal views: `input` (textarea + submit) and `confirm` (read-only exercise list + date/duration + save/edit-manually). On confirm the session is handed back to the parent via a callback; parent calls `saveSession()` and `onSaved()`.

**Why**: Keeps the import sheet self-contained. Parent already knows how to handle a completed session (same `handleSave` shape already exists).

---

### 5. Conditional visibility gated on `getLlmConfig()`

**Decision**: The AI import button in the type-select step is rendered only when `getLlmConfig()` returns a non-null config with a non-empty API key.

**Why**: Consistent with the existing pattern in `AiPlanSuggestionModal`. Users without a key configured won't see a broken option.

## Risks / Trade-offs

- **LLM output quality**: The model may misparse notes or miss exercises. Mitigation: the confirmation step lets the user review before saving; the user can discard and enter manually.
- **History name list size**: If a user has hundreds of distinct exercise names, the prompt grows. Mitigation: deduplicate and cap at 100 most-recently-used names before injecting into the prompt.
- **Token cost**: Sending history names + full notes may be expensive for long notes. Mitigation: no hard cap at first; document that very long notes may fail due to context limits.
- **Exercise type inference**: The LLM must infer whether an exercise is `sets-reps`, `sets-duration`, or `duration`. Mitigation: system prompt includes explicit examples and defaults to `sets-reps` when ambiguous.

## Migration Plan

No data migrations needed. The import writes sessions using the existing `saveSession()` function with the same `WorkoutSession` schema. The new UI is purely additive.

## Open Questions

- Should the confirmation step allow inline editing of individual exercises before saving, or just approve/discard? (Proposal implies overview only — start with approve/discard for simplicity.)
- Should the import option be hidden or shown-but-disabled when no LLM config is present? (Proposal says hidden — implement as hidden.)
