import type { Muscle, MuscleGroup } from './muscles';
import { ALL_MUSCLE_GROUPS, MUSCLE_TO_GROUP } from './muscles';
import type { Exercise } from './types';
import type { Translations } from './i18n';
import { translations } from './i18n';
import catalogData from './exerciseCatalog.json';

/**
 * A single entry in the built-in, read-only exercise catalog. Entries are
 * defined as data in `exerciseCatalog.json` (no persistence) and surfaced both
 * as a "Pick from catalog" picker in the Add Exercise flow and on the standalone
 * browse screen.
 *
 * `id` is a stable English slug used as the i18n key and React key — it is never
 * shown to the user. Display names live in the locale files under
 * `catalog_exercise_names`, keyed by this id (see `catalogName`).
 */
/** Relative skill/experience level for a catalog entry. */
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export const ALL_DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

export interface CatalogExercise {
  /** Stable slug, e.g. 'leg-press'. Used as i18n key and React key. */
  id: string;
  /** Muscle from the app's taxonomy. */
  muscle: Muscle;
  /** Relative skill level, shown as a badge in the picker and browse screen. */
  difficulty: Difficulty;
  /** Default exercise type pre-filled into the Add Exercise form. */
  type: Exercise['type'];
  /** Default sets for `sets-reps` / `sets-duration`. */
  defaultSets?: number;
  /** Default reps for `sets-reps`. */
  defaultReps?: number;
  /** Default duration (seconds) for `sets-duration` / `duration`. */
  defaultDurationSec?: number;
  /**
   * Provenance: `gym` = a machine from the user's gym notes, `starter` = a
   * common movement added so the catalog is useful as a general starting point.
   */
  source: 'gym' | 'starter';
}

/**
 * The built-in catalog, loaded from `exerciseCatalog.json`. Order within each
 * muscle group is preserved on the browse screen. The JSON import widens string
 * fields, so it is asserted back to `CatalogExercise[]`; the shape is guarded by
 * `exerciseCatalog.test.ts`.
 */
export const EXERCISE_CATALOG = catalogData as CatalogExercise[];

/**
 * Resolve a catalog entry's localized display name. Falls back to the entry id
 * if a locale is missing the key (also keeps TypeScript happy for ids not in
 * the inferred literal key set).
 */
export function catalogName(t: Translations, id: string): string {
  const names = t.catalog_exercise_names as Record<string, string>;
  return names[id] ?? id;
}

/**
 * Alternative names for an entry in the active locale (e.g. "Glute trainer" for
 * `glute-machine`). Used for the "also called" line and matched by search.
 * Returns an empty array when the entry has no aliases.
 */
export function catalogAliases(t: Translations, id: string): string[] {
  const aliases = t.catalog_exercise_aliases as Record<string, string[]>;
  return aliases[id] ?? [];
}

/**
 * A short disambiguating hint for an entry in the active locale (e.g. "Flat
 * barbell press" vs "Flat machine press"). Returns undefined when absent.
 */
export function catalogHint(t: Translations, id: string): string | undefined {
  const hints = t.catalog_exercise_hints as Record<string, string>;
  return hints[id];
}

/**
 * An optional localized coaching/form note for an entry, intended to seed the
 * created exercise's `scalingNote` (the note rendered on the exercise card, as
 * AI-generated exercises carry). Structure only for now — the
 * `catalog_exercise_notes` maps are empty and `applyCatalogEntry` does not yet
 * pass this through; populate the maps and wire it up when the card note is
 * wanted. Returns undefined when absent.
 */
export function catalogNote(t: Translations, id: string): string | undefined {
  const notes = t.catalog_exercise_notes as Record<string, string>;
  return notes[id];
}

/**
 * Lowercased search haystack for an entry: its name, aliases, and hint across
 * ALL locales. This lets a query in any language (e.g. the German "Beinpresse")
 * match the entry regardless of the active UI locale, and lets a merged
 * machine's alias (e.g. "Vertical bench press") surface its canonical entry.
 */
export function catalogSearchText(id: string): string {
  const parts: string[] = [];
  for (const t of Object.values(translations)) {
    const names = t.catalog_exercise_names as Record<string, string>;
    const aliases = t.catalog_exercise_aliases as Record<string, string[]>;
    const hints = t.catalog_exercise_hints as Record<string, string>;
    if (names[id]) parts.push(names[id]);
    if (aliases[id]) parts.push(...aliases[id]);
    if (hints[id]) parts.push(hints[id]);
  }
  return parts.join(' ').toLowerCase();
}

/**
 * Group the catalog by muscle group in canonical `ALL_MUSCLE_GROUPS` order,
 * preserving catalog order within each group. Groups with no entries are
 * omitted. Used by the browse screen.
 */
export function catalogByGroup(): { group: MuscleGroup; entries: CatalogExercise[] }[] {
  return ALL_MUSCLE_GROUPS.map((group) => ({
    group,
    entries: EXERCISE_CATALOG.filter((e) => MUSCLE_TO_GROUP[e.muscle] === group),
  })).filter((g) => g.entries.length > 0);
}
