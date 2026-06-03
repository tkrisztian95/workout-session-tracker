import type { Muscle, MuscleGroup } from './muscles';
import { ALL_MUSCLE_GROUPS, MUSCLE_TO_GROUP } from './muscles';
import type { Exercise } from './types';
import type { Translations } from './i18n';
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
export interface CatalogExercise {
  /** Stable slug, e.g. 'leg-press'. Used as i18n key and React key. */
  id: string;
  /** Muscle from the app's taxonomy. */
  muscle: Muscle;
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
