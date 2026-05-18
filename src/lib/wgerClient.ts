import type { Muscle } from './muscles';
import { MUSCLES_BY_GROUP, migrateLegacyCategory } from './muscles';

/**
 * The 12 canonical muscle keys exposed through the wger manual picker, in
 * display order (Upper → Lower → Core → Cardio). Existing UI surfaces import
 * this as `WGER_CATEGORIES` for back-compat with the flat dropdown; the new
 * grouped picker (section 7) consumes `MUSCLES_BY_GROUP` directly.
 */
export const WGER_CATEGORIES: readonly Muscle[] = [
  ...MUSCLES_BY_GROUP.upper,
  ...MUSCLES_BY_GROUP.lower,
  ...MUSCLES_BY_GROUP.core,
  ...MUSCLES_BY_GROUP.cardio,
];

export interface WgerExercise {
  name: string;
  muscle?: Muscle;
}

const cache = new Map<string, WgerExercise[]>();

export async function searchExercises(query: string): Promise<WgerExercise[]> {
  if (cache.has(query)) {
    return cache.get(query)!;
  }

  try {
    const url = `https://wger.de/api/v2/exercise/search/?format=json&language=english&term=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    if (!res.ok) {
      cache.set(query, []);
      return [];
    }
    const data = await res.json();
    const results: WgerExercise[] = (data.suggestions ?? [])
      .slice(0, 8)
      .map((item: { data: { name: string; category: string } }) => ({
        name: item.data.name,
        muscle: migrateLegacyCategory(item.data.category),
      }));
    cache.set(query, results);
    return results;
  } catch {
    cache.set(query, []);
    return [];
  }
}
