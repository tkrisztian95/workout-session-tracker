## 1. URL parsing helper

- [x] 1.1 Add `parseYoutubeId(input: string): string | null` to `src/lib/youtube.ts` handling `watch?v=`, `youtu.be/<id>`, `/shorts/<id>`, `/embed/<id>`, and bare 11-char ids
- [x] 1.2 Add `src/lib/youtube.test.ts` covering each supported form plus invalid/empty input returning `null`

## 2. Server route to fetch the description

- [x] 2.1 Create `src/app/api/youtube-description/route.ts` (`GET`) accepting `?url=` or `?v=`; validate the id with `parseYoutubeId`
- [x] 2.2 Fetch the watch page server-side with a desktop `User-Agent` and a short timeout
- [x] 2.3 Extract title + full description from `ytInitialPlayerResponse` (`videoDetails.shortDescription` / `videoDetails.title`), falling back to `og:`/meta tags
- [x] 2.4 Return `{ videoId, title, description }` on success
- [x] 2.5 Return structured errors with appropriate status for `invalid_url`, `not_found`, `no_description`, `fetch_failed`
- [x] 2.6 Add a unit test for the extraction helper against a captured HTML fixture (success + no-description cases)

## 3. AI layer: parse description into a PlanDay

- [x] 3.1 Add `'youtube-day-import'` to the `AiFeature` union in `src/lib/ai/context.ts`
- [x] 3.2 Create the prompt at `src/lib/ai/prompts/youtube-day/v1.ts` + `index.ts` (export `current`), instructing the model to return one day `{ name, weekdays, coreExercises, optionalExercises, valid?, validationError? }` and to reject non-workout input with `valid: false`
- [x] 3.3 Create `src/lib/ai/youtubeDay.ts` exporting `AiYoutubeDayResult` and `parseYoutubeDay(config, ctx, video)` — build the user message (title + description + language instruction, with a description length cap), call `callLlm`, parse JSON, apply the `AiValidationError` guardrail
- [x] 3.4 Reuse `ensureIds`, `normalizePlanExerciseMuscle`, `normalizePlanExerciseReps` from `plan.ts` (export them if not already) to clean `coreExercises`/`optionalExercises`
- [x] 3.5 Export `parseYoutubeDay` and `AiYoutubeDayResult` from `src/lib/ai/index.ts`
- [x] 3.6 Add `src/lib/ai/youtubeDay.test.ts` covering a valid day response, the `valid:false` guardrail, and reps/muscle normalization (mock `callLlm`)

## 4. Import modal UI

- [x] 4.1 Create `src/components/YoutubeDayImportModal.tsx` mirroring `AiPlanSuggestionModal`, with `input → loading → review → error` view states
- [x] 4.2 `input` view: URL field with inline `parseYoutubeId` validation and a "Fetch" action; surface a "configure AI" prompt when no `LlmConfig` is set
- [x] 4.3 On fetch: call the `/api/youtube-description` route, then `parseYoutubeDay`; map structured route errors and `AiValidationError` to localized messages
- [x] 4.4 `review` view: render `PlanDayEditor` pre-filled with the parsed day for edits
- [x] 4.5 `review` view: destination picker — a select of active plans plus "Create new plan" (name field defaulting to the video title)
- [x] 4.6 On confirm: append the day to the chosen plan (or build a new `aiGenerated` plan with that single day) and `savePlan`; expose an `onApply`/`onSaved` callback with the target plan id

## 5. Plans screen integration

- [x] 5.1 Add an "Import from YouTube" entry on `src/app/plans/page.tsx` next to the AI-suggest entry, wiring open/close state
- [x] 5.2 Refresh the plan list after save (reuse the AI-suggest apply pattern) and optionally navigate to the target plan

## 6. Localisation

- [x] 6.1 Add i18n keys for the modal/UI strings (title, paste field + placeholder, fetch/parse/save actions, destination picker labels, each error/validation message)
- [x] 6.2 Add translations for `en`, `hu`, and `de`

## 7. Verification

- [x] 7.1 Run `npm run test` (215 pass), `npm run lint` (clean — only a pre-existing
      unrelated warning), `npm run format:check` (clean), `tsc --noEmit` (0 errors),
      and `npm run build` (route emitted as a dynamic server function `ƒ`).
- [ ] 7.2 Visual check with Playwright MCP — not runnable in this environment
      (Playwright MCP unavailable; an end-to-end run also needs a real LLM key and
      network access to youtube.com). Left for a local pass before merge.
- [x] 7.3 Confirmed `docs/data-structure.md` needs no change — the flow only appends
      an existing-shaped `PlanDay` to a `WorkoutPlan` and writes no new persisted shape.
