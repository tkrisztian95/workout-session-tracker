import { describe, expect, it } from 'vitest';
import en from '@/locales/en.json';
import hu from '@/locales/hu.json';
import de from '@/locales/de.json';
import { ALL_MUSCLES } from './muscles';
import { EXERCISE_CATALOG, catalogByGroup, catalogSearchText } from './exerciseCatalog';

const VALID_TYPES = new Set(['sets-reps', 'sets-duration', 'duration']);
const CATALOG_IDS = new Set(EXERCISE_CATALOG.map((e) => e.id));

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

  it('does not keep merged-away ids', () => {
    expect(CATALOG_IDS.has('glute-trainer')).toBe(false);
    expect(CATALOG_IDS.has('vertical-bench-press')).toBe(false);
  });
});

describe('catalog aliases and hints', () => {
  const locales = { en, hu, de };

  it('keeps alias and hint maps key-aligned across locales', () => {
    const aliasKeys = Object.keys(en.catalog_exercise_aliases);
    const hintKeys = Object.keys(en.catalog_exercise_hints);
    for (const [name, loc] of Object.entries(locales)) {
      expect(Object.keys(loc.catalog_exercise_aliases), `aliases drift in ${name}`).toEqual(
        aliasKeys,
      );
      expect(Object.keys(loc.catalog_exercise_hints), `hints drift in ${name}`).toEqual(hintKeys);
    }
  });

  it('only references real catalog ids', () => {
    for (const loc of Object.values(locales)) {
      for (const id of Object.keys(loc.catalog_exercise_aliases)) {
        expect(CATALOG_IDS.has(id), `alias for unknown id "${id}"`).toBe(true);
      }
      for (const id of Object.keys(loc.catalog_exercise_hints)) {
        expect(CATALOG_IDS.has(id), `hint for unknown id "${id}"`).toBe(true);
      }
    }
  });
});

describe('catalogSearchText', () => {
  it('matches a merged machine via its alias', () => {
    expect(catalogSearchText('chest-press-machine')).toContain('vertical bench press');
    expect(catalogSearchText('glute-machine')).toContain('glute trainer');
  });

  it('matches an entry by its name in another locale', () => {
    // German "Beinpresse" should find leg-press even from an English UI.
    expect(catalogSearchText('leg-press')).toContain('beinpresse');
  });
});

describe('catalogByGroup', () => {
  it('includes every entry exactly once across groups', () => {
    const grouped = catalogByGroup().flatMap((g) => g.entries);
    expect(grouped).toHaveLength(EXERCISE_CATALOG.length);
    expect(new Set(grouped.map((e) => e.id)).size).toBe(EXERCISE_CATALOG.length);
  });
});
