## Context

Both AI agents (`src/lib/ai/import.ts`, `src/lib/ai/plan.ts`) call `callOpenAI` with a fixed system prompt and return structured JSON. Neither agent currently checks whether the input is fitness-relevant before (or during) the LLM call.

**Import agent** — receives raw free-text from the user. Nothing prevents submitting a recipe, a poem, or garbage text. The LLM silently produces a malformed or nonsensical session draft.

**Plan agent** — receives structured context (plans + sessions). Preferences/goals are free-text from the user and could contain irrelevant or incoherent content.

The `response_format: { type: "json_object" }` constraint is already in place, so the model must return valid JSON regardless.

## Goals / Non-Goals

**Goals:**

- Detect non-workout input in the import flow and surface a clear, localized rejection message to the user.
- Detect irrelevant or incoherent preferences in the plan flow and surface a clear rejection.
- Avoid adding a second LLM call (cost and latency concern).
- Keep validation logic inside the existing agent modules, not in UI components.

**Non-Goals:**

- Blocking partial or ambiguous workout notes (e.g. "did some stuff at the gym") — only clearly irrelevant content (recipe, news article, etc.) is rejected.
- Validating the structural quality of generated sessions or plans beyond what's already checked.
- Rate limiting or abuse prevention.
- Offline / local ML classification.

## Decisions

### Decision 1: Embed validation in the same LLM call (not a separate pre-flight call)

Extend the response JSON schema for each agent to include a top-level `"valid": boolean` field and an optional `"validationError": string`. The system prompt instructs the model to set `valid: false` and populate `validationError` when the input is clearly not fitness-related.

**Why over a separate classification call:**

- Eliminates an extra round-trip and API cost.
- The main model already reads the full input; re-reading it in a second call is redundant.
- A small schema extension is less invasive than a new `validate*` function and a new prompt.

**Trade-off:** If the model misclassifies borderline input as invalid, the user can't proceed even though the content might be usable. Mitigation: prompt instructions emphasize that only _clearly_ non-workout content (recipes, news, code, etc.) should trigger `valid: false`.

### Decision 2: Validation handled in the agent module, not the UI

`importSessions` and `suggestPlan` throw a typed `ValidationError` when `valid: false` is returned. UI components catch this specific error type and render a rejection state.

**Why:** Keeps UI components free of prompt-level logic. Callers only need to handle a new error type, not inspect response shapes.

### Decision 3: Plain `throw` with a distinguishable error type

A new `AiValidationError` class (extends `Error`) carries the model's `validationError` message. UI can `instanceof`-check to show a rejection state vs. a generic error state.

**Why over a result union type (`{ ok: true, data } | { ok: false, reason }`):**

- Both agent functions already throw on parse failure and API errors; consistent error path.
- Callers using try/catch already handle errors; a new error subclass fits naturally.

## Risks / Trade-offs

| Risk                                                            | Mitigation                                                                                              |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Model returns `valid: false` for valid-but-sparse workout notes | Prompt instructs model to err on the side of `valid: true`; only reject confidently non-fitness content |
| Model ignores the `valid` field and omits it                    | Post-parse code treats missing `valid` as `true` (safe default)                                         |
| `validationError` string is in the wrong language               | Prompt instructs the model to write `validationError` in the active UI language                         |
| New schema fields break existing integration tests              | Tests that snapshot the response JSON will need updating                                                |

## Migration Plan

1. Extend system prompts in `import.ts` and `plan.ts` to describe the `valid`/`validationError` fields.
2. Add `AiValidationError` to `src/lib/ai/index.ts`.
3. Update `importSessions` and `suggestPlan` to check `valid` after parse and throw `AiValidationError` when false.
4. Update `AiImportReviewView` and `AiPlanSuggestionModal` to catch `AiValidationError` and render a rejection state with the model's reason string.
5. Add locale strings for fallback rejection messages (used when `validationError` is empty).
6. No data migrations, no schema changes, no new dependencies.

**Rollback:** Remove the `valid`/`validationError` prompt additions and the `AiValidationError` checks — fully backwards-compatible since missing `valid` defaults to `true`.

## Open Questions

- Should `validationError` be shown verbatim to the user, or should it only inform a fixed locale string? (Verbatim is richer but may be in the wrong language if locale detection fails.)
