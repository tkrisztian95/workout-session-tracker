## Why

Many workout routines are published as YouTube videos where the full exercise
list (exercises, sets, reps, durations) lives in the video description. Today a
user has to read that description and re-type every exercise into a plan day by
hand. Letting a user paste a YouTube link and have the app build the day for
them removes that friction and reuses the AI parsing the app already has for
notes import.

The app is fully client-side, so the description is fetched through a tiny
server-side route that calls the official **YouTube Data API v3** with a
server-only API key (kept off the client so it never leaks). This is the first
server route in the app; the rest of the flow reuses the existing
provider-agnostic LLM client and the `PlanDay` data model, so no persisted
schema changes are required.

No existing GitHub issue covers this (searched `tkrisztian95/workout-session-tracker`
for "youtube", "video description", "import day" — 0 matches).

## What Changes

- A new **server route** resolves a pasted YouTube URL (watch, `youtu.be`,
  Shorts, or embed form) to the video's title and description by calling the
  YouTube Data API v3 server-side, using a server-only `YOUTUBE_API_KEY`.
- A new **"Import from YouTube"** entry on the Plans screen opens a modal where
  the user pastes a link. The app fetches the description, sends it through the
  existing LLM pipeline (the user's configured OpenAI/Gemini key), and parses it
  into a single workout **day** (`PlanDay`: name, weekdays, core + optional
  exercises).
- The parsed day is shown in an **editable review step** (reusing the existing
  day editor) with a **target picker**: add the day to an existing plan the user
  chooses, or create a brand-new plan containing just that day.
- On confirm, the day is appended to the chosen plan (or a new plan is created)
  and saved to localStorage using the existing plan/day structures.
- Guardrail: if the description is not a workout, the user sees a clear message
  and can edit the link or fall back to manual entry.

## Capabilities

### New Capabilities

- `youtube-description-fetch`: A server route that accepts a YouTube URL or
  video id and returns the video's title and description via the YouTube Data
  API v3 (server-only key), with structured errors for invalid/unavailable
  videos and a missing-key case.
- `youtube-day-import`: Paste a YouTube link, AI-parse its description into a
  workout day, review/edit it, and add it to a chosen existing plan or a new
  plan.

## Impact

- **New** `src/app/api/youtube-description/route.ts` — first server route in the
  app; the project is no longer a pure static export. Reads a server-only
  `YOUTUBE_API_KEY` (documented in `.env.example` + README).
- **New** AI module + prompt for parsing a description into a `PlanDay`; extends
  the `AiFeature` union with a `youtube-day-import` member.
- **New** modal component for the paste → fetch → review → save flow; new entry
  point on `src/app/plans/page.tsx`. Reuses `PlanDayEditor` for the review step.
- Reuses `savePlan` / `getPlans`; appends a `PlanDay` to an existing plan or
  creates a new `WorkoutPlan`. **No localStorage schema changes** — `PlanDay`,
  `PlanExercise`, and `WorkoutPlan` are unchanged, so `docs/data-structure.md`
  needs no update.
- New i18n strings for the modal/UI across `en`, `hu`, `de`.
