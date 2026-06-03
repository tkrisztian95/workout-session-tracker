import { describe, expect, it } from 'vitest';
import en from '@/locales/en.json';
import hu from '@/locales/hu.json';
import de from '@/locales/de.json';
import { ALL_MUSCLES } from './muscles';
import { EXERCISE_CATALOG, catalogByGroup } from './exerciseCatalog';

const VALID_TYPES = new Set(['sets-reps', 'sets-duration', 'duration']);

describe('EXERCISE_CATALOG', () => {
  it('has unique ids', () => {
    const ids = EXERCISE_CATALOG.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('uses only canonical muscles and valid types', () => {
    for (const entry of EXERCISE_CATALOG) {
      expect(ALL_MUSCLES).toContain(entry.muscle);
      expect(VALID_TYPES.has(entry.type)).toBe(true);
    }
  });

  it('provides type-appropriate defaults', () => {
    for (const entry of EXERCISE_CATALOG) {
      if (entry.type === 'sets-reps') {
        expect(entry.defaultSets).toBeGreaterThan(0);
        expect(entry.defaultReps).toBeGreaterThan(0);
      }
      if (entry.type === 'sets-duration') {
        expect(entry.defaultSets).toBeGreaterThan(0);
        expect(entry.defaultDurationSec).toBeGreaterThan(0);
      }
      if (entry.type === 'duration') {
        expect(entry.defaultDurationSec).toBeGreaterThan(0);
      }
    }
  });

  it('has a non-empty localized name for every entry in all locales', () => {
    for (const locale of [en, hu, de]) {
      const names = locale.catalog_exercise_names as Record<string, string>;
      for (const entry of EXERCISE_CATALOG) {
        expect(names[entry.id], `missing name for "${entry.id}"`).toBeTruthy();
      }
    }
  });
});

describe('catalogByGroup', () => {
  it('includes every entry exactly once across groups', () => {
    const grouped = catalogByGroup().flatMap((g) => g.entries);
    expect(grouped).toHaveLength(EXERCISE_CATALOG.length);
    expect(new Set(grouped.map((e) => e.id)).size).toBe(EXERCISE_CATALOG.length);
  });
});
