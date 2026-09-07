## MODIFIED Requirements

### Requirement: Feature-aware factory signature

`buildAiContext` SHALL accept a `feature` parameter typed as the literal union `'plan-suggest' | 'exercise-swap' | 'exercise-suggest' | 'plan-adjust' | 'notes-import' | 'session-debrief'`. The factory MAY use this parameter to vary which fields are populated for performance or relevance reasons.

#### Scenario: Feature parameter is exhaustive at compile time

- **WHEN** a new AI feature is added that calls `buildAiContext`
- **THEN** TypeScript SHALL require the developer to extend the `AiFeature` union, ensuring the new feature is explicitly accounted for

#### Scenario: Session debrief builds its context through the envelope

- **WHEN** the session-finish flow generates a debrief
- **THEN** it SHALL call `buildAiContext('session-debrief')` and build its prompt from envelope fields plus the just-finished session, and SHALL NOT read `localStorage` or storage getters directly for prompt construction
