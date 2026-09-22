## 1. Types, helpers, and locales

- [x] 1.1 Add the `SkipReason` union and the optional `Exercise.skipReason` / `Exercise.skipNote` fields to `src/lib/types.ts` (design D1). Verify `npx tsc --noEmit` passes.
- [x] 1.2 Create `src/lib/skipReasons.ts` with `SKIP_REASONS`, `skipReasonLabel`, `normalizeSkipNote`, and `hasPainStreak` (design D4). Verify with unit tests in `src/lib/skipReasons.test.ts`. The tests cover: note trim, empty, and 200-char cap; a pain streak of 2; a streak broken by a completed appearance; a mixed-reason pair; a single appearance; a case-insensitive name match; and newest-first ordering by `completedAt`.
- [x] 1.3 Add locale keys to `src/locales/en.json`, `de.json`, and `hu.json`. Add `skip_reason_<id>` for each reason, plus the sheet title, note placeholder, Skip, Skip without reason, Save, Cancel, Add reason, and pain streak hint text. Verify `npx tsc --noEmit` passes. `translations: Record<Locale, Translations>` enforces key parity, and `skipReasons.test.ts` checks that every reason has a label.

## 2. Skip sheet and live session flow

- [x] 2.1 Run `/ui-ux-pro-max` for the chip group and sheet layout. Then build `src/components/SkipExerciseSheet.tsx` with `skip` and `edit` modes (design D3), using a labelled group of `aria-pressed` toggle buttons, 44px targets, and `maxLength={200}` with a counter. The repo has no React Testing Library, so verify in the browser: a chip toggles and deselects, Skip saves the reason and trimmed note, Skip without reason saves nothing, and Escape cancels.
- [x] 2.2 In `src/app/_views/SessionView.tsx`, route `onDismiss` to open the sheet (`skipTargetId` state, design D2). Extend `handleDismiss` to write `skipReason` / `skipNote`. Make `handleUndoDismiss` drop both fields. Verify with `applySkip` / `clearSkip` unit tests and in the browser: cancel leaves the exercise unskipped, confirm persists the fields, and undo removes them from the object (not only sets them to `undefined`).
- [x] 2.3 Show the localized reason label and note on skipped cards in the live Skipped section (`ExerciseCard` non-active branch). Legacy skips show no reason line. Verify with Playwright: skip with Pain + note, the Skipped section shows both, then reload and they persist.
- [x] 2.4 Compute `hasPainStreak` for the active exercise in `SessionView` (over a one-time `getSessions()` snapshot held in state; the React Compiler rejects `useMemo` here) and render the hint on the active `ExerciseCard` in the `scalingNote` info-box style with a warning tone. Verify with Playwright, seeding two past sessions with pain skips of the same exercise: the hint shows, and it is absent when one past appearance was completed.

## 3. History detail and edit mode

- [x] 3.1 Show the reason label and note under skipped exercises in read mode of `src/app/history/[id]/page.tsx`. Verify with Playwright on a finished session that has a reasoned skip.
- [x] 3.2 In edit mode, add the reason affordance on skipped exercises. It opens `SkipExerciseSheet` in `edit` mode and patches the draft through `updateDraftExercise`. The un-skip toggle also drops `skipReason` / `skipNote` (design D6). In the current code it moves the exercise to not-completed, not completed. Verify with Playwright: add a reason to a legacy skip and save, it shows in read mode; change a reason then Cancel, the original is kept; un-skip and save, the reason is gone.

## 4. AI debrief

- [x] 4.1 Extend `formatFinishedSession` in `src/lib/ai/debrief.ts` with the `- skipped:` line (design D5). Verify with `src/lib/ai/debrief.test.ts` cases: pain plus note, no reason, and no skips (no line).
- [x] 4.2 Add `src/lib/ai/prompts/session-debrief/v2.ts` with the pain-acknowledgement and no-medical-advice rule. Point `index.ts` at v2 and set `version = 2`. Verify the debrief tests pass and the exported `SESSION_DEBRIEF_SYSTEM_PROMPT` contains the new rule.

## 5. Docs and verification

- [x] 5.1 Update `docs/data-structure.md` with `SkipReason`, `Exercise.skipReason`, `Exercise.skipNote`, the "only meaningful when `dismissed`" invariant, and a note that no migration or `schemaVersion` bump is needed. Verify the doc lists both fields next to `dismissed`.
- [x] 5.2 Run `npm run lint`, `npx tsc --noEmit`, and `npm run test`. All must pass. Then run a Playwright end-to-end check: start a session, skip one exercise with a reason and one without, finish, open history, and confirm both render correctly and the debrief request includes the skipped line.
- [x] 5.3 Fix the structure of `openspec/specs/session-history-editing/spec.md` before archiving: add a `## Purpose` section and wrap the existing requirements under `## Requirements`. Without this, archive refuses the delta. Verify `openspec validate --strict` shows no "Archive would refuse" info for `session-history-editing`.
