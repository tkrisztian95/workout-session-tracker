## 1. AI Module

- [x] 1.1 Add `src/lib/ai/prompts/adjust/v1.ts` with `adjustPlanSystem` and `swapExerciseSystem` prompts, and an `index.ts` exporting `adjustCurrent` / `swapCurrent`
- [x] 1.2 Export `summarisePlan`, `summariseExercise`, and `normalizePlanExerciseMuscle` from `src/lib/ai/plan.ts`
- [x] 1.3 Add `src/lib/ai/adjust.ts` with `adjustPlan(config, plan, instruction, language)` returning a full reworked plan
- [x] 1.4 Add `swapExercise(config, plan, target, dayName, instruction, language)` returning a single replacement exercise that keeps the original role
- [x] 1.5 Parse `valid` / `validationError` into `AiValidationError`; throw descriptive errors on malformed responses
- [x] 1.6 Re-export the new types and functions from `src/lib/ai/index.ts`

## 2. Plan Adjust Modal

- [x] 2.1 Create `AiPlanAdjustModal` with `config` (presets + free-text), `loading`, `preview`, and `rejected` views
- [x] 2.2 Disable generation until a preset or custom instruction is provided
- [x] 2.3 Show the reworked plan summary and collapsible reasoning in the preview; apply via `onApply`

## 3. Exercise Swap Modal

- [x] 3.1 Create `AiExerciseSwapModal` with `config`, `loading`, `preview`, and `rejected` views
- [x] 3.2 Show the original exercise and the suggested replacement side by side with collapsible reasoning
- [x] 3.3 Apply the replacement via `onApply`

## 4. Plan Editor Integration

- [x] 4.1 Add an "Adjust with AI" button to `PlanForm`, gated on a configured LLM key
- [x] 4.2 Add a per-exercise "Swap with AI" icon to `PlanExerciseRow` and thread `onAiSwap` through `PlanDayEditor`
- [x] 4.3 Add the swap icon to shared-exercise rows in `PlanForm`
- [x] 4.4 Wire `handleAiAdjust` (replace plan state) and `handleAiSwap` (replace exercise by id, keeping id)

## 5. Localization

- [x] 5.1 Add `ai_adjust_*` and `ai_swap_*` keys to `en`, `de`, and `hu` locale files
