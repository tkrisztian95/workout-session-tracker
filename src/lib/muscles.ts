export type MuscleGroup = 'upper' | 'lower' | 'core' | 'cardio';

export type Muscle =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs'
  | 'obliques'
  | 'lower_back'
  | 'cardio';

export const MUSCLE_TO_GROUP: Record<Muscle, MuscleGroup> = {
  chest: 'upper',
  back: 'upper',
  shoulders: 'upper',
  arms: 'upper',
  quads: 'lower',
  hamstrings: 'lower',
  glutes: 'lower',
  calves: 'lower',
  abs: 'core',
  obliques: 'core',
  lower_back: 'core',
  cardio: 'cardio',
};

export const ALL_MUSCLES: Muscle[] = Object.keys(MUSCLE_TO_GROUP) as Muscle[];

export const MUSCLES_BY_GROUP: Record<MuscleGroup, Muscle[]> = {
  upper: ['chest', 'back', 'shoulders', 'arms'],
  lower: ['quads', 'hamstrings', 'glutes', 'calves'],
  core: ['abs', 'obliques', 'lower_back'],
  cardio: ['cardio'],
};

export const ALL_MUSCLE_GROUPS: MuscleGroup[] = ['upper', 'lower', 'core', 'cardio'];

const LEGACY_CATEGORY_MAP: Record<string, Muscle> = {
  arms: 'arms',
  legs: 'quads',
  abs: 'abs',
  chest: 'chest',
  back: 'back',
  shoulders: 'shoulders',
  calves: 'calves',
  cardio: 'cardio',
  core: 'abs',
};

const CANONICAL_MUSCLES = new Set<string>(ALL_MUSCLES);

export function migrateLegacyCategory(value: string | undefined | null): Muscle | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const key = trimmed.toLowerCase();
  if (CANONICAL_MUSCLES.has(key)) return key as Muscle;
  return LEGACY_CATEGORY_MAP[key];
}

export function groupFor(muscle: Muscle | undefined): MuscleGroup | undefined {
  return muscle ? MUSCLE_TO_GROUP[muscle] : undefined;
}
