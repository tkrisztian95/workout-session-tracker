// Pure, mode-aware interval engine for timed auto-flow sessions.
//
// Everything here is a pure function of (config, circuit length, startedAt,
// totalPausedMs, now). There is no internal mutable clock: state is derived
// from timestamps on every call, so a dropped render tick or a page refresh
// never desyncs the schedule — re-deriving from the same inputs yields the
// same state. The React layer ticks only to trigger re-renders.
//
// The session's ordered exercises array IS the circuit: one round is one full
// pass through it. For Tabata, each work phase is the next circuit exercise.
//
// Only Tabata is implemented in this slice; AMRAP / EMOM / For-Time share the
// same TimedConfig and slot in here later.

import type { TimedConfig } from './types';

export type TimedPhase = 'work' | 'rest' | 'done';

export interface TimedState {
  phase: TimedPhase;
  /** 0-based index of the current round (pass through the circuit). */
  roundIndex: number;
  /** Total number of rounds in the session. */
  totalRounds: number;
  /** 0-based position within the circuit for the active work/rest cell. */
  circuitIndex: number;
  /** Number of exercises in the circuit (>= 1). */
  circuitLength: number;
  /** Index into the exercises array for the active cell; -1 when done. */
  activeExerciseIndex: number;
  /** Milliseconds remaining in the current phase (0 when done). */
  phaseRemainingMs: number;
  /** Total milliseconds of the current phase (0 when done). */
  phaseTotalMs: number;
  /** Count of work intervals fully completed by `now` — drives auto-logging. */
  completedWorkIntervals: number;
  /** Total work intervals across all rounds (rounds × circuit length). */
  totalWorkIntervals: number;
}

export interface TimedComputeParams {
  config: TimedConfig;
  /** exercises.length; treated as 1 when empty so a single-exercise circuit is the trivial case. */
  circuitLength: number;
  startedAtMs: number;
  totalPausedMs: number;
  now: number;
  /** When set (session paused), the clock is frozen at this instant. */
  pausedAtMs?: number;
}

/** Maps a 0-based work-interval index to its round and circuit position. */
export function workIntervalInfo(
  intervalIndex: number,
  circuitLength: number,
): { roundIndex: number; circuitIndex: number } {
  const n = Math.max(1, circuitLength);
  return { roundIndex: Math.floor(intervalIndex / n), circuitIndex: intervalIndex % n };
}

/** Active (non-paused) elapsed ms since the session started, never negative. */
export function activeElapsedMs(params: {
  startedAtMs: number;
  totalPausedMs: number;
  now: number;
  pausedAtMs?: number;
}): number {
  const ref = params.pausedAtMs ?? params.now;
  return Math.max(0, ref - params.startedAtMs - params.totalPausedMs);
}

function computeTabata(config: TimedConfig, circuitLength: number, elapsed: number): TimedState {
  const n = Math.max(1, circuitLength);
  const totalRounds = Math.max(1, Math.floor(config.rounds ?? 1));
  const work = Math.max(0, config.workSec ?? 0) * 1000;
  const rest = Math.max(0, config.restSec ?? 0) * 1000;
  const totalWorkIntervals = totalRounds * n;
  const cell = work + rest;
  // No trailing rest after the final work interval.
  const totalDuration = totalWorkIntervals * cell - rest;

  const doneState: TimedState = {
    phase: 'done',
    roundIndex: totalRounds - 1,
    totalRounds,
    circuitIndex: n - 1,
    circuitLength: n,
    activeExerciseIndex: -1,
    phaseRemainingMs: 0,
    phaseTotalMs: 0,
    completedWorkIntervals: totalWorkIntervals,
    totalWorkIntervals,
  };

  // Degenerate config (no work time) — nothing to run.
  if (cell <= 0 || work <= 0) return doneState;
  if (elapsed >= totalDuration) return doneState;

  const completedWorkIntervals = elapsed >= work ? Math.floor((elapsed - work) / cell) + 1 : 0;

  const cellIdx = Math.floor(elapsed / cell);
  const withinCell = elapsed - cellIdx * cell;
  const { roundIndex, circuitIndex } = workIntervalInfo(cellIdx, n);

  if (withinCell < work) {
    return {
      phase: 'work',
      roundIndex,
      totalRounds,
      circuitIndex,
      circuitLength: n,
      activeExerciseIndex: circuitIndex,
      phaseRemainingMs: work - withinCell,
      phaseTotalMs: work,
      completedWorkIntervals,
      totalWorkIntervals,
    };
  }

  // Rest phase belongs to the work interval that just finished.
  return {
    phase: 'rest',
    roundIndex,
    totalRounds,
    circuitIndex,
    circuitLength: n,
    activeExerciseIndex: circuitIndex,
    phaseRemainingMs: cell - withinCell,
    phaseTotalMs: rest,
    completedWorkIntervals,
    totalWorkIntervals,
  };
}

/** Derive the full engine state for a timed session at instant `now`. */
export function computeTimedState(params: TimedComputeParams): TimedState {
  const elapsed = activeElapsedMs(params);
  switch (params.config.mode) {
    case 'tabata':
      return computeTabata(params.config, params.circuitLength, elapsed);
    default:
      // AMRAP / EMOM / For-Time not yet wired; only reachable if a session is
      // persisted with one of those modes, which the UI does not yet create.
      throw new Error(`timed mode not implemented: ${params.config.mode}`);
  }
}
