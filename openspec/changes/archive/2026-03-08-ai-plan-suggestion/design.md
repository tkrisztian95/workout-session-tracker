## Context

The app is a client-only Next.js/React PWA that stores all data in localStorage. There is no backend. Users create workout plans (multi-day, multi-exercise) and record sessions against them. The Plans tab currently shows a list of plans with no intelligent assistance for creating new ones.

The feature must work entirely client-side: the LLM API call is made directly from the browser using the user's own API key, with prompt engineering to encode their data and return a structured plan suggestion.

## Goals / Non-Goals

**Goals:**

- AI Suggest button on Plans tab that opens a modal/flow
- User can enter (and persist) an OpenAI API key
- App serializes existing plans + completed session history into a prompt
- LLM returns a structured plan; app parses and pre-fills the plan creation form
- Works with OpenAI Chat Completions API (`gpt-4o-mini` default, user can pick model)
- No new npm dependencies (native `fetch` only)

**Non-Goals:**

- Backend proxy or server-side API key management
- Support for streaming responses (single completion call)
- Fine-tuning or RAG — pure prompt engineering only
- Exercise database lookup during suggestion (suggest by name, user can swap)
- Multi-turn conversation with the AI

## Decisions

### 1. Direct browser → OpenAI API call (no proxy)

**Decision**: Call `https://api.openai.com/v1/chat/completions` directly from `fetch` in the browser.

**Rationale**: No backend exists; adding one would contradict the "no backend" constraint. The user consciously provides their own API key and accepts the tradeoff (key stored in localStorage, visible in network tab).

**Alternative considered**: Build a Next.js API route as a thin proxy. Rejected — adds backend complexity, and the key would still be sent from the client on every request.

### 2. Structured JSON output via function calling / JSON mode

**Decision**: Use OpenAI's `response_format: { type: "json_object" }` with an explicit JSON schema in the system prompt. Parse the response and map fields to the existing `WorkoutPlan` type.

**Rationale**: Reliable parsing without regex heuristics. The schema mirrors the app's internal `WorkoutPlan` type so mapping is straightforward.

**Alternative considered**: Free-text response parsed with regex. Rejected — too fragile.

### 3. API key stored in localStorage

**Decision**: Add a `wst_llm_config` key to localStorage with `{ provider: 'openai', apiKey: string, model: string }`.

**Rationale**: Consistent with the app's existing all-localStorage approach. User is informed that the key is stored locally.

**Alternative considered**: Session storage only (key lost on tab close). Rejected — poor UX; user would have to re-enter key every session.

### 4. New `src/lib/ai.ts` module

**Decision**: All LLM logic lives in a single new file: prompt construction, API call, response parsing, and type conversion.

**Rationale**: Keeps LLM concerns isolated and testable. Storage module (`storage.ts`) is extended only to add `getLlmConfig` / `saveLlmConfig` helpers.

### 5. UI entry point: floating button + modal

**Decision**: Add an "✨ AI Suggest" button near the "New Plan" button on the Plans tab. Clicking it opens a modal that shows: (a) API key input if not configured, (b) a "Generate" button, (c) a loading state, (d) a preview of the suggested plan with "Use this plan" / "Regenerate" actions.

**Rationale**: Non-intrusive entry point; modal keeps the flow self-contained. Pre-filling the existing Add Plan form after "Use this plan" reuses existing creation infrastructure.

## Risks / Trade-offs

- **API key exposure**: Key is in localStorage and visible in browser network tab → Mitigated by clear in-app warning; acceptable for a personal-use app
- **OpenAI API cost**: Each suggestion call costs tokens → Mitigated by using `gpt-4o-mini` as default and showing the model selector
- **Prompt size**: Large histories could exceed context limits → Mitigated by capping history to the last 20 sessions and summarizing exercise sets (count + weight range, not every set)
- **Parsing failures**: LLM may return malformed JSON despite JSON mode → Mitigated by try/catch with user-facing error message and "Regenerate" option
- **CORS**: OpenAI API allows browser requests with a valid key → No mitigation needed; this is by design

## Migration Plan

No data migration required. New localStorage key (`wst_llm_config`) is additive. Feature can be shipped behind no flag — it is inert until the user clicks the AI button.

## Open Questions

- Should we support providers beyond OpenAI (e.g., Anthropic, Gemini) in v1, or add extensibility hooks only?
- Should the suggested plan be shown in a read-only preview card or directly pre-fill the edit form?
