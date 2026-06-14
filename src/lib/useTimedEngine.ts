'use client';

import { useEffect, useState } from 'react';
import type { ActiveSession } from './types';
import { computeTimedState, type TimedState } from './timedSession';

/**
 * Drives a timed session's live state. The clock (`now`) lives in state and is
 * advanced by an interval — never read during render — so the component stays
 * pure. The actual phase is re-derived from the session's timestamps on every
 * render via `computeTimedState`, so a missed tick or a refresh never desyncs.
 * Ticking stops while paused. Returns `null` for a non-timed session.
 */
export function useTimedEngine(session: ActiveSession): TimedState | null {
  const config = session.timed;
  const paused = !!session.pausedAt;
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!config) return;
    // Seed the clock on the next tick (a callback, not the effect body) and,
    // while running, advance it every 250ms. setState only ever fires from a
    // timer callback, keeping render pure and avoiding cascading renders.
    const seed = setTimeout(() => setNow(Date.now()), 0);
    if (paused) return () => clearTimeout(seed);
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => {
      clearTimeout(seed);
      clearInterval(id);
    };
  }, [config, paused, session.startedAt, session.totalPausedMs]);

  if (!config) return null;

  return computeTimedState({
    config,
    circuitLength: session.exercises.length,
    startedAtMs: new Date(session.startedAt).getTime(),
    totalPausedMs: session.totalPausedMs,
    now,
    pausedAtMs: session.pausedAt ? new Date(session.pausedAt).getTime() : undefined,
  });
}
