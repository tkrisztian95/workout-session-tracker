## 1. Types + storage plumbing

- [x] 1.1 Add `SessionDebrief` interface (`text`, `generatedAt`, `model`) and `WorkoutSession.debrief?: SessionDebrief` to `src/lib/types.ts`. Verify `npx tsc --noEmit` passes.
- [x] 1.2 Change `saveSession` in `src/lib/storage.ts` to return the stored `WorkoutSession` (the `record` it already builds). Verify existing callers still compile and a unit test asserts the returned object has an `id` and `evaluation`.
- [x] 1.3 Add `KEYS.aiDebriefEnabled = 'wst_ai_debrief_enabled'` plus `isAiDebriefEnabled(): boolean` (default `true`; `'false'` ⇒ off) and `setAiDebriefEnabled(on: boolean)` to `src/lib/storage.ts`. Verify unit tests: default true when unset, false after `setAiDebriefEnabled(false)`, true again after `(true)`.

## 2. Prompt + generation module

- [x] 2.1 Add `src/lib/ai/prompts/session-debrief/v1.ts` (system prompt: strength-coach role, JSON `{"debrief": string}`, max 3 sentences, one observation + one concrete next-session change, ban generic praise, no-plan branch → volume/rating/progression) and `index.ts` exporting `SESSION_DEBRIEF_SYSTEM_PROMPT`. Verify `npx tsc --noEmit` passes.
- [x] 2.2 Add `'session-debrief'` to the `AiFeature` union in `src/lib/ai/context.ts`. Verify `npx tsc --noEmit` passes.
- [x] 2.3 Implement `generateSessionDebrief(ctx, finished): Promise<SessionDebriefResult>` in `src/lib/ai/debrief.ts` — read `getLlmConfig()` (throw typed skip when absent), build the user message from `formatProfilePreamble` + `formatRecentSessions` + a "This session:" block derived from `finished` + `finished.evaluation`, `callLlm`, `JSON.parse`, validate non-empty `debrief` string, trim to first 3 sentences, return `{ text, model: config.model }`. No direct `localStorage`/storage-getter reads beyond `getLlmConfig`. Export it + `SessionDebriefResult` from `src/lib/ai/index.ts`. Verify unit tests (mock `callLlm`): happy path returns trimmed text + model; a 5-sentence response is trimmed to 3; empty / non-JSON / missing-`debrief` responses reject; missing config rejects with the typed skip.
- [x] 2.4 Add a unit test that the generated prompt for a `no-plan` session includes the volume/rating framing and not plan-deviation counts.

## 3. Finish flow — inline debrief on the celebration screen

- [x] 3.1 Extend `SessionCompleteOverlay.tsx` with a third `view: 'debrief'` and props `onRated: (rating?) => Promise<WorkoutSession>`, `onDebrief: (session, SessionDebrief) => void`, `onClose: () => void`, `debriefEnabled: boolean`. After a rating is chosen: `await onRated(rating)`; if `!debriefEnabled` → `onClose()`; else show the celebration header + a loading debrief area, call `generateSessionDebrief(buildAiContext('session-debrief'), saved)`, on success `onDebrief(saved, {...})` + render the paragraph + a Done button, on failure just the Done button. Tap-outside / a Skip link → `onClose()` at any time. Verify: dismissing while the request is in flight still closes the overlay (component test or Playwright).
- [x] 3.2 Wire `SessionView.tsx`: `onRated` → save + return the stored session, `onDebrief` → `updateSession({ ...session, debrief })`, `onClose` → the existing dismiss body (achievement sync). `page.tsx` `handleFinish` returns the `saveSession` result. Verify `npx tsc --noEmit` + `npm run lint` pass and finishing a session still navigates home.
- [x] 3.3 Add `<SessionDebriefCard>` (`src/components/SessionDebriefCard.tsx`) — `text` + an "AI debrief" label + sparkle icon, theme-aware. Use it in the overlay's debrief view. Verify it renders given a `text` prop (component test or Storybook-free snapshot via Playwright screenshot).

## 4. History detail + settings + i18n

- [x] 4.1 In `src/app/history/[id]/page.tsx`, render `<SessionDebriefCard text={session.debrief.text} />` between `<PageHeader>` and the tab strip when `session.debrief && !isEditing`. Verify: a session with a `debrief` shows the card above the tabs; one without shows nothing (Playwright screenshot of both).
- [x] 4.2 Add a debrief on/off toggle row to `AiConfigCard.tsx` (below the model field), bound to `isAiDebriefEnabled` / `setAiDebriefEnabled`. Verify: toggling persists `wst_ai_debrief_enabled` and the row reflects the stored value on reload.
- [x] 4.3 Add `en` + `hu` strings for the debrief heading/label, loading text, and the Done/Skip actions to `src/locales/en.json` and `src/locales/hu.json`. Verify no missing-key console warnings when the debrief view renders in each locale.

## 5. Docs + validation

- [x] 5.1 Update `docs/data-structure.md`: add `debrief?: SessionDebrief` to the `WorkoutSession` block and the Sessions prose; add `wst_ai_debrief_enabled` to the localStorage-keys table; note `debrief` rides the export payload additively (no `schemaVersion` bump) and the setting key is excluded like other client-only flags.
- [x] 5.2 Run `openspec validate session-debrief --strict`, `npm run lint`, `npx tsc --noEmit`, `npm run test`, `npm run build` — all green.
- [x] 5.3 Manual check with a real key (or documented as skipped): finish a plan session → debrief appears inline within a few seconds, persists, and shows the same text when reopened from history; finish with the toggle off → no call, normal teardown.
