'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { ModalSheet, Button, Input, FieldLabel } from '@/components/ui';
import { ALL_MUSCLE_GROUPS, type MuscleGroup } from '@/lib/muscles';
import { localizeExerciseName } from '@/lib/exerciseCatalog';
import {
  normalizeExerciseName,
  type HistoryFilters,
  type SessionTypeFilter,
} from '@/lib/historyFilters';
import { useTranslations } from '@/lib/locale-context';

interface HistoryFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  value: Pick<HistoryFilters, 'sessionType' | 'muscleGroups' | 'exercises'>;
  /** Distinct exercise names available to filter by (display casing). */
  availableExercises: string[];
  onApply: (next: Pick<HistoryFilters, 'sessionType' | 'muscleGroups' | 'exercises'>) => void;
  onClear: () => void;
}

const SESSION_TYPES: SessionTypeFilter[] = ['all', 'plan', 'free'];

export default function HistoryFilterSheet({
  isOpen,
  onClose,
  value,
  availableExercises,
  onApply,
  onClear,
}: HistoryFilterSheetProps) {
  const t = useTranslations();

  const [sessionType, setSessionType] = useState<SessionTypeFilter>(value.sessionType);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>(value.muscleGroups);
  const [exercises, setExercises] = useState<string[]>(value.exercises);
  const [search, setSearch] = useState('');

  // Re-seed local draft from the applied filters each time the sheet opens.
  /* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isOpen) return;
    setSessionType(value.sessionType);
    setMuscleGroups(value.muscleGroups);
    setExercises(value.exercises);
    setSearch('');
  }, [isOpen]);
  /* eslint-enable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */

  function toggleGroup(group: MuscleGroup) {
    setMuscleGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group],
    );
  }

  function toggleExercise(name: string) {
    const key = normalizeExerciseName(name);
    setExercises((prev) =>
      prev.some((e) => normalizeExerciseName(e) === key)
        ? prev.filter((e) => normalizeExerciseName(e) !== key)
        : [...prev, name],
    );
  }

  const sessionTypeLabel: Record<SessionTypeFilter, string> = {
    all: t.history_filter_type_all,
    plan: t.history_filter_type_plan,
    free: t.history_filter_type_free,
  };

  // Pair each stored name with its active-locale label, then search/sort by label.
  const exerciseOptions = availableExercises
    .map((name) => ({ name, label: localizeExerciseName(t, name) }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const query = normalizeExerciseName(search);
  const filteredExercises = query
    ? exerciseOptions.filter(
        (o) =>
          normalizeExerciseName(o.label).includes(query) ||
          normalizeExerciseName(o.name).includes(query),
      )
    : exerciseOptions;
  const selectedKeys = new Set(exercises.map(normalizeExerciseName));

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title={t.history_filter_title}>
      <div className="flex-1 min-h-0 overflow-y-auto pb-2">
        {/* Session type — segmented control */}
        <FieldLabel>{t.history_filter_type_label}</FieldLabel>
        <div className="flex rounded-xl bg-elevated p-1 mb-5">
          {SESSION_TYPES.map((type) => {
            const active = sessionType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSessionType(type)}
                style={{ touchAction: 'manipulation' }}
                className={[
                  'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer',
                  active ? 'bg-surface text-brand' : 'text-secondary',
                ].join(' ')}
              >
                {sessionTypeLabel[type]}
              </button>
            );
          })}
        </div>

        {/* Muscle groups — multi-select chips */}
        <FieldLabel>{t.history_filter_muscle_groups_label}</FieldLabel>
        <div className="flex flex-wrap gap-2 mb-5">
          {ALL_MUSCLE_GROUPS.map((group) => {
            const active = muscleGroups.includes(group);
            return (
              <button
                key={group}
                type="button"
                onClick={() => toggleGroup(group)}
                className={[
                  'px-3.5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer border',
                  active
                    ? 'bg-brand border-brand text-white'
                    : 'bg-elevated border-transparent text-secondary active:bg-border',
                ].join(' ')}
              >
                {t.muscle_group_labels[group]}
              </button>
            );
          })}
        </div>

        {/* Exercises — searchable multi-select */}
        <FieldLabel>{t.history_filter_exercises_label}</FieldLabel>
        {availableExercises.length === 0 ? (
          <p className="text-sm text-muted mb-2">{t.history_filter_exercises_empty}</p>
        ) : (
          <>
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dim pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.history_filter_exercises_search}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto">
              {filteredExercises.length === 0 ? (
                <p className="text-sm text-muted">{t.history_filter_exercises_no_results}</p>
              ) : (
                filteredExercises.map(({ name, label }) => {
                  const active = selectedKeys.has(normalizeExerciseName(name));
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleExercise(name)}
                      className={[
                        'px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer border',
                        active
                          ? 'bg-brand border-brand text-white'
                          : 'bg-elevated border-transparent text-secondary active:bg-border',
                      ].join(' ')}
                    >
                      {label}
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" size="md" className="flex-1" onClick={onClear}>
            {t.history_filter_clear}
          </Button>
          <Button
            size="md"
            className="flex-1"
            onClick={() => onApply({ sessionType, muscleGroups, exercises })}
          >
            {t.history_filter_apply}
          </Button>
        </div>
      </div>
    </ModalSheet>
  );
}
