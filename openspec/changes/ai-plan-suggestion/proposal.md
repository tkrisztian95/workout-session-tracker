## Why

Users accumulate workout history and existing plans but currently have no intelligent assistance for creating new plans. An AI-powered suggestion feature on the Plans tab would leverage this data to help users craft personalized, progressively challenging plans — reducing friction and improving adherence.

## What Changes

- Add an "AI Suggest Plan" button to the Plans tab UI
- Implement a client-side prompt-engineering layer that serializes existing plans and workout history into LLM context
- Add an LLM provider configuration UI (API key input, model selection — targeting OpenAI ChatGPT as primary, with extensibility for other providers)
- Parse and apply LLM-generated plan suggestions directly into the plan creation flow, pre-filling the Add Plan form
- Store the user's LLM API key and preferences in local storage (no backend required)

## Capabilities

### New Capabilities

- `ai-plan-suggestion`: AI button on Plans tab that prompts an LLM with the user's workout history and existing plans to generate a new plan suggestion, then pre-populates the plan creation form with the result

### Modified Capabilities

- `workout-plans`: Plans tab gains an AI suggestion entry point (UI addition, no requirement change to plan creation logic itself)

## Impact

- **UI**: Plans tab (`src/app/` or plans-related component) gains an AI button
- **Storage**: `src/lib/storage.ts` — read existing plans and session history for LLM context; add LLM config persistence
- **New module**: `src/lib/ai.ts` (or similar) — prompt construction, OpenAI API call, response parsing
- **Dependencies**: No new npm packages required (uses native `fetch` for OpenAI API calls)
- **Privacy**: All data stays client-side; user's API key is stored in localStorage only
