import { describe, expect, it } from 'vitest';
import {
  activeElapsedMs,
  computeTimedState,
  workIntervalInfo,
  type TimedComputeParams,
} from './timedSession';
import type { TimedConfig } from './types';

const TABATA: TimedConfig = { mode: 'tabata', workSec: 20, restSec: 10, rounds: 8 };

function at(elapsedMs: number, over: Partial<TimedComputeParams> = {}) {
  return computeTimedState({
    config: TABATA,
    circuitLength: 1,
    startedAtMs: 0,
    totalPausedMs: 0,
    now: elapsedMs,
    ...over,
  });
}

describe('computeTimedState — tabata, single-exercise circuit', () => {
  it('starts in the first work phase', () => {
    const s = at(0);
    expect(s.phase).toBe('work');
    expect(s.roundIndex).toBe(0);
    expect(s.activeExerciseIndex).toBe(0);
    expect(s.phaseRemainingMs).toBe(20_000);
    expect(s.totalRounds).toBe(8);
    expect(s.completedWorkIntervals).toBe(0);
  });

  it('auto-advances work → rest at the work boundary', () => {
    expect(at(19_999).phase).toBe('work');
    const rest = at(20_000);
    expect(rest.phase).toBe('rest');
    expect(rest.phaseRemainingMs).toBe(10_000);
    expect(rest.completedWorkIntervals).toBe(1);
  });

  it('auto-advances rest → next round work at the cell boundary', () => {
    const s = at(30_000);
    expect(s.phase).toBe('work');
    expect(s.roundIndex).toBe(1);
    expect(s.completedWorkIntervals).toBe(1);
  });

  it('last round ends with NO trailing rest, then done', () => {
    // 8 rounds × 30s cell − 10s final rest = 230_000ms total.
    const lastWork = at(229_999);
    expect(lastWork.phase).toBe('work');
    expect(lastWork.roundIndex).toBe(7);
    const done = at(230_000);
    expect(done.phase).toBe('done');
    expect(done.completedWorkIntervals).toBe(8);
    expect(done.activeExerciseIndex).toBe(-1);
  });
});

describe('computeTimedState — tabata circuit distribution', () => {
  const circuit: TimedComputeParams = {
    config: { mode: 'tabata', workSec: 20, restSec: 10, rounds: 2 },
    circuitLength: 2,
    startedAtMs: 0,
    totalPausedMs: 0,
    now: 0,
  };
  const sample = (elapsed: number) => computeTimedState({ ...circuit, now: elapsed });

  it('walks the circuit exercise-by-exercise, one round per full pass', () => {
    expect(sample(0)).toMatchObject({ roundIndex: 0, circuitIndex: 0, activeExerciseIndex: 0 });
    expect(sample(30_000)).toMatchObject({
      roundIndex: 0,
      circuitIndex: 1,
      activeExerciseIndex: 1,
    });
    expect(sample(60_000)).toMatchObject({
      roundIndex: 1,
      circuitIndex: 0,
      activeExerciseIndex: 0,
    });
    expect(sample(90_000)).toMatchObject({
      roundIndex: 1,
      circuitIndex: 1,
      activeExerciseIndex: 1,
    });
    // 4 intervals × 30s − 10s = 110_000ms.
    expect(sample(110_000).phase).toBe('done');
  });

  it('workIntervalInfo maps interval index to round + circuit position', () => {
    expect(workIntervalInfo(0, 2)).toEqual({ roundIndex: 0, circuitIndex: 0 });
    expect(workIntervalInfo(2, 2)).toEqual({ roundIndex: 1, circuitIndex: 0 });
    expect(workIntervalInfo(3, 2)).toEqual({ roundIndex: 1, circuitIndex: 1 });
  });
});

describe('pause / resume and refresh reconstruction', () => {
  it('freezes the clock at pausedAt across a phase boundary', () => {
    // Paused exactly at the work→rest boundary; wall clock keeps moving.
    const frozen = at(999_999, { pausedAtMs: 20_000 });
    expect(frozen.phase).toBe('rest');
    expect(frozen.phaseRemainingMs).toBe(10_000);
  });

  it('subtracts accumulated paused time from elapsed', () => {
    // now=35s but 15s was spent paused → effective elapsed 20s → rest boundary.
    expect(activeElapsedMs({ startedAtMs: 0, totalPausedMs: 15_000, now: 35_000 })).toBe(20_000);
    expect(at(35_000, { totalPausedMs: 15_000 }).phase).toBe('rest');
  });

  it('is pure: identical inputs reconstruct identical state after a refresh', () => {
    const params: TimedComputeParams = {
      config: TABATA,
      circuitLength: 1,
      startedAtMs: 1000,
      totalPausedMs: 0,
      now: 46_000,
    };
    expect(computeTimedState(params)).toEqual(computeTimedState({ ...params }));
  });
});
