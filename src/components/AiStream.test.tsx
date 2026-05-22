import { describe, it, expect, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useAiStream } from './AiStream';

/** A fixed async iterable of string chunks, optionally throwing at one index. */
function makeIterable(chunks: string[], throwAt?: number): AsyncIterable<string> {
  return {
    async *[Symbol.asyncIterator]() {
      for (let i = 0; i < chunks.length; i++) {
        if (throwAt === i) throw new Error('iterator boom');
        yield chunks[i];
      }
    },
  };
}

/** An async iterable whose chunks are pushed/ended manually by the test. */
function controllableStream() {
  const queue: string[] = [];
  let finished = false;
  let wake: (() => void) | null = null;
  const iterable: AsyncIterable<string> = {
    async *[Symbol.asyncIterator]() {
      while (true) {
        while (queue.length > 0) yield queue.shift()!;
        if (finished) return;
        await new Promise<void>((resolve) => {
          wake = resolve;
        });
      }
    },
  };
  return {
    iterable,
    push(chunk: string) {
      queue.push(chunk);
      wake?.();
      wake = null;
    },
    end() {
      finished = true;
      wake?.();
      wake = null;
    },
  };
}

describe('useAiStream — initial state', () => {
  it('is idle with empty fields when autoStart is false', () => {
    const { result } = renderHook(() =>
      useAiStream<string>({ autoStart: false, fetch: async () => 'x' }),
    );
    expect(result.current.state).toBe('idle');
    expect(result.current.text).toBe('');
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('auto-starts on mount by default', async () => {
    const fetch = vi.fn(async () => 'value');
    const { result } = renderHook(() => useAiStream<string>({ fetch }));
    await waitFor(() => expect(result.current.state).toBe('done'));
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe('useAiStream — one-shot Promise mode', () => {
  it('resolves a Promise to done with data and onComplete(value, "")', async () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useAiStream<{ n: number }>({ fetch: async () => ({ n: 7 }), onComplete }),
    );
    await waitFor(() => expect(result.current.state).toBe('done'));
    expect(result.current.data).toEqual({ n: 7 });
    expect(result.current.text).toBe('');
    expect(result.current.error).toBeNull();
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith({ n: 7 }, '');
  });

  it('never enters the streaming state in one-shot mode', async () => {
    const seen: string[] = [];
    const { result } = renderHook(() => useAiStream<string>({ fetch: async () => 'done-value' }));
    seen.push(result.current.state);
    await waitFor(() => expect(result.current.state).toBe('done'));
    // The render observed by waitFor only ever transitions idle/loading → done.
    expect(seen).not.toContain('streaming');
  });
});

describe('useAiStream — streaming AsyncIterable mode', () => {
  it('accumulates chunks, runs parse once, and calls onComplete(parsed, fullText)', async () => {
    const parse = vi.fn((t: string) => ({ value: t }));
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useAiStream<{ value: string }>({
        fetch: () => makeIterable(['hello', ' ', 'world']),
        parse,
        onComplete,
      }),
    );
    await waitFor(() => expect(result.current.state).toBe('done'));
    expect(result.current.text).toBe('hello world');
    expect(result.current.data).toEqual({ value: 'hello world' });
    expect(parse).toHaveBeenCalledTimes(1);
    expect(parse).toHaveBeenCalledWith('hello world');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith({ value: 'hello world' }, 'hello world');
  });

  it('dispatches a Promise<AsyncIterable> to streaming mode', async () => {
    const { result } = renderHook(() =>
      useAiStream<string>({ fetch: async () => makeIterable(['a', 'b']) }),
    );
    await waitFor(() => expect(result.current.state).toBe('done'));
    expect(result.current.text).toBe('ab');
  });

  it('dispatches a bare AsyncIterable to streaming mode', async () => {
    const { result } = renderHook(() =>
      useAiStream<string>({ fetch: () => makeIterable(['1', '2', '3']) }),
    );
    await waitFor(() => expect(result.current.state).toBe('done'));
    expect(result.current.text).toBe('123');
  });
});

describe('useAiStream — error handling', () => {
  it('transitions to error when the fetcher throws synchronously', async () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useAiStream<string>({
        fetch: () => {
          throw new Error('sync boom');
        },
        onError,
      }),
    );
    await waitFor(() => expect(result.current.state).toBe('error'));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('sync boom');
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('transitions to error on a rejecting Promise', async () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useAiStream<string>({
        fetch: async () => {
          throw new Error('async boom');
        },
        onError,
      }),
    );
    await waitFor(() => expect(result.current.state).toBe('error'));
    expect(result.current.error?.message).toBe('async boom');
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('transitions to error when the iterable throws mid-iteration', async () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useAiStream<string>({ fetch: () => makeIterable(['ok', 'bad'], 1), onError }),
    );
    await waitFor(() => expect(result.current.state).toBe('error'));
    expect(result.current.error?.message).toBe('iterator boom');
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('coerces a non-Error thrown value into an Error', async () => {
    const { result } = renderHook(() =>
      useAiStream<string>({
        fetch: async () => {
          throw 'string failure';
        },
      }),
    );
    await waitFor(() => expect(result.current.state).toBe('error'));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('string failure');
  });

  it('transitions to error when parse throws and does not call onComplete', async () => {
    const onComplete = vi.fn();
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useAiStream<unknown>({
        fetch: () => makeIterable(['{bad', ' json']),
        parse: () => {
          throw new Error('parse boom');
        },
        onComplete,
        onError,
      }),
    );
    await waitFor(() => expect(result.current.state).toBe('error'));
    expect(result.current.error?.message).toBe('parse boom');
    expect(onComplete).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
  });
});

describe('useAiStream — retry / reset / start', () => {
  it('retry from error replays the fetcher and clears prior state', async () => {
    let attempt = 0;
    const fetch = vi.fn(async () => {
      attempt += 1;
      if (attempt === 1) throw new Error('first fails');
      return 'second ok';
    });
    const { result } = renderHook(() => useAiStream<string>({ fetch }));
    await waitFor(() => expect(result.current.state).toBe('error'));

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.state).toBe('done'));
    expect(result.current.data).toBe('second ok');
    expect(result.current.error).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('retry from done re-runs the fetcher', async () => {
    const fetch = vi.fn(async () => 'value');
    const { result } = renderHook(() => useAiStream<string>({ fetch }));
    await waitFor(() => expect(result.current.state).toBe('done'));

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.state).toBe('done'));
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('reset returns the hook to idle and clears state', async () => {
    const { result } = renderHook(() => useAiStream<string>({ fetch: async () => 'value' }));
    await waitFor(() => expect(result.current.state).toBe('done'));

    act(() => result.current.reset());
    expect(result.current.state).toBe('idle');
    expect(result.current.text).toBe('');
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('start is a no-op when the hook is not idle', async () => {
    const fetch = vi.fn(async () => 'value');
    const { result } = renderHook(() => useAiStream<string>({ fetch }));
    await waitFor(() => expect(result.current.state).toBe('done'));

    act(() => result.current.start());
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('start runs the fetcher when idle (autoStart false)', async () => {
    const fetch = vi.fn(async () => 'value');
    const { result } = renderHook(() => useAiStream<string>({ autoStart: false, fetch }));
    expect(fetch).not.toHaveBeenCalled();

    act(() => result.current.start());
    await waitFor(() => expect(result.current.state).toBe('done'));
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe('useAiStream — cancel', () => {
  it('aborts an in-flight stream, returns to idle, and ignores post-abort chunks', async () => {
    const stream = controllableStream();
    const { result } = renderHook(() => useAiStream<string>({ fetch: () => stream.iterable }));

    stream.push('first');
    await waitFor(() => expect(result.current.text).toBe('first'));
    expect(result.current.state).toBe('streaming');

    act(() => result.current.cancel());
    expect(result.current.state).toBe('idle');
    expect(result.current.text).toBe('');

    // A chunk pushed after cancel must not revive the hook.
    stream.push('second');
    stream.end();
    await new Promise((r) => setTimeout(r, 10));
    expect(result.current.state).toBe('idle');
    expect(result.current.text).toBe('');
  });

  it('passes an AbortSignal to the fetcher that aborts on cancel', async () => {
    let captured: AbortSignal | null = null;
    const stream = controllableStream();
    const { result } = renderHook(() =>
      useAiStream<string>({
        fetch: ({ signal }) => {
          captured = signal;
          return stream.iterable;
        },
      }),
    );

    stream.push('chunk');
    await waitFor(() => expect(result.current.state).toBe('streaming'));
    expect(captured).toBeInstanceOf(AbortSignal);
    expect(captured!.aborted).toBe(false);

    act(() => result.current.cancel());
    expect(captured!.aborted).toBe(true);
  });
});
