import { describe, expect, it } from 'vitest';
import en from '@/locales/en.json';
import hu from '@/locales/hu.json';
import {
  SKIP_NOTE_MAX,
  SKIP_REASONS,
  applySkip,
  clearSkip,
  hasPainStreak,
  normalizeSkipNote,
  skipReasonLabel,
} from './skipReasons';
import type { Exercise, SkipReason, WorkoutSession } from './types';

function exercise(overrides: Partial<Exercise> = {}): Exercise {
  return { id: 'e1', name: 'Bench Press', type: 'sets-reps', sets: 3, reps: 8, ...overrides };
}

function session(completedAt: string, exercises: Exercise[]): WorkoutSession {
  return { id: completedAt, startedAt: completedAt, completedAt, exercises };
}

function skipped(name: string, reason?: SkipReason): Exercise {
  return exercise({ name, dismissed: true, ...(reason ? { skipReason: reason } : {}) });
}

describe('skipReasonLabel', () => {
  it('has a label for every reason in every locale', () => {
    for (const reason of SKIP_REASONS) {
      expect(skipReasonLabel(reason, en)).toBeTruthy();
      expect(skipReasonLabel(reason, hu)).toBeTruthy();
    }
  });

  it('returns the English label', () => {
    expect(skipReasonLabel('pain', en)).toBe(en.skip_reason_pain);
  });
});

describe('normalizeSkipNote', () => {
  it('trims whitespace', () => {
    expect(normalizeSkipNote('  left shoulder  ')).toBe('left shoulder');
  });

  it('returns undefined for empty or whitespace-only notes', () => {
    expect(normalizeSkipNote('')).toBeUndefined();
    expect(normalizeSkipNote('   ')).toBeUndefined();
    expect(normalizeSkipNote(undefined)).toBeUndefined();
  });

  it('caps the note at the maximum length', () => {
    expect(normalizeSkipNote('x'.repeat(SKIP_NOTE_MAX + 50))).toHaveLength(SKIP_NOTE_MAX);
  });
});

describe('applySkip / clearSkip', () => {
  it('stores reason and normalized note', () => {
    const next = applySkip(exercise(), { reason: 'pain', note: ' left shoulder ' });
    expect(next).toMatchObject({ dismissed: true, skipReason: 'pain', skipNote: 'left shoulder' });
  });

  it('omits absent details instead of writing undefined keys', () => {
    const next = applySkip(exercise());
    expect(next.dismissed).toBe(true);
    expect('skipReason' in next).toBe(false);
    expect('skipNote' in next).toBe(false);
  });

  it('replaces earlier details on a re-skip', () => {
    const first = applySkip(exercise(), { reason: 'pain', note: 'knee' });
    const second = applySkip(first, { reason: 'time' });
    expect(second.skipReason).toBe('time');
    expect('skipNote' in second).toBe(false);
  });

  it('clearSkip removes the reason and note keys', () => {
    const next = clearSkip(applySkip(exercise(), { reason: 'fatigue', note: 'slept badly' }));
    expect(next.dismissed).toBe(false);
    expect('skipReason' in next).toBe(false);
    expect('skipNote' in next).toBe(false);
  });
});

describe('hasPainStreak', () => {
  it('is true when the last two appearances were pain skips', () => {
    const sessions = [
      session('2026-09-01T10:00:00Z', [skipped('Bench Press', 'pain')]),
      session('2026-09-03T10:00:00Z', [skipped('Bench Press', 'pain')]),
    ];
    expect(hasPainStreak(sessions, 'Bench Press')).toBe(true);
  });

  it('is false when the latest appearance was completed', () => {
    const sessions = [
      session('2026-09-01T10:00:00Z', [skipped('Bench Press', 'pain')]),
      session('2026-09-03T10:00:00Z', [skipped('Bench Press', 'pain')]),
      session('2026-09-05T10:00:00Z', [exercise({ completed: true })]),
    ];
    expect(hasPainStreak(sessions, 'Bench Press')).toBe(false);
  });

  it('is false when one of the two skips had another reason', () => {
    const sessions = [
      session('2026-09-01T10:00:00Z', [skipped('Bench Press', 'equipment-busy')]),
      session('2026-09-03T10:00:00Z', [skipped('Bench Press', 'pain')]),
    ];
    expect(hasPainStreak(sessions, 'Bench Press')).toBe(false);
  });

  it('is false with only one earlier appearance', () => {
    const sessions = [session('2026-09-01T10:00:00Z', [skipped('Bench Press', 'pain')])];
    expect(hasPainStreak(sessions, 'Bench Press')).toBe(false);
  });

  it('matches names case-insensitively and ignores surrounding whitespace', () => {
    const sessions = [
      session('2026-09-01T10:00:00Z', [skipped('bench press', 'pain')]),
      session('2026-09-03T10:00:00Z', [skipped(' BENCH PRESS ', 'pain')]),
    ];
    expect(hasPainStreak(sessions, 'Bench Press')).toBe(true);
  });

  it('uses the newest sessions regardless of array order', () => {
    const sessions = [
      session('2026-09-05T10:00:00Z', [skipped('Bench Press', 'pain')]),
      session('2026-08-01T10:00:00Z', [exercise({ completed: true })]),
      session('2026-09-03T10:00:00Z', [skipped('Bench Press', 'pain')]),
    ];
    expect(hasPainStreak(sessions, 'Bench Press')).toBe(true);
  });

  it('ignores sessions that do not contain the exercise', () => {
    const sessions = [
      session('2026-09-01T10:00:00Z', [skipped('Bench Press', 'pain')]),
      session('2026-09-02T10:00:00Z', [exercise({ name: 'Squat', completed: true })]),
      session('2026-09-03T10:00:00Z', [skipped('Bench Press', 'pain')]),
    ];
    expect(hasPainStreak(sessions, 'Bench Press')).toBe(true);
  });

  it('counts a session listing the exercise twice as one appearance', () => {
    const sessions = [
      session('2026-09-03T10:00:00Z', [
        skipped('Bench Press', 'pain'),
        skipped('Bench Press', 'pain'),
      ]),
    ];
    expect(hasPainStreak(sessions, 'Bench Press')).toBe(false);
  });
});
