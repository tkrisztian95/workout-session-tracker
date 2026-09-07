## MODIFIED Requirements

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

## ADDED Requirements

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
