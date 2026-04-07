'use client';

import { useState, useEffect } from 'react';
import {
  getSessions,
  getPlans,
  getProfileCreatedAt,
  getAchievements,
  saveAchievements,
} from '@/lib/storage';
import { syncAchievements } from '@/lib/achievementEngine';
import type { AchievementRecord } from '@/lib/types';

export function useAchievements() {
  const [allRecords, setAllRecords] = useState<AchievementRecord[]>(() => {
    const sessions = getSessions();
    const plans = getPlans();
    const profileCreatedAt = getProfileCreatedAt();
    // Only treat as first run if there are no achievements in storage
    const isFirstRun = getAchievements().length === 0;
    return syncAchievements({ sessions, plans, profileCreatedAt }, isFirstRun);
  });

  // Removed useEffect to avoid setState in effect error. If you need to re-sync achievements when sessions/plans/profile change, consider exposing a manual refresh function or using a subscription/event pattern.

  const newUnlocks = allRecords.filter((r) => !r.seen);

  function markSeen(id: string) {
    const updated = allRecords.map((r) => (r.id === id ? { ...r, seen: true } : r));
    saveAchievements(updated);
    setAllRecords(updated);
  }

  return { newUnlocks, allRecords, markSeen };
}
