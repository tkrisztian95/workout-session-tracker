## 1. Storage — LLM Config

- [ ] 1.1 Add `wst_llm_config` key to the `KEYS` constant in `src/lib/storage.ts`
- [ ] 1.2 Add `LlmConfig` type (`{ provider: 'openai'; apiKey: string; model: string }`) to `src/lib/types.ts`
- [ ] 1.3 Implement `getLlmConfig(): LlmConfig | null` in `src/lib/storage.ts`
- [ ] 1.4 Implement `saveLlmConfig(config: LlmConfig): void` in `src/lib/storage.ts`

## 2. AI Module

- [ ] 2.1 Create `src/lib/ai.ts` with a `buildPlanSuggestionPrompt(plans, sessions)` function that serializes up to 20 most-recent sessions and all plans into a prompt string
- [ ] 2.2 Add system prompt in `ai.ts` instructing the LLM to return a JSON object matching the `WorkoutPlan` shape (without `id` and `status` fields, which the app will assign)
- [ ] 2.3 Implement `suggestPlan(config: LlmConfig, plans: WorkoutPlan[], sessions: WorkoutSession[]): Promise<Omit<WorkoutPlan, 'id' | 'status'>>` using native `fetch` to call `https://api.openai.com/v1/chat/completions` with `response_format: { type: "json_object" }`
- [ ] 2.4 Add response parsing logic and throw a descriptive error on malformed JSON or API error response

## 3. AI Suggestion Modal Component

- [ ] 3.1 Create `src/components/AiPlanSuggestionModal.tsx` with three views: `config` (API key + model input), `loading`, and `preview`
- [ ] 3.2 Implement config view: API key text input (password type), model selector dropdown (`gpt-4o-mini` default, `gpt-4o` option), "Save & Generate" button; read/write via `getLlmConfig`/`saveLlmConfig`
- [ ] 3.3 Implement loading view: spinner/indicator with "Generating your plan..." message
- [ ] 3.4 Implement preview view: display suggested plan name, days, and exercise counts; "Use this plan" button and "Regenerate" button
- [ ] 3.5 Wire up `suggestPlan` call on generate action; handle errors with inline error message and retry button
- [ ] 3.6 On "Use this plan": call an `onApply(plan)` callback prop with the suggested plan data and close modal

## 4. Plans Tab Integration

- [ ] 4.1 Locate the Plans tab page component (e.g., `src/app/plans/page.tsx` or equivalent) and add state for `showAiModal`
- [ ] 4.2 Add "AI Suggest" button to the Plans tab UI, positioned near the "New Plan" action
- [ ] 4.3 Render `<AiPlanSuggestionModal>` conditionally based on `showAiModal` state
- [ ] 4.4 Implement `onApply` handler: assign a new `id` (uuid or Date.now string) and `status: 'active'` to the suggested plan, then navigate to the plan edit/create page pre-populated with the data (or save directly and open edit view)

## 5. Privacy Notice

- [ ] 5.1 Add a brief disclaimer in the config view of the modal: "Your API key is stored locally on this device. Workout data is sent to OpenAI to generate suggestions."
