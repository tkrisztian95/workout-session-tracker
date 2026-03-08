## Context

The AI Plan Suggestion modal (`AiPlanSuggestionModal.tsx`) currently generates a plan purely from existing plans and session history. The prompt sent to OpenAI includes a summary of past plans and recent sessions, ending with a fixed instruction to "suggest a new workout plan that builds on my history." Users have no way to steer the output—they must regenerate until they get something usable.

The change is narrow and additive: add preference fields to the config view and thread the values into the existing prompt builder. No architectural changes or new dependencies required.

## Goals / Non-Goals

**Goals:**

- Add optional focus, days-per-week, and fitness-goal selectors to the config view
- Inject selected preferences into the prompt text sent to the AI
- Keep all fields optional with sensible defaults (empty = no constraint)

**Non-Goals:**

- Persisting preferences between sessions or syncing them to user profile
- Adding free-text input (e.g. a custom goals field) — selectable options only
- Changing the AI model, provider, or response format
- Validating or enforcing the AI's adherence to preferences

## Decisions

### Preference fields are select/chip pickers, not free text

**Rationale:** Controlled vocabulary makes the prompt injection predictable and keeps the UI fast. Free text would require sanitization and is prone to prompt injection. Alternatives considered: free-text textarea (rejected — too open-ended and injection risk), multi-select tags (deferred — complexity not justified for v1).

### Preferences injected as a natural-language addendum to the user prompt

**Rationale:** Appending preferences to the end of the existing user message (in `buildPlanSuggestionPrompt`) is the simplest, most testable approach. The function signature gains an optional `preferences` param so callers can pass undefined with no behavior change. Alternatives considered: adding to system prompt (rejected — system prompt defines format, mixing user intent there is semantically wrong).

### Preferences are ephemeral (not persisted)

**Rationale:** Preferences are plan-generation intent, not settings. Persisting them would suggest they apply globally, which is misleading. Users choose them fresh each time they generate. If persistence is wanted later, it can be added to `LlmConfig` in storage.

## Risks / Trade-offs

- [Risk] AI ignores preferences → Mitigation: Phrasing preferences as direct instructions ("Please create a plan focused on Strength, 3 days per week") increases adherence; no guarantee.
- [Risk] Empty preference state adds visual noise → Mitigation: Keep the section visually lightweight (optional label, small chips); collapsed by default is not needed given the few fields.

## Open Questions

- Should "Days per week" be a numeric picker or predefined chips (e.g. 2, 3, 4, 5+)? Proposal assumes chips — confirm during implementation.
