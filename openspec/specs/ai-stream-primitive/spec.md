# ai-stream-primitive Specification

## Purpose

A reusable, app-agnostic React primitive (`useAiStream` hook + `<AiStream>` wrapper component) for orchestrating AI request lifecycles — covering both one-shot Promise fetchers and streaming AsyncIterable fetchers — through a single five-state state machine with built-in ARIA live-region announcements.

## Requirements

### Requirement: useAiStream hook exposes a five-state state machine

The system SHALL expose a `useAiStream` React hook from `src/components/AiStream.tsx`. The hook SHALL track and expose a `state` value drawn from exactly the set `'idle' | 'loading' | 'streaming' | 'done' | 'error'`. The hook SHALL NOT expose intermediate or undocumented states.

#### Scenario: Initial state is idle

- **WHEN** a consumer calls `useAiStream` with `autoStart: false`
- **THEN** the returned `state` SHALL be `'idle'`
- **AND** `text` SHALL be an empty string
- **AND** `data` SHALL be `null`
- **AND** `error` SHALL be `null`

#### Scenario: Auto-start kicks off on mount

- **WHEN** a consumer calls `useAiStream` without overriding `autoStart` (default `true`)
- **THEN** the hook SHALL invoke `fetch` once on mount
- **AND** `state` SHALL transition to `'loading'`

#### Scenario: Successful Promise resolves to done

- **WHEN** the fetcher returns a `Promise<T>` that resolves with value `v`
- **THEN** `state` SHALL transition `'loading' → 'done'`
- **AND** `data` SHALL equal `v`
- **AND** `error` SHALL remain `null`
- **AND** the `onComplete` callback (if provided) SHALL be invoked exactly once with `(v, '')`

#### Scenario: Successful AsyncIterable resolves to done

- **WHEN** the fetcher returns an `AsyncIterable<string>` yielding chunks `['hello', ' ', 'world']`
- **THEN** `state` SHALL transition `'loading' → 'streaming' → 'done'`
- **AND** `text` SHALL equal `'hello world'` once `state` is `'done'`
- **AND** if `parse` was provided, it SHALL be called once with the final accumulated text and `data` SHALL equal its return value
- **AND** the `onComplete` callback (if provided) SHALL be invoked exactly once with `(parsedData, 'hello world')`

#### Scenario: Fetcher throws transitions to error

- **WHEN** the fetcher throws synchronously, returns a rejecting Promise, or its AsyncIterable throws mid-iteration
- **THEN** `state` SHALL transition to `'error'`
- **AND** `error` SHALL be the thrown / rejected value coerced into an `Error` instance
- **AND** the `onError` callback (if provided) SHALL be invoked exactly once with that `Error`

#### Scenario: parse throwing transitions to error

- **WHEN** the AsyncIterable completes successfully but `parse(text)` throws
- **THEN** `state` SHALL transition to `'error'`
- **AND** `error` SHALL be the thrown value
- **AND** `onComplete` SHALL NOT be invoked
- **AND** `onError` (if provided) SHALL be invoked with the thrown value

### Requirement: Hook discriminates fetcher shape at runtime via Symbol.asyncIterator

The system SHALL detect whether the fetcher's awaited return value is an `AsyncIterable<string>` by checking for the `Symbol.asyncIterator` property. The system SHALL NOT require the consumer to declare upfront whether they are streaming or one-shot.

#### Scenario: Promise<AsyncIterable> dispatches to streaming mode

- **WHEN** the fetcher returns `Promise<AsyncIterable<string>>`
- **THEN** the hook SHALL await the Promise, observe `Symbol.asyncIterator` on the resolved value, transition to `'streaming'`, and iterate

#### Scenario: Bare AsyncIterable dispatches to streaming mode

- **WHEN** the fetcher returns an `AsyncIterable<string>` synchronously (not wrapped in a Promise)
- **THEN** the hook SHALL still transition to `'streaming'` and iterate

#### Scenario: Promise<T> where T is not iterable dispatches to one-shot mode

- **WHEN** the fetcher returns `Promise<T>` and the resolved `T` does not implement `Symbol.asyncIterator`
- **THEN** the hook SHALL skip the `'streaming'` state, leave `text` empty, set `data = T`, and transition `'loading' → 'done'`

### Requirement: Hook supports retry, reset, cancel, and explicit start

The system SHALL expose imperative `start`, `retry`, `reset`, and `cancel` methods on the hook's return value.

#### Scenario: retry replays the fetcher

- **WHEN** the hook is in state `'error'` and the consumer calls `retry()`
- **THEN** the hook SHALL abort any in-flight controller, clear `text` / `data` / `error`, create a fresh `AbortController`, transition to `'loading'`, and invoke the fetcher again

#### Scenario: retry after done re-runs the fetcher

- **WHEN** the hook is in state `'done'` and the consumer calls `retry()`
- **THEN** the hook SHALL clear `text` / `data`, transition to `'loading'`, and invoke the fetcher again

#### Scenario: reset returns the hook to idle

- **WHEN** the consumer calls `reset()` from any non-loading / non-streaming state
- **THEN** `state` SHALL become `'idle'`, `text` SHALL be `''`, `data` SHALL be `null`, `error` SHALL be `null`

#### Scenario: cancel during loading aborts and returns to idle

- **WHEN** the consumer calls `cancel()` while `state` is `'loading'` or `'streaming'`
- **THEN** the hook SHALL call `controller.abort()` on the active `AbortController`
- **AND** `state` SHALL transition to `'idle'`
- **AND** `text` / `data` / `error` SHALL be cleared
- **AND** any subsequent token chunks yielded by the in-flight iterable SHALL be ignored (no state updates after abort)

#### Scenario: start is a no-op when not idle

- **WHEN** the consumer calls `start()` while `state` is `'loading'`, `'streaming'`, `'done'`, or `'error'`
- **THEN** the hook SHALL NOT invoke the fetcher a second time

#### Scenario: Fetcher receives an AbortSignal

- **WHEN** the hook invokes the fetcher
- **THEN** the fetcher SHALL be called with a single argument `{ signal: AbortSignal }` from the current `AbortController`

### Requirement: AiStream wrapper component announces state via ARIA live region

The system SHALL export an `<AiStream>` React component that wraps a render-prop / children-as-function over `useAiStream`. The wrapper SHALL render a single root element with `role="status"`, `aria-live="polite"`, and `aria-atomic="false"` around its render-prop output. The consumer SHALL NOT be required to add these ARIA attributes themselves.

#### Scenario: Live region present at all states

- **WHEN** the `<AiStream>` component renders in any state
- **THEN** its root element SHALL carry `role="status"`, `aria-live="polite"`, and `aria-atomic="false"`

#### Scenario: Render-prop receives the hook's return value

- **WHEN** the `<AiStream>` component renders
- **THEN** its `children` (when a function) SHALL be invoked with the full `useAiStream` return shape `{ state, text, data, error, start, retry, reset, cancel }`

### Requirement: Top-of-file JSDoc documents both usage modes

The system SHALL include a top-of-file JSDoc block in `src/components/AiStream.tsx` documenting the hook and component. The JSDoc SHALL include at least two `@example` blocks: one for the Promise / one-shot fetcher mode and one for the AsyncIterable / streaming fetcher mode.

#### Scenario: JSDoc is parseable and contains both example modes

- **WHEN** a reader opens `src/components/AiStream.tsx`
- **THEN** the file SHALL begin with a JSDoc block referencing both the Promise<T> and AsyncIterable<string> fetcher shapes
- **AND** at least one `@example` SHALL show a non-streaming call
- **AND** at least one `@example` SHALL show a streaming call

### Requirement: Hook owns no app-specific state — storage, env, telemetry, or model

The system SHALL NOT have the hook read from `localStorage`, `process.env`, `window`, or any project-specific module (`storage.ts`, `LlmConfig`, etc.). All inputs to the hook SHALL be passed in via options. This is forward-compat with the M5 Auth0/Atlas server-proxy migration documented in `docs/ai-milestone.md`.

#### Scenario: Hook imports only React and its own types

- **WHEN** the static import list of `src/components/AiStream.tsx` is inspected
- **THEN** it SHALL only import from `react` and (optionally) `type`-only from `ai`
- **AND** it SHALL NOT import from `@/lib/storage`, `@/lib/ai`, `posthog-js`, or any path under `@/lib/*`
