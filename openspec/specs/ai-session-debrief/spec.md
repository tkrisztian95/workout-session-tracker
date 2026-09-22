# ai-session-debrief Specification

## Purpose

Turns the deterministic per-session evaluation into one short, specific paragraph of coaching — generated once when a session is finished, persisted on the session, and shown on the celebration screen and in history — so the post-workout moment carries a concrete takeaway instead of raw counts.

## Requirements

### Requirement: Persisted debrief shape

A finished `WorkoutSession` MAY carry an optional `debrief` object. When present it SHALL have the shape `{ text: string; generatedAt: string; model: string }` where `text` is the debrief paragraph, `generatedAt` is an ISO timestamp, and `model` is the LLM model id that produced it. The field SHALL be absent until a debrief is successfully generated, and SHALL remain absent when generation is disabled or fails.

#### Scenario: Debrief is written once

- **WHEN** a debrief is successfully generated for a session
- **THEN** `session.debrief` SHALL be persisted with `text`, `generatedAt`, and `model`

#### Scenario: Debrief is never regenerated

- **WHEN** a session that already has a `debrief` is opened again — on the celebration screen or in history
- **THEN** the stored `debrief.text` SHALL be shown verbatim and no new LLM call SHALL be made

#### Scenario: Editing a session does not regenerate the debrief

- **WHEN** a completed session with a `debrief` is edited and saved
- **THEN** `session.debrief` SHALL be left unchanged

### Requirement: Generation on session finish

When a session is finished, and only then, the system SHALL attempt to generate a debrief — provided a valid LLM config exists and the debrief setting is enabled. Generation SHALL use exactly one `callLlm` request built from `buildAiContext('session-debrief')` plus the just-finished session and its `evaluation`. The response SHALL be requested and parsed as JSON `{ "debrief": string }`.

#### Scenario: Generated from the finished session and the envelope

- **WHEN** a session is finished with a valid LLM config and the setting enabled
- **THEN** exactly one LLM request SHALL be made, its prompt SHALL include the session's evaluation summary and recent-history context, and on success the returned text SHALL be persisted and shown

#### Scenario: No config — silent skip

- **WHEN** a session is finished and no valid LLM config is saved
- **THEN** no LLM request SHALL be made, no `debrief` SHALL be written, and the finish flow SHALL complete exactly as it does without this feature

#### Scenario: Setting disabled — silent skip

- **WHEN** the debrief setting is disabled and a session is finished
- **THEN** no LLM request SHALL be made and no `debrief` SHALL be written

#### Scenario: Generation failure degrades quietly

- **WHEN** the LLM request fails or returns an unparseable / empty response
- **THEN** no `debrief` SHALL be written, the celebration screen SHALL fall back to its normal completed state, and the user SHALL NOT be shown a retry loop

### Requirement: Debrief content constraints

The prompt SHALL instruct the model to return at most three sentences containing one concrete observation about the session and one specific, actionable change for the next session, and SHALL forbid generic praise ("great job"). The client SHALL defensively truncate the response to the first three sentences before persisting.

#### Scenario: Over-long response is trimmed

- **WHEN** the model returns more than three sentences
- **THEN** only the first three sentences SHALL be persisted and displayed

#### Scenario: No-plan session still produces a useful debrief

- **WHEN** a session finished with `evaluation.overall === 'no-plan'` is debriefed
- **THEN** the prompt SHALL direct the model to comment on volume, rating, and progression rather than plan deviation, and a debrief SHALL still be produced

### Requirement: Inline presentation on the celebration screen

The debrief SHALL render inline within the existing session-complete celebration screen — not as a separate modal or a blocking dialog. While the request is in flight a lightweight loading state SHALL be shown; the user SHALL be able to dismiss the celebration screen at any time without waiting for the debrief.

#### Scenario: Loading state then paragraph

- **WHEN** the debrief request is in flight
- **THEN** the celebration screen SHALL show a compact loading indicator in the debrief area, replaced by the paragraph when the response arrives

#### Scenario: Dismiss is never blocked

- **WHEN** the user dismisses the celebration screen while the debrief is still loading
- **THEN** the screen SHALL close normally; if the response later succeeds it SHALL still be persisted to the session

### Requirement: Re-readable in history

The session detail page SHALL display a session's persisted `debrief.text` in a card above the Exercises / Timeline / vs Plan tabs. The card SHALL be absent when the session has no `debrief` and while the session is being edited.

#### Scenario: Debrief card shown on history detail

- **WHEN** a session with a `debrief` is opened in history and not being edited
- **THEN** its `debrief.text` SHALL be shown in a card above the tab strip

#### Scenario: No card without a debrief

- **WHEN** a session without a `debrief` is opened in history
- **THEN** no debrief card SHALL be rendered

### Requirement: Skippable from settings

The AI configuration section SHALL include a control to enable or disable the session debrief, persisted under `wst_ai_debrief_enabled`. The default SHALL be enabled. The setting SHALL only gate generation — an existing persisted `debrief` SHALL still be shown in history when the setting is off.

#### Scenario: Toggle persists

- **WHEN** the user turns the debrief setting off
- **THEN** `wst_ai_debrief_enabled` SHALL be persisted as disabled and subsequent session finishes SHALL not generate a debrief

#### Scenario: Existing debriefs survive turning the setting off

- **WHEN** the setting is off and a past session that already has a `debrief` is opened
- **THEN** the stored debrief SHALL still be displayed

### Requirement: Skip reasons in debrief input

When the finished session contains skipped exercises, the facts sent to the model for the debrief SHALL list each skipped exercise by name with its skip reason and skip note when present. The debrief system prompt SHALL instruct the model that it may acknowledge a pain or injury skip with a brief, non-medical remark, and SHALL NOT give medical advice or diagnoses. Skipped exercises without a reason SHALL still be listed by name.

#### Scenario: Pain skip reaches the prompt

- **WHEN** a session finishes with "Overhead Press" skipped for Pain / injury with note "right shoulder"
- **THEN** the debrief request includes "Overhead Press", the pain reason, and the note "right shoulder"

#### Scenario: Skip without reason reaches the prompt

- **WHEN** a session finishes with an exercise skipped without a reason
- **THEN** the debrief request lists that exercise as skipped with no reason

#### Scenario: No skips

- **WHEN** a session finishes with no skipped exercises
- **THEN** the debrief request contains no skipped-exercise section
