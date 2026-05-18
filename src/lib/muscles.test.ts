import { describe, expect, it } from 'vitest';
import {
  ALL_MUSCLES,
  ALL_MUSCLE_GROUPS,
  MUSCLES_BY_GROUP,
  MUSCLE_TO_GROUP,
  groupFor,
  migrateLegacyCategory,
  type Muscle,
} from './muscles';

describe('MUSCLE_TO_GROUP', () => {
  it('covers all 12 canonical muscles', () => {
    expect(Object.keys(MUSCLE_TO_GROUP)).toHaveLength(12);
  });

  it('places each muscle in exactly one group across MUSCLES_BY_GROUP', () => {
    const flattened = ALL_MUSCLE_GROUPS.flatMap((g) => MUSCLES_BY_GROUP[g]);
    expect(flattened).toHaveLength(12);
    expect(new Set(flattened).size).toBe(12);
  });

  it('keeps MUSCLE_TO_GROUP and MUSCLES_BY_GROUP consistent', () => {
    for (const group of ALL_MUSCLE_GROUPS) {
      for (const muscle of MUSCLES_BY_GROUP[group]) {
        expect(MUSCLE_TO_GROUP[muscle]).toBe(group);
      }
    }
  });
});

describe('ALL_MUSCLES', () => {
  it('contains every key from MUSCLE_TO_GROUP', () => {
    expect(new Set(ALL_MUSCLES)).toEqual(new Set(Object.keys(MUSCLE_TO_GROUP)));
  });
});

describe('groupFor', () => {
  it('returns the matching group for a muscle', () => {
    expect(groupFor('chest')).toBe('upper');
    expect(groupFor('quads')).toBe('lower');
    expect(groupFor('abs')).toBe('core');
    expect(groupFor('cardio')).toBe('cardio');
  });

  it('returns undefined when muscle is undefined', () => {
    expect(groupFor(undefined)).toBeUndefined();
  });
});

describe('migrateLegacyCategory', () => {
  it.each<[string, Muscle]>([
    ['Arms', 'arms'],
    ['Legs', 'quads'],
    ['Abs', 'abs'],
    ['Chest', 'chest'],
    ['Back', 'back'],
    ['Shoulders', 'shoulders'],
    ['Calves', 'calves'],
    ['Cardio', 'cardio'],
    ['Core', 'abs'],
  ])('maps legacy %s to %s', (input, expected) => {
    expect(migrateLegacyCategory(input)).toBe(expected);
  });

  it('matches case-insensitively', () => {
    expect(migrateLegacyCategory('legs')).toBe('quads');
    expect(migrateLegacyCategory('LEGS')).toBe('quads');
    expect(migrateLegacyCategory('  Legs  ')).toBe('quads');
  });

  it('passes already-canonical muscle keys through unchanged', () => {
    for (const m of ALL_MUSCLES) {
      expect(migrateLegacyCategory(m)).toBe(m);
    }
  });

  it.each(['', '   ', 'Other', 'biceps', 'unknown'])('returns undefined for %p', (input) => {
    expect(migrateLegacyCategory(input)).toBeUndefined();
  });

  it('returns undefined for null and undefined', () => {
    expect(migrateLegacyCategory(undefined)).toBeUndefined();
    expect(migrateLegacyCategory(null)).toBeUndefined();
  });
});
