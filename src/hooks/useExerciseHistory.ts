import { useCallback, useMemo, useState } from 'react';
import {
  getHiddenExercises,
  getPlans,
  getSessions,
  saveHiddenExercises,
} from '@/lib/storage';
import {
  canonicalExerciseKey,
  deriveExerciseHistory,
  type HistoryEntry,
} from '@/lib/exerciseHistory';

interface UseExerciseHistoryOptions {
  /** Re-read from storage when this value changes (e.g. when picker opens). */
  refreshKey?: unknown;
}

export function useExerciseHistory(options: UseExerciseHistoryOptions = {}) {
  const { refreshKey } = options;
  const [version, setVersion] = useState(0);
  const [search, setSearch] = useState('');
  const [showHidden, setShowHidden] = useState(false);

  const snapshot = useMemo(
    () => ({
      sessions: getSessions(),
      plans: getPlans(),
      hidden: getHiddenExercises(),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshKey, version],
  );

  const allEntries = useMemo(
    () =>
      deriveExerciseHistory(snapshot.sessions, snapshot.plans, snapshot.hidden, {
        includeHidden: true,
      }),
    [snapshot],
  );

  const hiddenCount = useMemo(
    () => allEntries.filter((e) => e.isHidden).length,
    [allEntries],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = allEntries;
    if (!showHidden) {
      list = list.filter((e) => !e.isHidden);
    }
    if (q) {
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (e.category ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [allEntries, search, showHidden]);

  const hide = useCallback((entry: HistoryEntry) => {
    const current = getHiddenExercises();
    const targetKey = canonicalExerciseKey(entry.name, entry.category);
    if (current.some((h) => canonicalExerciseKey(h.nameKey, h.category) === targetKey)) {
      return;
    }
    saveHiddenExercises([...current, { nameKey: entry.nameKey, category: entry.category }]);
    setVersion((v) => v + 1);
  }, []);

  const unhide = useCallback((entry: HistoryEntry) => {
    const current = getHiddenExercises();
    const targetKey = canonicalExerciseKey(entry.name, entry.category);
    const next = current.filter(
      (h) => canonicalExerciseKey(h.nameKey, h.category) !== targetKey,
    );
    if (next.length === current.length) return;
    saveHiddenExercises(next);
    setVersion((v) => v + 1);
  }, []);

  return {
    entries: filtered,
    hiddenCount,
    search,
    setSearch,
    showHidden,
    setShowHidden,
    hide,
    unhide,
  };
}
