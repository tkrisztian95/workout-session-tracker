import { ACHIEVEMENTS, type AchievementData } from './achievementDefs';
import { getAchievements, saveAchievements } from './storage';
import type { AchievementRecord } from './types';

export type { AchievementData };

export function computeUnlockedIds(data: AchievementData): Set<string> {
  const unlocked = new Set<string>();
  for (const def of ACHIEVEMENTS) {
    if (def.check(data)) {
      unlocked.add(def.id);
    }
  }
  return unlocked;
}

/**
 * Compares computed earned achievements against stored records.
 * Appends new ones (with seen: firstRun to suppress celebration on first-ever run).
 * Persists and returns the updated list.
 */
export function syncAchievements(data: AchievementData, firstRun: boolean): AchievementRecord[] {
  const earned = computeUnlockedIds(data);
  const stored = getAchievements();
  const storedIds = new Set(stored.map((r) => r.id));

  const newRecords: AchievementRecord[] = [];
  for (const id of earned) {
    if (!storedIds.has(id)) {
      newRecords.push({ id, unlockedAt: new Date().toISOString(), seen: firstRun });
    }
  }

  if (newRecords.length === 0) return stored;

  const updated = [...stored, ...newRecords];
  saveAchievements(updated);
  return updated;
}
