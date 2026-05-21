# AI Milestone — From Feature to Coach

Working plan for evolving the app's AI surface beyond shallow "generate a plan" prompts toward a context-rich coach that survives a future Auth0 + Atlas pivot.

> **Status:** plan, not contract. Items move between sections as they ship or change. Last reviewed: 2026-05-21.

---

## Why this milestone exists

The current AI surface (plan suggestion, exercise swap, import-from-notes) works but is shallow: each feature serializes its own subset of `localStorage` into a one-shot prompt and parses JSON back. The output side is decent because the underlying model is decent — not because the app is doing anything special.

This milestone is about turning that into actual product moat:

- **One shared context envelope** so every AI feature gets the same view of the user's training reality.
- **A coach surface inside the active session**, not just at plan-generation time.
- **Infrastructure choices** (Vercel AI Gateway, AI SDK v6, structured tool calls) that survive the Auth0 + Atlas migration without rewrites.

Two milestones, sequentially:

1. **M1 — AI Infrastructure.** Foundation work that makes every subsequent AI feature cheaper to add.
2. **M2 — One headline feature.** In-session AI coaching OR session debrief. Not both.

Subsequent milestones (M3+) are placeholders and may be re-scoped once M1+M2 ship.

---

## M1 — AI Infrastructure

**Goal:** make every future AI feature a one-file change, not a stack of plumbing.

### Tasks

1. **Migrate to Vercel AI Gateway + AI SDK v6.**
   - Replace direct OpenAI client calls in [`src/lib/ai/`](../src/lib/ai/) with the [`ai`](https://sdk.vercel.ai/docs) package.
   - Address models as `"openai/gpt-4o-mini"` strings via the Gateway, not via `@ai-sdk/openai` directly.
   - User's BYOK key passes through unchanged during this milestone — Gateway just adds observability and a provider-swap seam.
   - Acceptance: every existing AI call (plan suggestion, exercise swap, notes import) goes through one `generateText` / `streamText` / `generateObject` shape.

2. **Extract `buildAiContext()` — the context envelope.**
   - One function in `src/lib/ai/context.ts` that builds the user's training reality for any AI feature.
   - Inputs: feature name (`"plan-suggest"` / `"exercise-swap"` / etc.), optional overrides.
   - Output: a typed envelope of the form:
     ```ts
     interface AiContext {
       profile: { name?: string; sex?: Sex; age?: number; heightCm?: number; weightKg?: number };
       preferences: {
         locations?: string[]; // from onboarding (issue #53)
         equipment?: string[];
         focus?: string[];
         sessionsPerWeek?: number;
         sessionLengthMin?: number;
       };
       activePlans: WorkoutPlan[]; // status: active
       recentSessions: SessionSummary[]; // last N, capped by token budget
       progression: ExerciseProgression[]; // per-exercise weight trend
       evaluation?: SessionEvaluation[]; // from issue #54 when shipped
       likes?: { liked: string[]; disliked: string[] }; // from issue #52 when shipped
     }
     ```
   - Each AI feature picks fields it needs. Prompt templates live next to the feature, not next to the context builder.
   - Acceptance: removing a field from the envelope breaks all callers in one obvious place, not in 15 prompt strings.

3. **`<AiStream>` UI primitive.**
   - Reusable component that handles: idle → loading skeleton → streaming token output → done → error / retry.
   - Today each AI modal reinvents this state machine — see [`AiPlanSuggestionModal.tsx`](../src/components/AiPlanSuggestionModal.tsx), [`AiExerciseSwapModal.tsx`](../src/components/AiExerciseSwapModal.tsx), etc.
   - Acceptance: a new AI feature's modal/sheet is < 50 lines of UI.

4. **Tool calling, not JSON-text parsing.**
   - When the AI mutates state (swap exercise, adjust plan day, log a set), use AI SDK structured tool calls — not JSON returned in text.
   - Each tool: typed Zod schema, server-side validator, idempotent.
   - Acceptance: zero `JSON.parse(response)` calls in `src/lib/ai/`.

5. **Token telemetry.**
   - PostHog event `ai_call_completed` with: `feature`, `model`, `tokens_in`, `tokens_out`, `latency_ms`, `success`.
   - Console-log the same payload during dev so cost is visible while coding.
   - Acceptance: any AI call missing telemetry is caught by a lint rule or wrapper assertion.

6. **Context budget guard.**
   - The envelope from task 2 is unbounded — a power user with 6 months of sessions has too many to send. Cap by token budget (per model) and feature.
   - Strategy: prefer recency, prefer relevance to the feature's prompt, summarize older history into the `evaluation` strip.
   - Acceptance: envelope never exceeds 60% of a model's context window, even for synthetic worst-case inputs.

### Non-goals for M1

- New AI features. Pure plumbing.
- Server-side proxy. AI requests still leave the user's browser with the user's key.
- Model fallbacks / multi-provider. Gateway makes this trivial later; not needed yet.
- Embedding generation. Vector storage is M3+ when Atlas lands.

### M1 acceptance

- All four existing AI features run on the new infra with no regression.
- A new "Hello World" AI feature can be added in < 100 lines of new code, exclusive of prompt content.
- PostHog dashboard shows token usage per feature within 24 hours of release.

---

## M2 — One headline feature

Pick **one** of the following. Don't sprawl. The point is to validate that M1 makes feature work cheap.

### Option A — In-session AI coach

Per-set recommendations during the active session. After each logged set, the focused exercise card shows a small AI suggestion: _"Last set: 70 kg × 8. Suggest 72.5 × 6–8 next. You hit 8 reps last week; one more rep this week is a reasonable progression."_

**Why pick this:** the active-session view is the highest-engagement surface in the app — every set, every session. Adding intelligence here is the closest thing to "this app coaches me" that's achievable in M2.

**Effort:** ~weekend. Uses the envelope from M1. Per-set call to `generateObject` with a Zod schema of `{ recommendation: string; weightKg: number; repsLow: number; repsHigh: number }`. Renders inline.

**Risks:** AI quality varies wildly on micro-decisions like "should I add 2.5 kg this week?". Mitigation: show recommendation as a _suggestion_ the user can ignore, not as a target the UI nags about. Also, runs 1 inference per logged set — token cost goes up. Telemetry from M1 catches this.

### Option B — AI session debrief

When a session is marked finished, the celebration screen shows a one-paragraph AI debrief generated from the session-evaluation meta (issue #54). _"You overdid bench, underperformed squat. Squat is likely fatigued from yesterday's deadlift. Try deloading squat by 5% next session, or move it earlier in the week."_

**Why pick this:** zero in-session token cost (one inference per session, not per set). Builds on issue #54 which you've already designed. Surfaces AI at a high-emotion moment (post-workout) without interrupting the workout itself.

**Effort:** ~weekend, but requires issue #54 to ship first.

**Risks:** users may not read it. Mitigation: keep it short (max 3 sentences), don't make it a modal.

### My pick (advisory only)

**Option A.** Higher leverage, validates M1's `<AiStream>` primitive on a streaming use case, and visibly differentiates from every other tracker. B is also good but feels closer to a feature than a moat.

### M2 acceptance

- The chosen feature ships behind the existing `wst_llm_config.apiKey` gate.
- Token telemetry from M1 confirms the per-call cost is < $0.005 average on `gpt-4o-mini`.
- Manual usability check: the feature feels native to the session flow, not a sidebar.

---

## M3 — Conversational adjust (placeholder)

After M2 ships, the natural next step is conversational mid-session adjustments: _"I'm tired today, can we shorten this?"_ → AI restructures remaining exercises in place.

**Prerequisites:**

- AI SDK tool-calling primitives from M1.
- A persistent "session conversation" thread (in memory + opportunistically persisted). Don't store conversation history in `localStorage` long-term — quota will blow up. Treat as session-local state until M5 (Atlas).
- Voice input is _not_ part of M3. Text only.

Scope this with `/opsx:propose conversational-session-adjust` when M2 has shipped.

---

## M4 — Goal-driven progression (placeholder)

The real coaching feature. User states a goal (_"hit 100 kg bench in 3 months"_), AI plans the progression, adjusts weekly based on actual performance against the per-session evaluation meta (issue #54).

This is the feature that would justify a SaaS pivot.

**Prerequisites:**

- M1 (infra), M2 (in-session coach), M3 (conversational) ideally all shipped.
- Reliable session-evaluation meta (issue #54).
- A goals data model — new persisted type `Goal`, new `wst_goals` key. Scope with `/opsx:propose goal-driven-progression`.

---

## M5 — Cross-device sync foundation (Auth0 + Atlas)

Out of scope for the AI milestone strictly, but flagged here because every M1–M4 architectural decision needs to remain compatible.

### Forward-compat rules during M1–M4

1. **All persistence goes through `src/lib/storage.ts`.** No new feature reads or writes `localStorage` directly. When Atlas lands, only `storage.ts` changes.
2. **`schemaVersion` bumps every persisted-shape change.** Migrations on read. This is already the convention — keep it strict.
3. **AI key handling stays purely client-side until M5.** The moment auth lands, all AI calls move behind a server route (Vercel Function). Plan now: every AI client function accepts a `getKey()` injection so the production swap is one line. **Do not** scatter `process.env.NEXT_PUBLIC_OPENAI_KEY` reads or `localStorage.getItem('wst_llm_config')` calls across the codebase.
4. **Vector search is a "later" feature.** Atlas has native vector search. When sessions live in Atlas, every session note and exercise becomes semantically searchable. Design session schema so a sibling `embeddings` collection keyed by sessionId is trivial to add — i.e., session IDs should be stable across export/import and migration.
5. **Token costs flip from user → maintainer at M5.** The telemetry from M1 is what tells you whether to keep BYOK as a free tier option, gate AI behind a paid tier, or eat the cost. Don't decide this before the data exists.

---

## Open issues feeding this milestone

| Issue                                                                    | Title                                                        | Role                                                                                                                                                |
| ------------------------------------------------------------------------ | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#52](https://github.com/tkrisztian95/workout-session-tracker/issues/52) | Mark exercises as liked / disliked                           | Feeds `likes` field in `AiContext` envelope.                                                                                                        |
| [#53](https://github.com/tkrisztian95/workout-session-tracker/issues/53) | Onboarding: capture equipment access + training preferences  | Feeds `preferences` field in `AiContext` envelope. M1 should ship with empty-tolerance for these fields so it doesn't block on the onboarding work. |
| [#54](https://github.com/tkrisztian95/workout-session-tracker/issues/54) | Persist per-session evaluation meta for cheaper AI prompting | Feeds `evaluation` field in `AiContext` envelope. Prerequisite for M2 Option B and M3.                                                              |

All three should land before M3 starts; M1 and M2A (in-session coach) can ship before any of them.

---

## Non-goals across the whole milestone

- Native iOS / Android apps.
- Self-hosted LLM (Llama, etc.) — Gateway abstracts this, but no work to enable it.
- AI-generated form-cue videos / animations.
- Multi-user / shared / social AI features (no multi-user concept until M5+).
- "AI Profile Coach" / "AI Form Critique" / any feature whose surface isn't directly in the session or plan flow.

---

## Cadence

This milestone is meant to be worked through over multiple weekends, not in one sprint. Reassess at the end of each ship:

- After M1: is the new infra actually cheaper to add features on? If not, fix it before M2.
- After M2: did users (= you, friends, OSS contributors) notice the change? If not, the feature wasn't right; pick the other option.
- Before M5: re-read this doc and rewrite anything that turned out to be wrong.
