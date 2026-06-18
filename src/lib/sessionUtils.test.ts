import { describe, expect, it } from 'vitest';
import {
  buildSessionTimeline,
  classifyLoggedSets,
  classifyPlannedExercise,
  countsTowardSetsGoal,
  formatExerciseDetail,
  formatMonthBucket,
  formatRepsTarget,
  getSessionBucket,
  parseRepScheme,
} from './sessionUtils';
import type { Exercise, LoggedSet, PlanExercise, WorkoutSession } from './types';

describe('formatRepsTarget', () => {
  it('returns the uniform rep count as a string', () => {
    expect(formatRepsTarget({ reps: 10 })).toBe('10');
  });

  it('joins a per-set scheme with slashes', () => {
    expect(formatRepsTarget({ repsPerSet: [15, 12, 8, 4] })).toBe('15/12/8/4');
  });

  it('prefers repsPerSet when both are present', () => {
    expect(formatRepsTarget({ reps: 10, repsPerSet: [15, 12] })).toBe('15/12');
  });

  it('falls back to "0" when neither is provided', () => {
    expect(formatRepsTarget({})).toBe('0');
  });

  it('treats an empty repsPerSet as absent', () => {
    expect(formatRepsTarget({ reps: 8, repsPerSet: [] })).toBe('8');
  });
});

describe('parseRepScheme', () => {
  it('parses comma-separated input', () => {
    expect(parseRepScheme('15, 12, 8, 4')).toEqual([15, 12, 8, 4]);
  });

  it('parses slash-separated input', () => {
    expect(parseRepScheme('15/12/8/4')).toEqual([15, 12, 8, 4]);
  });

  it('parses space-separated input', () => {
    expect(parseRepScheme('15 12 8 4')).toEqual([15, 12, 8, 4]);
  });

  it('drops zero, negative, and non-numeric tokens', () => {
    expect(parseRepScheme('15, 0, -3, foo, 8')).toEqual([15, 8]);
  });

  it('returns an empty array for empty input', () => {
    expect(parseRepScheme('   ')).toEqual([]);
  });
});

describe('formatExerciseDetail', () => {
  it('renders uniform sets-reps as sets×reps', () => {
    expect(formatExerciseDetail({ type: 'sets-reps', sets: 4, reps: 10 })).toBe('4×10');
  });

  it('renders a per-set scheme without the redundant sets×', () => {
    expect(formatExerciseDetail({ type: 'sets-reps', sets: 4, repsPerSet: [15, 12, 8, 4] })).toBe(
      '15/12/8/4',
    );
  });

  it('appends weight when present', () => {
    expect(
      formatExerciseDetail({
        type: 'sets-reps',
        sets: 4,
        repsPerSet: [15, 12, 8, 4],
        weightKg: 60,
      }),
    ).toBe('15/12/8/4 · 60 kg');
  });
});

describe('buildSessionTimeline', () => {
  const baseExercise = (overrides: Partial<Exercise>): Exercise => ({
    id: overrides.id ?? 'ex',
    name: overrides.name ?? 'Exercise',
    type: 'sets-reps',
    sets: 3,
    reps: 10,
    ...overrides,
  });

  const session = (exercises: Exercise[]): WorkoutSession => ({
    id: 's1',
    startedAt: '2025-01-01T09:00:00.000Z',
    completedAt: '2025-01-01T10:00:00.000Z',
    exercises,
  });

  it('derives duration from previous exercise end when only completedAt is present', () => {
    const result = buildSessionTimeline(
      session([
        baseExercise({ id: 'a', completed: true, completedAt: '2025-01-01T09:05:00.000Z' }),
        baseExercise({ id: 'b', completed: true, completedAt: '2025-01-01T09:12:00.000Z' }),
      ]),
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ exerciseId: 'a', durationSec: 300 });
    expect(result[0].startedAt).toBe('2025-01-01T09:00:00.000Z');
    expect(result[1]).toMatchObject({ exerciseId: 'b', durationSec: 420 });
    expect(result[1].startedAt).toBe('2025-01-01T09:05:00.000Z');
  });

  it('uses the first logged set as the exercise start when available', () => {
    const result = buildSessionTimeline(
      session([
        baseExercise({
          id: 'a',
          completed: true,
          completedAt: '2025-01-01T09:15:00.000Z',
          loggedSets: [
            { weight: 0, reps: 5, loggedAt: '2025-01-01T09:10:00.000Z' },
            { weight: 0, reps: 5, loggedAt: '2025-01-01T09:14:00.000Z' },
          ],
        }),
      ]),
    );
    expect(result[0].startedAt).toBe('2025-01-01T09:10:00.000Z');
    expect(result[0].durationSec).toBe(300);
  });

  it('omits dismissed exercises and exercises with no timing data', () => {
    const result = buildSessionTimeline(
      session([
        baseExercise({ id: 'a', dismissed: true, completedAt: '2025-01-01T09:05:00.000Z' }),
        baseExercise({ id: 'b' }),
        baseExercise({ id: 'c', completed: true, completedAt: '2025-01-01T09:20:00.000Z' }),
      ]),
    );
    expect(result.map((e) => e.exerciseId)).toEqual(['c']);
  });

  it('sorts entries by completion time when stored out of order', () => {
    const result = buildSessionTimeline(
      session([
        baseExercise({ id: 'second', completed: true, completedAt: '2025-01-01T09:20:00.000Z' }),
        baseExercise({ id: 'first', completed: true, completedAt: '2025-01-01T09:10:00.000Z' }),
      ]),
    );
    expect(result.map((e) => e.exerciseId)).toEqual(['first', 'second']);
  });

  it('clamps overlapping starts to the previous exercise end', () => {
    const result = buildSessionTimeline(
      session([
        baseExercise({ id: 'a', completed: true, completedAt: '2025-01-01T09:10:00.000Z' }),
        baseExercise({
          id: 'b',
          completed: true,
          completedAt: '2025-01-01T09:20:00.000Z',
          loggedSets: [{ weight: 0, reps: 5, loggedAt: '2025-01-01T09:05:00.000Z' }],
        }),
      ]),
    );
    expect(result[1].startedAt).toBe('2025-01-01T09:10:00.000Z');
    expect(result[1].durationSec).toBe(600);
  });

  it('returns an empty array when no exercises have timing data', () => {
    expect(buildSessionTimeline(session([baseExercise({ id: 'a' })]))).toEqual([]);
  });
});

describe('getSessionBucket', () => {
  // Thursday 2026-05-28; week starts Monday 2026-05-25.
  const now = new Date(2026, 4, 28, 10, 0, 0);
  const at = (y: number, m: number, d: number) => new Date(y, m - 1, d, 9, 0, 0).toISOString();

  it('buckets dates in the current week as "this week"', () => {
    expect(getSessionBucket(at(2026, 5, 25), now).relativeKey).toBe('this_week');
    expect(getSessionBucket(at(2026, 5, 28), now).relativeKey).toBe('this_week');
  });

  it('treats future dates as "this week"', () => {
    expect(getSessionBucket(at(2026, 6, 10), now).relativeKey).toBe('this_week');
  });

  it('buckets the prior week as "last week"', () => {
    expect(getSessionBucket(at(2026, 5, 18), now).relativeKey).toBe('last_week');
    expect(getSessionBucket(at(2026, 5, 24), now).relativeKey).toBe('last_week');
  });

  it('buckets two weeks back as "two weeks ago"', () => {
    expect(getSessionBucket(at(2026, 5, 11), now).relativeKey).toBe('two_weeks_ago');
    expect(getSessionBucket(at(2026, 5, 17), now).relativeKey).toBe('two_weeks_ago');
  });

  it('collapses older same-month dates into "earlier this month"', () => {
    expect(getSessionBucket(at(2026, 5, 10), now).relativeKey).toBe('earlier_this_month');
    expect(getSessionBucket(at(2026, 5, 1), now).relativeKey).toBe('earlier_this_month');
  });

  it('buckets prior months by calendar month with a stable id', () => {
    const april = getSessionBucket(at(2026, 4, 15), now);
    expect(april.relativeKey).toBeNull();
    expect(april.monthDate).toBe('2026-04-01');
    expect(april.id).toBe('month-2026-04-01');
  });

  it('keeps the same month across years in distinct buckets', () => {
    const may2025 = getSessionBucket(at(2025, 5, 15), now);
    expect(may2025.monthDate).toBe('2025-05-01');
    expect(may2025.id).toBe('month-2025-05-01');
  });
});

describe('formatMonthBucket', () => {
  const now = new Date(2026, 4, 28);

  it('shows only the month name within the current year', () => {
    expect(formatMonthBucket('2026-03-01', 'en-US', now)).toBe('March');
  });

  it('appends the year for other years', () => {
    expect(formatMonthBucket('2025-12-01', 'en-US', now)).toBe('December 2025');
  });
});

describe('classifyLoggedSets', () => {
  const set = (weight: number, reps: number): LoggedSet => ({
    weight,
    reps,
    loggedAt: '2026-06-07T10:00:00.000Z',
  });
  const statuses = (ex: Parameters<typeof classifyLoggedSets>[0]) =>
    classifyLoggedSets(ex).map((c) => c.status);

  it('marks every set neutral when the exercise has no weight target', () => {
    expect(statuses({ reps: 8, loggedSets: [set(40, 5), set(60, 8)] })).toEqual([
      'neutral',
      'neutral',
    ]);
  });

  it('marks sets below the target weight as warmups', () => {
    expect(statuses({ weightKg: 60, reps: 8, loggedSets: [set(30, 8), set(50, 8)] })).toEqual([
      'warmup',
      'warmup',
    ]);
  });

  it('counts a set as working only when weight and reps targets are met', () => {
    expect(statuses({ weightKg: 60, reps: 8, loggedSets: [set(60, 8), set(70, 10)] })).toEqual([
      'working',
      'working',
    ]);
  });

  it('marks a set at target weight but short on reps as partial, exposing the rep target', () => {
    expect(classifyLoggedSets({ weightKg: 60, reps: 8, loggedSets: [set(60, 5)] })).toEqual([
      { status: 'partial', repTarget: 8 },
    ]);
  });

  it('treats a missing rep target as no rep gate (working on weight alone)', () => {
    expect(statuses({ weightKg: 60, loggedSets: [set(60, 1)] })).toEqual(['working']);
  });

  it('matches a per-set rep scheme to weight-qualifying sets in order, skipping warmups', () => {
    // Warmup (30) skipped; the three weight-qualifying sets map to 15/12/8.
    expect(
      classifyLoggedSets({
        weightKg: 60,
        repsPerSet: [15, 12, 8],
        loggedSets: [set(30, 20), set(60, 15), set(60, 10), set(60, 8)],
      }),
    ).toEqual([
      { status: 'warmup' },
      { status: 'working', repTarget: 15 },
      { status: 'partial', repTarget: 12 },
      { status: 'working', repTarget: 8 },
    ]);
  });

  it('returns an empty array when there are no logged sets', () => {
    expect(classifyLoggedSets({ weightKg: 60, reps: 8 })).toEqual([]);
  });
});

describe('countsTowardSetsGoal', () => {
  const set = (weight: number, reps: number): LoggedSet => ({
    weight,
    reps,
    loggedAt: '2026-06-07T10:00:00.000Z',
  });

  it('counts working sets (weight + reps met)', () => {
    expect(countsTowardSetsGoal('working')).toBe(true);
  });

  it('counts partial sets — weight met even though reps fell short', () => {
    expect(countsTowardSetsGoal('partial')).toBe(true);
  });

  it('counts neutral sets (no weight target)', () => {
    expect(countsTowardSetsGoal('neutral')).toBe(true);
  });

  it('excludes warmup sets below the target weight', () => {
    expect(countsTowardSetsGoal('warmup')).toBe(false);
  });

  it('credits a weight-met, rep-short set toward the goal', () => {
    // 60 kg target met on all three sets; the middle set is rep-short (partial)
    // but still counts, so all three qualify.
    const qualifying = classifyLoggedSets({
      weightKg: 60,
      reps: 8,
      loggedSets: [set(60, 8), set(60, 5), set(70, 10)],
    }).filter((c) => countsTowardSetsGoal(c.status)).length;
    expect(qualifying).toBe(3);
  });
});

describe('classifyPlannedExercise', () => {
  const set = (weight: number, reps: number): LoggedSet => ({
    weight,
    reps,
    loggedAt: '2026-06-07T10:00:00.000Z',
  });

  const planned = (over: Partial<PlanExercise> = {}): PlanExercise => ({
    id: 'p1',
    name: 'Bench Press',
    type: 'sets-reps',
    sets: 3,
    reps: 8,
    role: 'core',
    ...over,
  });

  const actual = (over: Partial<Exercise> = {}): Exercise => ({
    id: 'a1',
    name: 'Bench Press',
    type: 'sets-reps',
    ...over,
  });

  it('is missed when there is no matching performed exercise', () => {
    expect(classifyPlannedExercise(planned(), undefined)).toBe('missed');
  });

  it('is missed when the performed exercise logged no qualifying sets', () => {
    expect(classifyPlannedExercise(planned(), actual({ loggedSets: [] }))).toBe('missed');
  });

  it('is matched when qualifying sets equal the prescribed count', () => {
    expect(
      classifyPlannedExercise(
        planned({ sets: 3, weightKg: 60 }),
        actual({ weightKg: 60, loggedSets: [set(60, 8), set(60, 8), set(60, 8)] }),
      ),
    ).toBe('matched');
  });

  it('is overdone when more qualifying sets than prescribed are logged', () => {
    expect(
      classifyPlannedExercise(
        planned({ sets: 2 }),
        actual({ loggedSets: [set(60, 8), set(60, 8), set(60, 8)] }),
      ),
    ).toBe('overdone');
  });

  it('is underperformed when fewer qualifying sets than prescribed are logged', () => {
    expect(
      classifyPlannedExercise(
        planned({ sets: 3 }),
        actual({ loggedSets: [set(60, 8), set(60, 8)] }),
      ),
    ).toBe('underperformed');
  });

  it('excludes sub-target warmup sets so they cannot reach matched', () => {
    // Weight target 60: two warmups (40, 50) do not count; only one working set
    // qualifies, short of the 3 prescribed → underperformed.
    expect(
      classifyPlannedExercise(
        planned({ sets: 3, weightKg: 60 }),
        actual({ weightKg: 60, loggedSets: [set(40, 8), set(50, 8), set(60, 8)] }),
      ),
    ).toBe('underperformed');
  });

  it('reports a completed pure-duration exercise (no sets) as missed — matching the per-session comparison', () => {
    // A pure-duration exercise carries no `sets` and logs no sets, so it has no
    // qualifying-set signal → `missed`. The stats adherence aggregate applies
    // its own "completed counts as met" override on top of this; the raw
    // classification deliberately mirrors what SessionPlanComparison shows.
    expect(
      classifyPlannedExercise(
        planned({ type: 'duration', sets: undefined, reps: undefined, duration: 60 }),
        actual({ type: 'duration', completed: true, duration: 60 }),
      ),
    ).toBe('missed');
  });
});
