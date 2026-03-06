export interface WgerExercise {
  name: string;
  category: string;
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
        category: item.data.category ?? 'Other',
      }));
    cache.set(query, results);
    return results;
  } catch {
    cache.set(query, []);
    return [];
  }
}
