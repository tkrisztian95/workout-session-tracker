## Context

The app is client-only: state lives in `localStorage`, and every AI feature
calls the LLM directly from the browser via `src/lib/ai/client.ts` (`callLlm`,
routing to OpenAI or Gemini with the user's stored key). There is no backend —
`next.config.ts` sets no `output: 'export'`, but no route handlers exist yet.

Existing reusable pieces:

- `src/lib/ai/plan.ts` — `suggestPlan()` parses an LLM JSON response into a
  `WorkoutPlan`, with `ensureIds`, `normalizePlanExerciseMuscle`, and
  `normalizePlanExerciseReps` helpers that already enforce the
  `reps`/`repsPerSet` invariant and coerce muscle values. These are exported and
  reusable for parsing a single day.
- `src/lib/ai/context.ts` — `buildAiContext(feature)` builds the AI envelope;
  `AiFeature` is a closed union that new features MUST extend.
- `src/lib/ai/index.ts` — `AiValidationError` for non-fitness input guardrails.
- `src/components/PlanDayEditor.tsx` — full editor for a single `PlanDay`
  (used inside `PlanForm`), perfect for the review/edit step.
- `src/components/AiPlanSuggestionModal.tsx` — the canonical pattern for an
  AI-backed modal (input → loading → review → apply, error + validation states).
- `src/lib/storage.ts` — `getPlans()`, `savePlan(plan)` (upsert by id).

The only genuinely new architectural element is a server route to fetch the
YouTube description, because the browser cannot read `youtube.com` cross-origin.

## Goals / Non-Goals

**Goals**

- Paste any common YouTube URL form → get the video's title + description
  server-side, reliably, with clear errors.
- Parse that description into one `PlanDay` using the existing LLM pipeline.
- Let the user review/edit the day and choose a destination plan (existing or
  new) before saving.
- Zero changes to persisted data shapes.

**Non-Goals**

- Parsing multiple days from one video (one video → one day).
- Scraping the YouTube watch page or using the unofficial InnerTube endpoints
  (unreliable: consent walls + bot checks).
- Exposing the API key to the browser — it stays a server-only env var.
- Fetching captions/transcript or video frames — description text only.
- Importing into an in-progress session (this is plan authoring, not logging).

## Decisions

### 1. Fetch the description via a server route calling the YouTube Data API v3

Add `src/app/api/youtube-description/route.ts` (a `GET` handler taking
`?url=` or `?v=`). It calls the official **YouTube Data API v3**
(`videos.list?part=snippet`) server-side with a key read from the
server-only `YOUTUBE_API_KEY` env var, and returns the snippet's title +
description.

**Why the route still exists** even though the Data API is CORS-enabled (so a
browser _could_ call it): the API key must stay secret. Keeping the call
server-side means the key is never inlined into the client bundle. **Trade-off**:
the app requires a server runtime (e.g. Vercel) for this one route and is no
longer a pure static export — accepted per product decision. Without the env var
the route returns `not_configured` and the rest of the app is unaffected.

**Why the Data API over scraping**: the watch page / InnerTube endpoints return
consent walls and bot checks to server requests, producing false
"video unavailable" errors. The Data API is the supported, stable contract and
is free at hobby scale (10,000 units/day; a snippet fetch is 1 unit).

### 2. Description extraction (Data API snippet)

The Data API returns clean JSON. A pure helper `pickVideoSnippet(data)` in
`src/lib/youtubeData.ts` reads `items[0].snippet.title` /
`.snippet.description` (the full, untruncated description), returning `null`
when `items` is empty.

Return a typed `{ videoId, title, description }`. Otherwise return a structured
error (`{ error: 'invalid_url' | 'not_configured' | 'not_found' | 'no_description' | 'fetch_failed' }`)
with an appropriate HTTP status so the client can show a localized message:
empty `items` → `not_found`; blank description → `no_description`; non-OK HTTP
(quota/key/network) → `fetch_failed`. The pure parser is unit-tested; the route
logs the Data API error reason server-side for diagnosis.

### 3. URL parsing is shared and pure

A small pure helper `parseYoutubeId(input: string): string | null` handles
`watch?v=`, `youtu.be/<id>`, `/shorts/<id>`, `/embed/<id>`, and bare 11-char
ids. It is unit-tested and used by both the route (to validate input) and the
client (to validate before calling the route / show inline errors fast).

### 4. New AI module: `parseYoutubeDay`

Add `src/lib/ai/youtubeDay.ts` exporting
`parseYoutubeDay(config, ctx, video): Promise<AiYoutubeDayResult>` where
`AiYoutubeDayResult = Omit<PlanDay, 'id'> & { reasoning?: string }`. It builds a
user message from the video title + description (plus language instruction from
`ctx`), calls `callLlm` with a new system prompt, parses the JSON, applies the
`AiValidationError` guardrail (`valid: false`), and reuses `ensureIds` +
`normalizePlanExerciseMuscle` + `normalizePlanExerciseReps` from `plan.ts` to
produce clean `coreExercises` / `optionalExercises`.

The prompt lives at `src/lib/ai/prompts/youtube-day/` (versioned `v1.ts` +
`index.ts` exporting `current`), matching the existing prompt-versioning layout.
Export the function and result type from `src/lib/ai/index.ts`.

Extend `AiFeature` with `'youtube-day-import'` so `buildAiContext('youtube-day-import')`
is type-valid (no field-shaping behavior needed yet).

### 5. UI flow: `YoutubeDayImportModal`

Mirror `AiPlanSuggestionModal`. View states:

| View      | Content                                                                 |
| --------- | ----------------------------------------------------------------------- |
| `input`   | URL text field + "Fetch" action; inline validation via `parseYoutubeId` |
| `loading` | spinner while fetching the description and parsing it                   |
| `review`  | `PlanDayEditor` pre-filled with the parsed day + a destination picker   |
| `error`   | fetch/parse/validation error with retry / edit-link affordance          |

The **destination picker** is a select of active plans (from `getPlans()`) plus
a "Create new plan" option (with a name field defaulting to the video title).

On confirm:

- Existing plan: load it, push the (edited) day onto `plan.days`, bump
  `updatedAt`, `savePlan(plan)`.
- New plan: build a `WorkoutPlan` with `days: [day]`, `aiGenerated: true`,
  timestamps, and `savePlan`.

The modal is opened from a new button on `src/app/plans/page.tsx`, alongside the
existing AI-suggest entry. The parent refreshes its plan list after save (same
pattern as the AI-suggest apply handler) and can navigate to the target plan.

**Why reuse `PlanDayEditor`**: editing parity with manual day creation for free,
and it already enforces the exercise field rules — no bespoke review UI to keep
in sync.

### 6. No persisted schema changes

The flow only ever appends an existing-shaped `PlanDay` to an existing-shaped
`WorkoutPlan`, or creates a `WorkoutPlan` from current fields. No new
`localStorage` keys, types, or migrations → `docs/data-structure.md` is
untouched. The AI-import provenance is captured by the existing `aiGenerated`
flag on new plans.

## Risks / Trade-offs

- **API key required**: the feature needs a free `YOUTUBE_API_KEY`. Mitigation:
  documented in `.env.example` + README; the route degrades to a clear
  `not_configured` message rather than breaking the app.
- **Daily quota**: the Data API allows 10,000 units/day (1 unit per snippet
  fetch). Far beyond hobby scale; `fetch_failed` surfaces a `quotaExceeded`
  reason in the server log if it ever trips.
- **Server runtime requirement**: the app gains a backend dependency for this one
  route. Accepted; documented in the proposal.
- **Description quality varies**: some videos bury the workout in prose. The LLM
  guardrail + editable review step handle imperfect inputs without bad saves.

## Migration Plan

None — additive feature with no data migration. The route is new; existing flows
are unchanged.

## Open Questions

- Should fetched description text be capped before sending to the LLM to bound
  token cost? (Proposed: truncate to a generous character budget in
  `parseYoutubeDay`; revisit if descriptions exceed it.)
