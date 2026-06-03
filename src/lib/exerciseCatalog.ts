import type { Muscle, MuscleGroup } from './muscles';
import { ALL_MUSCLE_GROUPS, MUSCLE_TO_GROUP } from './muscles';
import type { Exercise } from './types';
import type { Translations } from './i18n';

/**
 * A single entry in the built-in, read-only exercise catalog. Entries are
 * defined in code (no persistence) and surfaced both as a "Pick from catalog"
 * picker in the Add Exercise flow and on the standalone browse screen.
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
 * The built-in catalog. Order within each muscle group is preserved on the
 * browse screen. Defaults are deliberately conservative starting points the
 * user is free to edit before saving.
 */
export const EXERCISE_CATALOG: CatalogExercise[] = [
  // ── Cardio machines (user's gym) ──────────────────────────────────────────
  { id: 'elliptical', muscle: 'cardio', type: 'duration', defaultDurationSec: 600, source: 'gym' },
  { id: 'treadmill', muscle: 'cardio', type: 'duration', defaultDurationSec: 600, source: 'gym' },
  {
    id: 'stationary-bike',
    muscle: 'cardio',
    type: 'duration',
    defaultDurationSec: 600,
    source: 'gym',
  },
  {
    id: 'stair-climber',
    muscle: 'cardio',
    type: 'duration',
    defaultDurationSec: 600,
    source: 'gym',
  },
  {
    id: 'rowing-machine',
    muscle: 'cardio',
    type: 'duration',
    defaultDurationSec: 600,
    source: 'gym',
  },

  // ── Lower body machines (user's gym) ──────────────────────────────────────
  {
    id: 'leg-press',
    muscle: 'quads',
    type: 'sets-reps',
    defaultSets: 3,
    defaultReps: 12,
    source: 'gym',
  },
  {
    id: 'leg-extension',
    muscle: 'quads',
    type: 'sets-reps',
    defaultSets: 3,
    defaultReps: 12,
    source: 'gym',
  },
  {
    id: 'leg-curl-lying',
    muscle: 'hamstrings',
    type: 'sets-reps',
    defaultSets: 3,
    defaultReps: 12,
    source: 'gym',
  },
  {
    id: 'leg-curl-seated',
    muscle: 'hamstrings',
    type: 'sets-reps',
    defaultSets: 3,
    defaultReps: 12,
    source: 'gym',
  },
  {
    id: 'glute-machine',
    muscle: 'glutes',
    type: 'sets-reps',
    defaultSets: 3,
    defaultReps: 12,
    source: 'gym',
  },
  {
    id: 'hip-abduction',
    muscle: 'glutes',
    type: 'sets-reps',
    defaultSets: 3,
    defaultReps: 15,
    source: 'gym',
  },
  {
    id: 'hip-adduction',
    muscle: 'glutes',
    type: 'sets-reps',
    defaultSets: 3,
    defaultReps: 15,
    source: 'gym',
  },

  // ── Core / trunk machines (user's gym) ────────────────────────────────────
  {
    id: 'ab-crunch-machine',
    muscle: 'abs',
    type: 'sets-reps',
    defaultSets: 3,
    defaultReps: 15,
    source: 'gym',
  },
  {
    id: 'rotary-torso',
    muscle: 'obliques',
    type: 'sets-reps',
    defaultSets: 3,
    defaultReps: 15,
    source: 'gym',
  },
  {
    id: 'back-extension',
    muscle: 'lower_back',
    type: 'sets-reps',
    defaultSets: 3,
    defaultReps: 15,
    source: 'gym',
  },

  // ── Common starter set ────────────────────────────────────────────────────
  {
    id: 'bench-press',
    muscle: 'chest',
    type: 'sets-reps',
    defaultSets: 3,
    defaultReps: 10,
    source: 'starter',
  },
  {
    id: 'incline-bench-press',
    muscle: 'chest',
    type: 'sets-reps',
    defaultSets: 3,
    defaultReps: 10,
    source: 'starter',
  },
  {
    id: 'chest-press-machine',
    muscle: 'chest',
    type: 'sets-reps',
    defaultSets: 3,
    defaultReps: 12,
    source: 'starter',
  },
  {
    id: 'lat-pulldown',
    muscle: 'back',
    type: 'sets-reps',
    defaultSets: 3,
    defaultReps: 12,
    source: 'starter',
  },
  {
    id: 'seated-cable-row',
    muscle: 'back',
    type: 'sets-reps',
    defaultSets: 3,
    defaultReps: 12,
    source: 'starter',
  },
  {
    id: 'overhead-press',
    muscle: 'shoulders',
    type: 'sets-reps',
    defaultSets: 3,
    defaultReps: 10,
    source: 'starter',
  },
  {
    id: 'lateral-raise',
    muscle: 'shoulders',
    type: 'sets-reps',
    defaultSets: 3,
    defaultReps: 15,
    source: 'starter',
  },
  {
    id: 'biceps-curl',
    muscle: 'arms',
    type: 'sets-reps',
    defaultSets: 3,
    defaultReps: 12,
    source: 'starter',
  },
  {
    id: 'triceps-pushdown',
    muscle: 'arms',
    type: 'sets-reps',
    defaultSets: 3,
    defaultReps: 12,
    source: 'starter',
  },
  {
    id: 'plank',
    muscle: 'abs',
    type: 'sets-duration',
    defaultSets: 3,
    defaultDurationSec: 30,
    source: 'starter',
  },
];

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
