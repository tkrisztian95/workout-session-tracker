## Why

The AI plan generation currently runs fully automatically based on session history, giving users no way to express what they actually want from their next plan. Adding optional guidance inputs (e.g. training focus, weekly frequency, fitness goal) lets the AI produce more relevant, personalized suggestions without requiring the user to regenerate repeatedly.

## What Changes

- Add an optional "Preferences" section in the AI Plan Suggestion modal config view, with selectable options for:
  - **Training focus** (e.g. Strength, Hypertrophy, Endurance, Flexibility, Weight loss)
  - **Days per week** (e.g. 2, 3, 4, 5+)
  - **Fitness goal** (e.g. Build muscle, Lose weight, Improve cardio, Maintain fitness)
- All preference fields are optional — the user can generate without filling any in
- Selected preferences are appended to the AI prompt so the model can tailor the plan accordingly
- Preferences are NOT persisted between sessions (ephemeral, per-generation)

## Capabilities

### New Capabilities

- `ai-plan-preferences`: Optional user preference inputs (focus, frequency, goal) shown in the AI plan config view that are injected into the plan generation prompt

### Modified Capabilities

- `workout-plans`: No spec-level requirement changes; this feature is additive to the AI generation flow

## Impact

- `src/components/AiPlanSuggestionModal.tsx` — add preference fields to config view; pass preferences to generate handler
- `src/lib/ai.ts` — update `buildPlanSuggestionPrompt` to accept and include optional preferences in the user message
