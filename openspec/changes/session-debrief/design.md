## Context

See [proposal.md](proposal.md) — Why. Stacked on `feat/session-evaluation-meta`, which lands `WorkoutSession.evaluation` + `AiContext.evaluation` + the recent-session prompt strip.

Relevant current state:

- `src/lib/ai/client.ts` — `callLlm(config, system, user): Promise<string>` routes to OpenAI / Gemini, **both in JSON mode**. Every existing feature asks for JSON and `JSON.parse`s the result.
- `src/lib/ai/context.ts` — `buildAiContext(feature)`, `formatProfilePreamble`, `formatRecentSessions` (renders the eval strip per session), `AiFeature` union (already `plan-suggest | exercise-swap | exercise-suggest | plan-adjust | notes-import` — the spec text was stale and is corrected in this change's delta).
- `src/lib/ai/prompts/<feature>/` — each feature has `index.ts` + `vN.ts`. `index.ts` exports the current version.
- `src/components/SessionCompleteOverlay.tsx` — a `view` state machine: `summary` → `rating`. `onDismiss(rating?)` is the single exit; the parent (`SessionView`) saves the session and runs achievement sync in that handler.
- `src/app/page.tsx` — `handleFinish(rating)` builds the `WorkoutSession` literal, calls `saveSession`, tears down to `step: 'start'`.
- `src/lib/storage.ts` — `saveSession` returns `void` today; with `session-evaluation-meta` it already builds a `record` internally.
- `src/app/history/[id]/page.tsx` — `<PageHeader>` then either the edit view or `<TabsProvider>` with Exercises / Timeline / vs Plan.
- `AiConfigCard.tsx` — provider / key / model fields + Save. No non-config toggles yet.

## Goals / Non-Goals

**Goals:**

- One LLM call per finished session, built entirely from the envelope + the finished session.
- The debrief is a pure function of the session at finish time — persisted, never regenerated, unaffected by later edits.
- Zero behaviour change when there's no config or the toggle is off.
- Celebration screen stays a single inline surface — no extra modal, dismiss never blocked.

**Non-Goals:**

- Backfilling debriefs onto historical sessions (issue open question — out of scope; would be a separate script).
- A "regenerate" / manual-generate affordance in history.
- Token telemetry ([#61](https://github.com/tkrisztian95/workout-session-tracker/issues/61)) — soft dependency, not required for this to work.
- Streaming the debrief ([#59](https://github.com/tkrisztian95/workout-session-tracker/issues/59) AiStream) — a single short paragraph renders fine on completion.
- Migrating the AI client to the AI SDK / Gateway ([#57](https://github.com/tkrisztian95/workout-session-tracker/issues/57)) — `callLlm` is sufficient.
- Linking the debrief to a follow-up action ("apply 5% deload") — issue open question, deferred.

## Decisions

### 1. JSON call, no new client

`generateSessionDebrief` asks for `{ "debrief": string }` and `JSON.parse`s it — the exact pattern every other feature uses, so `callLlm`'s forced JSON mode is a feature, not an obstacle. No `callLlmText` variant, no client change.

_Alternative — plain-text completion:_ needs a new non-JSON client path on both providers. Not worth it for one field.

### 2. `src/lib/ai/debrief.ts` — `generateSessionDebrief(ctx, finished)`

```ts
export interface SessionDebriefResult {
  text: string;
  model: string;
}

export async function generateSessionDebrief(
  ctx: AiContext,
  finished: WorkoutSession,
): Promise<SessionDebriefResult>;
```

- Reads `getLlmConfig()` — throws a typed skip if absent (caller treats as "no debrief").
- Builds the user message: `formatProfilePreamble(ctx.profile)` + `formatRecentSessions(ctx.recentSessions)` (already carries eval strips) + a "This session:" block from `finished` — date, plan day, duration, rating, and `finished.evaluation` rendered via a small local `formatEvaluationDetail` (overall, counts, up to 3 highlights, volume).
- `callLlm(config, SYSTEM, user)` → `JSON.parse` → validate `typeof parsed.debrief === 'string' && parsed.debrief.trim().length > 0`.
- `text = firstNSentences(parsed.debrief.trim(), 3)` — defensive trim (`/(?<=[.!?])\s+/` split, rejoin first 3).
- Returns `{ text, model: config.model }`.
- Exported from `src/lib/ai/index.ts` alongside the result type.

### 3. Prompt: `src/lib/ai/prompts/session-debrief/{index.ts,v1.ts}`

System prompt (v1), key clauses:

- Role: a strength coach reviewing a client's just-finished workout.
- Output: JSON `{"debrief": "..."}`, **at most 3 sentences**.
- Content: exactly one concrete observation about _this_ session + one specific change to try next session.
- Ban: generic encouragement ("great job", "keep it up", "well done").
- No-plan branch: "If this session followed no plan, comment on total volume, the session rating, and progression versus recent sessions instead of plan adherence."
- Language: respect the envelope's language instruction (reuse `formatLanguageInstruction(ctx.language)`).

`index.ts` exports `SESSION_DEBRIEF_SYSTEM_PROMPT` (current = v1), matching the sibling prompt dirs.

### 4. `WorkoutSession.debrief` + `saveSession` returns the record

```ts
interface SessionDebrief {
  text: string;
  generatedAt: string; // ISO
  model: string;
}
// WorkoutSession.debrief?: SessionDebrief
```

`saveSession(session): WorkoutSession` — return the `record` it already constructs. `updateSession` stays `void`; the debrief is persisted through it (`updateSession({ ...saved, debrief })`), and its existing "recompute evaluation, keep snapshot" behaviour is untouched — `debrief` just rides along. The "editing doesn't regenerate" guarantee is automatic: nothing in `updateSession` touches `debrief`, and generation only runs in the finish flow.

### 5. Finish flow — third view in `SessionCompleteOverlay`

`view: 'summary' | 'rating' | 'debrief'`.

New props:

```ts
onRated: (rating?: 1|2|3|4|5) => Promise<WorkoutSession>;  // saves, returns stored record
onDebrief: (session: WorkoutSession, debrief: SessionDebrief) => void;  // persists debrief
onClose: () => void;  // final teardown (achievement sync etc.)
debriefEnabled: boolean;  // getLlmConfig() present && isAiDebriefEnabled()
```

Flow:

1. `summary` → `rating` (unchanged).
2. User taps a rating (or skip). Overlay calls `await onRated(value)` → gets `saved`.
3. If `!debriefEnabled` → `onClose()` immediately (today's behaviour).
4. Else → `view = 'debrief'`, render the celebration header + a debrief area in `loading`. Fire `generateSessionDebrief(buildAiContext('session-debrief'), saved)`.
   - success → `onDebrief(saved, { text, generatedAt: now, model })`, render the paragraph + a "Done" button → `onClose()`.
   - failure → render nothing extra, just the "Done" button → `onClose()`.
5. A persistent close affordance (tap-outside / a "Skip" link) calls `onClose()` at any point; an in-flight request still resolves and, on success, still calls `onDebrief` — but `onDebrief` must tolerate being called after unmount (it writes straight to storage via `updateSession`, no React state).

`SessionView` wires `onRated` to a new `onFinish`-that-returns-the-session, `onDebrief` to `updateSession`, `onClose` to the current `onDismiss` body (achievement sync). `page.tsx` `handleFinish` returns the `saveSession` result.

_Alternative — a separate `step: 'debrief'` in `page.tsx` with its own view:_ rejected — duplicates the celebration/stats markup that lives in the overlay, and the issue says "renders on the existing celebration screen".

### 6. History detail — `<SessionDebriefCard>`

Small shared presentational component (`text` + a subtle "AI debrief" label + sparkle icon), reused by the overlay's debrief view and the history page. On `history/[id]`, render `session.debrief && !isEditing` between `<PageHeader>` and the tab strip.

### 7. Setting: `wst_ai_debrief_enabled`

`KEYS.aiDebriefEnabled`; `isAiDebriefEnabled(): boolean` (default `true`, `=== 'false'` → off); `setAiDebriefEnabled(on: boolean)`. A toggle row in `AiConfigCard` under the model field, shown whenever the card is (it already only matters with a key). Excluded from the export payload like the other client-only flags.

## Risks / Trade-offs

- **Overlay owns an async side effect** → keep it contained: the overlay never blocks dismiss on the promise, and `onDebrief` writes through storage (not React state) so a late resolve after unmount is harmless. A test asserts dismiss-during-loading still closes.
- **Model ignores the 3-sentence cap** → defensive `firstNSentences` trim before persist; a unit test covers a 5-sentence response.
- **Cost creep** → one call, `gpt-4o-mini`, envelope (~1–1.5k tokens) + strip in, ≤ ~120 out ≈ $0.0002–0.0004/session — an order of magnitude under the $0.003 target. No loop, no reton-open.
- **`saveSession` signature change** → additive (was `void`); the one existing caller in `page.tsx` and the two in `NewHistorySessionSheet` ignore the return, still compile.
- **Stale `AiFeature` spec text** → this change's delta rewrites the union to match the code (`exercise-suggest` was already there) plus `session-debrief`.
- **No debrief when generation fails** → accepted for v1; the issue rules out backfill and re-gen. A manual "generate" affordance is a clean follow-up.

## Migration Plan

1. Types + `saveSession` return + setting getters/setters (no behaviour change).
2. Prompt + `generateSessionDebrief` + envelope `AiFeature` member + tests.
3. Overlay third view + `SessionView` / `page.tsx` wiring + `SessionDebriefCard`.
4. History detail card + `AiConfigCard` toggle + i18n.
5. Docs.

Rollback: `debrief` is optional and ignored by every current reader; removing the code leaves harmless persisted objects. The setting key is inert without the code.
