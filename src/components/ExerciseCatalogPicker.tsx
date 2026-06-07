'use client';

import { useMemo, useState } from 'react';
import { LayoutGrid, Search } from 'lucide-react';
import { ModalSheet, Input } from '@/components/ui';
import { useTranslations } from '@/lib/locale-context';
import MuscleBadge from '@/components/MuscleBadge';
import DifficultyBadge from '@/components/DifficultyBadge';
import {
  EXERCISE_CATALOG,
  catalogAliases,
  catalogByGroup,
  catalogHint,
  catalogName,
  catalogSearchText,
  type CatalogExercise,
} from '@/lib/exerciseCatalog';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (entry: CatalogExercise) => void;
}

export default function ExerciseCatalogPicker({ isOpen, onClose, onSelect }: Props) {
  const t = useTranslations();
  const [search, setSearch] = useState('');

  const query = search.trim().toLowerCase();

  const groups = useMemo(() => {
    if (!query) return catalogByGroup();
    return catalogByGroup()
      .map((g) => ({
        group: g.group,
        entries: g.entries.filter((e) => catalogSearchText(e.id).includes(query)),
      }))
      .filter((g) => g.entries.length > 0);
  }, [query]);

  const hasResults = groups.length > 0;
  const totalShown = groups.reduce((n, g) => n + g.entries.length, 0);

  return (
    <ModalSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t.catalog_picker_title}
      icon={<LayoutGrid className="w-4 h-4 text-brand" />}
    >
      <div className="flex-1 min-h-[45dvh] flex flex-col">
        {/* Search */}
        <div className="relative mb-3 flex-shrink-0">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.catalog_picker_search_placeholder}
            className="pl-9"
            autoComplete="off"
          />
        </div>

        {/* Grouped list */}
        <div className="flex-1 min-h-0 overflow-y-auto -mx-2 px-2">
          {!hasResults ? (
            <div className="py-12 text-center">
              <p className="text-muted text-sm">{t.catalog_picker_no_results}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map(({ group, entries }) => (
                <div key={group}>
                  <h3 className="text-xs font-semibold text-secondary tracking-widest uppercase mb-1 px-2">
                    {t.muscle_group_labels[group]}
                  </h3>
                  <ul className="divide-y divide-border-subtle">
                    {entries.map((entry) => (
                      <li key={entry.id}>
                        <button
                          type="button"
                          onClick={() => onSelect(entry)}
                          className="w-full flex items-center gap-2 text-left py-3 px-2 rounded-lg active:bg-elevated transition-colors duration-100 cursor-pointer min-h-[48px]"
                        >
                          <span className="flex-1 min-w-0">
                            <span className="block text-foreground text-sm font-medium truncate">
                              {catalogName(t, entry.id)}
                            </span>
                            {(catalogHint(t, entry.id) ||
                              catalogAliases(t, entry.id).length > 0) && (
                              <span className="block text-muted text-xs truncate">
                                {catalogHint(t, entry.id)}
                                {catalogHint(t, entry.id) &&
                                  catalogAliases(t, entry.id).length > 0 &&
                                  ' · '}
                                {catalogAliases(t, entry.id).length > 0 &&
                                  t.catalog_also_called.replace(
                                    '{names}',
                                    catalogAliases(t, entry.id).join(', '),
                                  )}
                              </span>
                            )}
                          </span>
                          <span className="shrink-0 flex flex-col items-end gap-1">
                            <MuscleBadge muscle={entry.muscle} />
                            <DifficultyBadge difficulty={entry.difficulty} />
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Count footer */}
        {hasResults && (
          <div className="flex-shrink-0 pt-3 border-t border-border-subtle mt-2 text-center">
            <span className="text-xs text-dim">
              {totalShown} / {EXERCISE_CATALOG.length}
            </span>
          </div>
        )}
      </div>
    </ModalSheet>
  );
}
