## 1. URL parsing helper

- [ ] 1.1 Add `parseYoutubeId(input: string): string | null` to `src/lib/youtube.ts` handling `watch?v=`, `youtu.be/<id>`, `/shorts/<id>`, `/embed/<id>`, and bare 11-char ids
- [ ] 1.2 Add `src/lib/youtube.test.ts` covering each supported form plus invalid/empty input returning `null`

## 2. Server route to fetch the description

- [ ] 2.1 Create `src/app/api/youtube-description/route.ts` (`GET`) accepting `?url=` or `?v=`; validate the id with `parseYoutubeId`
- [ ] 2.2 Fetch the watch page server-side with a desktop `User-Agent` and a short timeout
- [ ] 2.3 Extract title + full description from `ytInitialPlayerResponse` (`videoDetails.shortDescription` / `videoDetails.title`), falling back to `og:`/meta tags
- [ ] 2.4 Return `{ videoId, title, description }` on success
- [ ] 2.5 Return structured errors with appropriate status for `invalid_url`, `not_found`, `no_description`, `fetch_failed`
- [ ] 2.6 Add a unit test for the extraction helper against a captured HTML fixture (success + no-description cases)

## 3. AI layer: parse description into a PlanDay

- [ ] 3.1 Add `'youtube-day-import'` to the `AiFeature` union in `src/lib/ai/context.ts`
- [ ] 3.2 Create the prompt at `src/lib/ai/prompts/youtube-day/v1.ts` + `index.ts` (export `current`), instructing the model to return one day `{ name, weekdays, coreExercises, optionalExercises, valid?, validationError? }` and to reject non-workout input with `valid: false`
- [ ] 3.3 Create `src/lib/ai/youtubeDay.ts` exporting `AiYoutubeDayResult` and `parseYoutubeDay(config, ctx, video)` — build the user message (title + description + language instruction, with a description length cap), call `callLlm`, parse JSON, apply the `AiValidationError` guardrail
- [ ] 3.4 Reuse `ensureIds`, `normalizePlanExerciseMuscle`, `normalizePlanExerciseReps` from `plan.ts` (export them if not already) to clean `coreExercises`/`optionalExercises`
- [ ] 3.5 Export `parseYoutubeDay` and `AiYoutubeDayResult` from `src/lib/ai/index.ts`
- [ ] 3.6 Add `src/lib/ai/youtubeDay.test.ts` covering a valid day response, the `valid:false` guardrail, and reps/muscle normalization (mock `callLlm`)

## 4. Import modal UI

- [ ] 4.1 Create `src/components/YoutubeDayImportModal.tsx` mirroring `AiPlanSuggestionModal`, with `input → loading → review → error` view states
- [ ] 4.2 `input` view: URL field with inline `parseYoutubeId` validation and a "Fetch" action; surface a "configure AI" prompt when no `LlmConfig` is set
- [ ] 4.3 On fetch: call the `/api/youtube-description` route, then `parseYoutubeDay`; map structured route errors and `AiValidationError` to localized messages
- [ ] 4.4 `review` view: render `PlanDayEditor` pre-filled with the parsed day for edits
- [ ] 4.5 `review` view: destination picker — a select of active plans plus "Create new plan" (name field defaulting to the video title)
- [ ] 4.6 On confirm: append the day to the chosen plan (or build a new `aiGenerated` plan with that single day) and `savePlan`; expose an `onApply`/`onSaved` callback with the target plan id

## 5. Plans screen integration

- [ ] 5.1 Add an "Import from YouTube" entry on `src/app/plans/page.tsx` next to the AI-suggest entry, wiring open/close state
- [ ] 5.2 Refresh the plan list after save (reuse the AI-suggest apply pattern) and optionally navigate to the target plan

## 6. Localisation

- [ ] 6.1 Add i18n keys for the modal/UI strings (title, paste field + placeholder, fetch/parse/save actions, destination picker labels, each error/validation message)
- [ ] 6.2 Add translations for `en`, `hu`, and `de`

## 7. Verification

- [ ] 7.1 Run `npm run test`, `npm run lint`, and `npm run format:check`
- [ ] 7.2 Visual check with Playwright MCP: paste a link → review → save into an existing plan, and into a new plan
- [ ] 7.3 Confirm `docs/data-structure.md` needs no change (no new persisted shapes) and note it in the apply commit
