'use client';

import type { MuscleGroup } from '@/lib/muscles';
import { ALL_MUSCLE_GROUPS } from '@/lib/muscles';
import type { Difficulty } from '@/lib/exerciseCatalog';
import { ALL_DIFFICULTIES } from '@/lib/exerciseCatalog';
import { useTranslations } from '@/lib/locale-context';

interface Props {
  selectedGroups: Set<MuscleGroup>;
  selectedDifficulties: Set<Difficulty>;
  onToggleGroup: (group: MuscleGroup) => void;
  onToggleDifficulty: (difficulty: Difficulty) => void;
}

/**
 * Horizontally-scrollable filter chips for the catalog: muscle groups and
 * difficulties. Multi-select within each dimension; an empty selection means no
 * constraint. Shared by the picker and the browse screen.
 */
export default function CatalogFilterBar({
  selectedGroups,
  selectedDifficulties,
  onToggleGroup,
  onToggleDifficulty,
}: Props) {
  const t = useTranslations();

  const chipClass = (active: boolean) =>
    `shrink-0 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors duration-150 border ${
      active
        ? 'bg-brand text-white border-brand'
        : 'bg-elevated text-secondary border-border active:bg-border-subtle'
    }`;

  return (
    <div className="-mx-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
      <div className="flex items-center gap-2 px-1 w-max">
        {ALL_MUSCLE_GROUPS.map((group) => (
          <button
            key={group}
            type="button"
            onClick={() => onToggleGroup(group)}
            aria-pressed={selectedGroups.has(group)}
            className={chipClass(selectedGroups.has(group))}
          >
            {t.muscle_group_labels[group]}
          </button>
        ))}
        <span className="shrink-0 w-px h-5 bg-border mx-1" aria-hidden="true" />
        {ALL_DIFFICULTIES.map((difficulty) => (
          <button
            key={difficulty}
            type="button"
            onClick={() => onToggleDifficulty(difficulty)}
            aria-pressed={selectedDifficulties.has(difficulty)}
            className={chipClass(selectedDifficulties.has(difficulty))}
          >
            {t.catalog_difficulty_labels[difficulty]}
          </button>
        ))}
      </div>
    </div>
  );
}
