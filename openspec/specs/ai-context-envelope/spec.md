# ai-context-envelope Specification

## Purpose

Defines the single typed `AiContext` envelope and its `buildAiContext` factory — the one path every AI feature uses to assemble prompt context, so storage reads and the compressed session projection live in exactly one place.

## Requirements

### Requirement: Single AI context envelope

The system SHALL expose a single, typed `AiContext` envelope and a `buildAiContext(feature, options?)` factory in `src/lib/ai/context.ts` that every AI feature uses to assemble its prompt context. AI feature modules SHALL NOT read `localStorage` directly or via storage getters for prompt construction; they SHALL consume the envelope.

#### Scenario: Envelope is the only path into AI prompt construction

- **WHEN** any AI feature (plan suggestion, exercise swap, plan adjust, notes import) is invoked
- **THEN** its entry point SHALL accept an `AiContext` parameter (or build one internally via `buildAiContext`) and SHALL NOT call `getSex` / `getAge` / `getHeightCm` / `getWeightKg` / `getPlans` / `getSessions` / `getRecentExerciseNames` from `src/lib/storage.ts` itself

#### Scenario: Envelope reads through storage helpers

- **WHEN** `buildAiContext` populates a field
- **THEN** it SHALL read state via functions exported from `src/lib/storage.ts`, never via `localStorage.getItem` directly

### Requirement: Phase 1 envelope shape

The `AiContext` type SHALL include the following populated fields: `profile`, `activePlans`, `recentSessions`, `progression`, and `evaluation`. The envelope SHALL also include the following optional, declared-but-unpopulated fields: `preferences`, `likes`.

The `evaluation` field SHALL carry `SessionEvaluation[]` sourced from the persisted `WorkoutSession.evaluation` objects of the same sessions represented in `recentSessions`, aligned so a consumer can pair each summary with its evaluation. Sessions without a persisted evaluation SHALL be omitted from the `evaluation` array rather than represented by a placeholder.

#### Scenario: Populated fields are always defined when their underlying data exists

- **WHEN** `buildAiContext('plan-suggest')` is called and the user has at least one active plan, one completed session with a persisted evaluation, and a populated profile
- **THEN** the returned envelope SHALL have `profile`, `activePlans`, `recentSessions`, `progression`, and `evaluation` defined with non-empty values

#### Scenario: Deferred fields are undefined in Phase 1

- **WHEN** `buildAiContext` is called for any feature
- **THEN** `preferences` and `likes` SHALL be `undefined` in the returned envelope until their feeder issues (#52, #53) ship; `evaluation` SHALL NOT be `undefined` (it is populated, defaulting to `[]`)

#### Scenario: Evaluation reflects persisted session meta

- **WHEN** `buildAiContext` is called for a user whose recent sessions each carry a `SessionEvaluation`
- **THEN** the envelope's `evaluation` array SHALL contain those evaluation objects, and SHALL be capped to the same recent-session window as `recentSessions`

#### Scenario: Empty-state user produces a coherent envelope

- **WHEN** `buildAiContext('plan-suggest')` is called for a user with no profile metrics, no plans, and no sessions
- **THEN** the returned envelope SHALL have `profile` with all fields undefined, `activePlans` as `[]`, `recentSessions` as `[]`, `progression` as `[]`, and `evaluation` as `[]` — never `null` or throwing

### Requirement: Compressed session summary

The envelope's `recentSessions` field SHALL carry `SessionSummary[]`, a compact projection of `WorkoutSession` containing only fields used by AI prompts. Raw `WorkoutSession` objects (including full `loggedSets`) SHALL NOT be embedded in the envelope.

#### Scenario: Session summary excludes per-set logs

- **WHEN** a `SessionSummary` is built from a `WorkoutSession` whose exercises each contain 20 logged sets
- **THEN** the `SessionSummary` SHALL include the session's `id`, `completedAt`, optional `planId` / `planDayName` / `rating` / `durationMin` / `totalVolumeKg`, an `exerciseCount`, and a `topExercises` array of `{ name, muscle?, bestWeightKg?, sets }`, but SHALL NOT include the raw `loggedSets` arrays

#### Scenario: Recent sessions are sorted newest-first and capped

- **WHEN** `buildAiContext` is called for a user with 100 completed sessions
- **THEN** `recentSessions` SHALL contain at most `RECENT_SESSIONS_LIMIT` (20) entries, sorted with the most recent `completedAt` first

### Requirement: Feature-aware factory signature

`buildAiContext` SHALL accept a `feature` parameter typed as the literal union `'plan-suggest' | 'exercise-swap' | 'exercise-suggest' | 'plan-adjust' | 'notes-import' | 'session-debrief'`. The factory MAY use this parameter to vary which fields are populated for performance or relevance reasons.

#### Scenario: Feature parameter is exhaustive at compile time

- **WHEN** a new AI feature is added that calls `buildAiContext`
- **THEN** TypeScript SHALL require the developer to extend the `AiFeature` union, ensuring the new feature is explicitly accounted for

#### Scenario: Session debrief builds its context through the envelope

- **WHEN** the session-finish flow generates a debrief
- **THEN** it SHALL call `buildAiContext('session-debrief')` and build its prompt from envelope fields plus the just-finished session, and SHALL NOT read `localStorage` or storage getters directly for prompt construction

### Requirement: AI feature modules consume the envelope

The four existing AI feature entry points (`suggestPlan`, `swapExercise`, `adjustPlan`, `importSessions`) SHALL accept an `AiContext` instead of their current ad-hoc combinations of positional parameters and inline storage reads. System prompts and model calls (`callOpenAI`) SHALL remain unchanged.

#### Scenario: suggestPlan consumes the envelope

- **WHEN** `suggestPlan` is invoked with an `AiContext`
- **THEN** it SHALL build its user message exclusively from envelope fields plus its caller-provided arguments (preferences, language), and SHALL NOT import storage getters

#### Scenario: swapExercise gains training context

- **WHEN** `swapExercise` is invoked with an `AiContext`
- **THEN** the user message it sends to OpenAI SHALL include the user's recent training history and progression for the target exercise (which is new behavior — `swapExercise` had no history context before)

#### Scenario: adjustPlan and importSessions migrate similarly

- **WHEN** `adjustPlan` or `importSessions` is invoked
- **THEN** they SHALL consume an `AiContext` and SHALL NOT read storage directly

### Requirement: Coverage by unit tests

The envelope factory and the `SessionSummary` projection SHALL be covered by Vitest unit tests located alongside the source under `src/lib/ai/`. Tests SHALL cover empty-state, deferred-field tolerance, the newest-first / capped invariants, and the populated-fields scenarios listed above.

#### Scenario: Empty-state envelope test exists

- **WHEN** `vitest` runs
- **THEN** at least one test SHALL exercise `buildAiContext` against an empty `localStorage` and assert the envelope's invariants

### Requirement: Recent-session prompt lines carry an evaluation strip

When a recent session has a persisted `SessionEvaluation`, its rendered prompt line SHALL include a compact evaluation strip stating the overall verdict and the notable per-status counts (for example `on-target · 1 overdone · 1 underperformed`). The strip SHALL be omitted for sessions without an evaluation. The strip SHALL NOT expand into per-set detail.

#### Scenario: Session line includes the strip

- **WHEN** a recent-session prompt line is rendered for a session whose evaluation has `overall: 'on-target'`, one `overdone` and one `underperformed` exercise
- **THEN** the line SHALL contain a compact strip conveying `on-target`, `1 overdone`, and `1 underperformed`

#### Scenario: No-plan session strip focuses on volume

- **WHEN** a recent-session prompt line is rendered for a session whose evaluation has `overall: 'no-plan'`
- **THEN** the strip SHALL convey the no-plan verdict and MAY include volume / rating rather than plan-deviation counts

#### Scenario: Missing evaluation omits the strip

- **WHEN** a recent-session prompt line is rendered for a session that has no persisted evaluation
- **THEN** the line SHALL render as before with no evaluation strip and no error
