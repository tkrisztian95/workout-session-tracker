/**
 * AiStream — the shared client-side state machine for any AI inference call.
 *
 * Every AI modal in the app reimplements the same idle → loading → streaming →
 * done → error → retry lifecycle. `useAiStream` owns that lifecycle once; the
 * `<AiStream>` wrapper adds an accessible `role="status"` / `aria-live="polite"`
 * region so assistive tech announces the in-flight state.
 *
 * The hook is deliberately app-agnostic: it reads no `localStorage`, no env, no
 * model config. The caller injects an inference call as `fetch`. This keeps the
 * future server-proxy swap (Auth0 + Atlas, milestone M5) a one-line change at
 * the call site rather than a rewrite here.
 *
 * `fetch` may return either shape the Vercel AI SDK exposes, discriminated at
 * runtime via `Symbol.asyncIterator` — no upfront mode flag:
 *
 *   - `Promise<T>`                   — one-shot call (`generateText` / `generateObject`).
 *   - `Promise<AsyncIterable<string>>` / `AsyncIterable<string>` — streaming
 *     token deltas (`streamText().textStream`). The hook accumulates the deltas
 *     into `text` and, if a `parse` callback is given, reduces the final text to `T`.
 *
 * Edge case: a one-shot `T` that itself implements `Symbol.asyncIterator` would
 * be misdispatched to streaming mode. No current or planned consumer returns
 * such a type; callers that might should wrap the value.
 *
 * @example One-shot fetcher (Promise)
 * ```tsx
 * const { state, data, error, retry } = useAiStream<Plan>({
 *   autoStart: false,
 *   fetch: ({ signal }) => suggestPlan(config, ctx, prefs, { signal }),
 *   onComplete: (plan) => track('plan_generated', { days: plan.days.length }),
 *   onError: (err) => track('plan_failed', { message: err.message }),
 * });
 * // state: 'idle' → 'loading' → 'done' (data === plan) | 'error'
 * ```
 *
 * @example Streaming fetcher (AsyncIterable)
 * ```tsx
 * <AiStream<Debrief>
 *   fetch={({ signal }) => streamText({ model, prompt, abortSignal: signal }).textStream}
 *   parse={(text) => JSON.parse(text) as Debrief}
 *   onComplete={(debrief) => persist(debrief)}
 * >
 *   {({ state, text, data, error, retry }) =>
 *     state === 'error' ? <ErrorRow error={error} onRetry={retry} />
 *     : state === 'done' ? <DebriefCard debrief={data!} />
 *     : <StreamingText value={text} />
 *   }
 * </AiStream>
 * ```
 */

'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

export type AiStreamState = 'idle' | 'loading' | 'streaming' | 'done' | 'error';

/**
 * Produces the AI call. Receives an `AbortSignal` so the call can be cancelled.
 * Return a `Promise<T>` for one-shot calls or an `AsyncIterable<string>` (bare
 * or Promise-wrapped) of text deltas for streaming calls.
 */
export type AiStreamFetcher<T> = (args: {
  signal: AbortSignal;
}) => Promise<T> | Promise<AsyncIterable<string>> | AsyncIterable<string>;

export interface UseAiStreamOptions<T> {
  /** The AI call. See {@link AiStreamFetcher}. */
  fetch: AiStreamFetcher<T>;
  /**
   * Streaming mode only: reduces the final accumulated text to `T`. Throwing
   * here transitions the hook to `'error'`. Ignored in one-shot mode (the
   * fetcher already returned `T`).
   */
  parse?: (text: string) => T;
  /** Fired once on a clean transition to `'done'`. */
  onComplete?: (data: T, text: string) => void;
  /** Fired once on a transition to `'error'`. */
  onError?: (error: Error) => void;
  /** Run `fetch` on mount. Defaults to `true`. */
  autoStart?: boolean;
}

export interface UseAiStreamReturn<T> {
  state: AiStreamState;
  /** Accumulated token text. Empty in one-shot mode. */
  text: string;
  /** The resolved/parsed result, or `null` until `'done'`. */
  data: T | null;
  /** The failure, or `null` unless `state === 'error'`. */
  error: Error | null;
  /** Run the fetcher. No-op unless `state === 'idle'`. */
  start: () => void;
  /** Abort any in-flight run, clear state, and run the fetcher again. */
  retry: () => void;
  /** Return to `'idle'` and clear `text` / `data` / `error`. */
  reset: () => void;
  /** Abort an in-flight run, return to `'idle'`, and clear state. */
  cancel: () => void;
}

function isAsyncIterable(value: unknown): value is AsyncIterable<string> {
  return (
    value != null && typeof (value as Record<symbol, unknown>)[Symbol.asyncIterator] === 'function'
  );
}

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}

/**
 * The AI-call state machine. See the module JSDoc for usage.
 */
export function useAiStream<T>(options: UseAiStreamOptions<T>): UseAiStreamReturn<T> {
  const [state, setState] = useState<AiStreamState>('idle');
  const [text, setText] = useState('');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Latest-value refs so an unmemoized options object never causes a stale call.
  // Synced after commit; the initial values come from useRef so the autoStart
  // effect (declared later, so it runs after this one) sees them on mount.
  const fetchRef = useRef(options.fetch);
  const parseRef = useRef(options.parse);
  const onCompleteRef = useRef(options.onComplete);
  const onErrorRef = useRef(options.onError);
  const stateRef = useRef(state);
  useEffect(() => {
    fetchRef.current = options.fetch;
    parseRef.current = options.parse;
    onCompleteRef.current = options.onComplete;
    onErrorRef.current = options.onError;
    stateRef.current = state;
  });

  const abortRef = useRef<AbortController | null>(null);
  // Bumped on every start/cancel/reset so a superseded async run cannot write state.
  const runTokenRef = useRef(0);

  const run = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const token = ++runTokenRef.current;
    const isCurrent = () => token === runTokenRef.current && !controller.signal.aborted;

    setState('loading');
    setText('');
    setData(null);
    setError(null);

    void (async () => {
      try {
        const result = await fetchRef.current({ signal: controller.signal });
        if (!isCurrent()) return;

        if (isAsyncIterable(result)) {
          setState('streaming');
          let accumulated = '';
          for await (const chunk of result) {
            if (!isCurrent()) return;
            accumulated += chunk;
            setText(accumulated);
          }
          if (!isCurrent()) return;
          const parsed = parseRef.current
            ? parseRef.current(accumulated)
            : (accumulated as unknown as T);
          if (!isCurrent()) return;
          setData(parsed);
          setState('done');
          onCompleteRef.current?.(parsed, accumulated);
        } else {
          const value = result as T;
          setData(value);
          setState('done');
          onCompleteRef.current?.(value, '');
        }
      } catch (err) {
        if (!isCurrent()) return;
        const e = toError(err);
        setError(e);
        setState('error');
        onErrorRef.current?.(e);
      }
    })();
  }, []);

  const start = useCallback(() => {
    if (stateRef.current !== 'idle') return;
    run();
  }, [run]);

  const retry = useCallback(() => {
    run();
  }, [run]);

  const clear = useCallback(() => {
    runTokenRef.current++;
    setState('idle');
    setText('');
    setData(null);
    setError(null);
  }, []);

  const reset = useCallback(() => {
    clear();
  }, [clear]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    clear();
  }, [clear]);

  const autoStart = options.autoStart ?? true;
  const didAutoStart = useRef(false);
  useEffect(() => {
    if (autoStart && !didAutoStart.current) {
      didAutoStart.current = true;
      run();
    }
    return () => {
      abortRef.current?.abort();
    };
  }, [autoStart, run]);

  return { state, text, data, error, start, retry, reset, cancel };
}

export interface AiStreamProps<T> extends UseAiStreamOptions<T> {
  /** Render-prop invoked with the full {@link useAiStream} return value. */
  children: (api: UseAiStreamReturn<T>) => ReactNode;
  className?: string;
}

/**
 * Thin wrapper over {@link useAiStream} that renders an accessible live region.
 * The `role="status"` / `aria-live="polite"` announcement cannot be opted out
 * of — only its contents (the render-prop output) are consumer-controlled.
 */
export function AiStream<T>({ children, className, ...options }: AiStreamProps<T>): ReactNode {
  const api = useAiStream<T>(options);
  return (
    <div role="status" aria-live="polite" aria-atomic="false" className={className}>
      {children(api)}
    </div>
  );
}
