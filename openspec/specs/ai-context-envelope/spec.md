# ai-context-envelope Specification

## Purpose

TBD - created by archiving change ai-context-envelope. Update Purpose after archive.

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

The `AiContext` type SHALL include the following populated fields in Phase 1: `profile`, `activePlans`, `recentSessions`, `progression`. The envelope SHALL also include the following optional, declared-but-unpopulated fields: `preferences`, `evaluation`, `likes`.

#### Scenario: Populated fields are always defined when their underlying data exists

- **WHEN** `buildAiContext('plan-suggest')` is called and the user has at least one active plan, one completed session, and a populated profile
- **THEN** the returned envelope SHALL have `profile`, `activePlans`, `recentSessions`, and `progression` defined with non-empty values

#### Scenario: Deferred fields are undefined in Phase 1

- **WHEN** `buildAiContext` is called for any feature
- **THEN** `preferences`, `evaluation`, and `likes` SHALL be `undefined` in the returned envelope until their feeder issues (#52, #53, #54) ship

#### Scenario: Empty-state user produces a coherent envelope

- **WHEN** `buildAiContext('plan-suggest')` is called for a user with no profile metrics, no plans, and no sessions
- **THEN** the returned envelope SHALL have `profile` with all fields undefined, `activePlans` as `[]`, `recentSessions` as `[]`, and `progression` as `[]` — never `null` or throwing

### Requirement: Compressed session summary

The envelope's `recentSessions` field SHALL carry `SessionSummary[]`, a compact projection of `WorkoutSession` containing only fields used by AI prompts. Raw `WorkoutSession` objects (including full `loggedSets`) SHALL NOT be embedded in the envelope.

#### Scenario: Session summary excludes per-set logs

- **WHEN** a `SessionSummary` is built from a `WorkoutSession` whose exercises each contain 20 logged sets
- **THEN** the `SessionSummary` SHALL include the session's `id`, `completedAt`, optional `planId` / `planDayName` / `rating` / `durationMin` / `totalVolumeKg`, an `exerciseCount`, and a `topExercises` array of `{ name, muscle?, bestWeightKg?, sets }`, but SHALL NOT include the raw `loggedSets` arrays

#### Scenario: Recent sessions are sorted newest-first and capped

- **WHEN** `buildAiContext` is called for a user with 100 completed sessions
- **THEN** `recentSessions` SHALL contain at most `RECENT_SESSIONS_LIMIT` (20) entries, sorted with the most recent `completedAt` first

### Requirement: Feature-aware factory signature

`buildAiContext` SHALL accept a `feature` parameter typed as the literal union `'plan-suggest' | 'exercise-swap' | 'plan-adjust' | 'notes-import'`. The factory MAY use this parameter to vary which fields are populated for performance or relevance reasons.

#### Scenario: Feature parameter is exhaustive at compile time

- **WHEN** a new AI feature is added that calls `buildAiContext`
- **THEN** TypeScript SHALL require the developer to extend the `AiFeature` union, ensuring the new feature is explicitly accounted for

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
