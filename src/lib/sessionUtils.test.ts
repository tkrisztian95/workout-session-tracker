import { describe, expect, it } from 'vitest';
import { formatExerciseDetail, formatRepsTarget, parseRepScheme } from './sessionUtils';

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
