## Why

The app can generate a brand-new plan with AI, but once a plan exists — whether hand-built or freshly AI-generated — there is no AI assistance for refining it. Users reviewing a plan often want small, targeted changes: bump the intensity, lighten the weights, swap one exercise they dislike or cannot do. Today that means editing every exercise by hand. Bringing AI into the plan editor lets users iterate on a plan conversationally instead of recreating it.

## What Changes

- Add an "Adjust with AI" button to the plan editor (shown when an LLM API key is configured). It opens a modal with quick-adjustment presets (increase intensity, make it easier, add volume, shorter sessions, more variety, beginner-friendly) plus a free-text instruction field, previews the reworked plan, and applies it to the editor on confirmation.
- Add a per-exercise "Swap with AI" action on every plan exercise row (core, optional, and shared). It asks the LLM for a single replacement movement that fits the same training day, previews it, and swaps it in place on confirmation.
- Add a client-side AI module (`src/lib/ai/adjust.ts`) with `adjustPlan` and `swapExercise`, plus their system prompts under `src/lib/ai/prompts/adjust/`.

## Capabilities

### New Capabilities

- `ai-plan-adjustment`: AI button in the plan editor that reworks the whole plan from a preset or free-text instruction and previews the result before applying.
- `ai-exercise-swap`: per-exercise AI action that suggests and applies a single replacement movement.

### Modified Capabilities

- `workout-plans`: the plan editor gains AI adjust and per-exercise swap entry points (UI additions; plan persistence logic is unchanged).

## Impact

- **UI**: `PlanForm`, `PlanDayEditor`, `PlanExerciseRow` gain AI entry points; new modals `AiPlanAdjustModal` and `AiExerciseSwapModal`.
- **New module**: `src/lib/ai/adjust.ts` and `src/lib/ai/prompts/adjust/*` — prompt construction, OpenAI call, response parsing/normalisation.
- **i18n**: new `ai_adjust_*` / `ai_swap_*` keys in `en`, `de`, `hu`.
- **Dependencies**: none (reuses the existing `callOpenAI` client and native `fetch`).
- **Privacy**: unchanged — the plan is sent to OpenAI only when the user explicitly triggers an adjustment or swap, using their own locally-stored key.
