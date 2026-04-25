'use client';

import { useEffect, useRef, useState } from 'react';
import { History, MoreVertical, Search, RotateCcw } from 'lucide-react';
import { ModalSheet, Input } from '@/components/ui';
import { useTranslations, useLocale } from '@/lib/locale-context';
import { useExerciseHistory } from '@/hooks/useExerciseHistory';
import { formatSessionDate } from '@/lib/sessionUtils';
import type { HistoryEntry } from '@/lib/exerciseHistory';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (entry: HistoryEntry) => void;
}

export default function ExerciseHistoryPicker({ isOpen, onClose, onSelect }: Props) {
  const t = useTranslations();
  const { locale } = useLocale();
  const {
    entries,
    hiddenCount,
    search,
    setSearch,
    showHidden,
    setShowHidden,
    hide,
    unhide,
  } = useExerciseHistory({ refreshKey: isOpen });

  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!openMenuKey) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuKey(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openMenuKey]);

  const isEmpty = entries.length === 0 && !search.trim() && !showHidden && hiddenCount === 0;

  return (
    <ModalSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t.history_picker_title}
      icon={<History className="w-4 h-4 text-brand" />}
    >
      <div className="flex-1 min-h-[45dvh] flex flex-col">
        {/* Search */}
        <div className="relative mb-3 flex-shrink-0">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.history_picker_search_placeholder}
            className="pl-9"
            autoComplete="off"
          />
        </div>

        {/* List */}
        <div className="flex-1 min-h-0 overflow-y-auto -mx-2 px-2">
          {isEmpty ? (
            <div className="py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-elevated flex items-center justify-center mx-auto mb-3">
                <History className="w-6 h-6 text-muted" />
              </div>
              <p className="text-secondary text-sm font-medium">{t.history_picker_empty_title}</p>
              <p className="text-muted text-xs mt-1">{t.history_picker_empty_subtitle}</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted text-sm">{t.history_picker_no_results}</p>
            </div>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {entries.map((entry) => (
                <li key={entry.key} className="relative">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelect(entry)}
                      className={`flex-1 text-left py-3 px-2 rounded-lg active:bg-elevated transition-colors duration-100 cursor-pointer min-h-[56px] ${
                        entry.isHidden ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-sm font-medium truncate">
                          {entry.name}
                        </span>
                        {entry.category && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-elevated text-secondary shrink-0">
                            {(t.category_labels as Record<string, string>)[entry.category] ??
                              entry.category}
                          </span>
                        )}
                      </div>
                      <p className="text-muted text-xs mt-0.5">
                        {formatSessionDate(entry.lastUsedAt, locale, 'short')}
                      </p>
                    </button>
                    {entry.isHidden ? (
                      <button
                        type="button"
                        onClick={() => unhide(entry)}
                        className="shrink-0 text-xs font-medium text-brand px-3 py-2 rounded-lg cursor-pointer active:bg-elevated transition-colors duration-100 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        {t.history_picker_unhide}
                      </button>
                    ) : (
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuKey((cur) => (cur === entry.key ? null : entry.key))
                          }
                          aria-label={t.history_picker_row_menu_aria}
                          className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer active:bg-elevated transition-colors duration-100"
                        >
                          <MoreVertical className="w-4 h-4 text-muted" />
                        </button>
                        {openMenuKey === entry.key && (
                          <div
                            ref={menuRef}
                            className="absolute right-0 top-full mt-1 z-10 min-w-[220px] bg-base border border-border rounded-xl shadow-lg overflow-hidden"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                hide(entry);
                                setOpenMenuKey(null);
                              }}
                              className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-surface active:bg-elevated transition-colors duration-100 cursor-pointer"
                            >
                              <span className="font-medium">{t.history_picker_hide}</span>
                              <span className="block text-muted text-xs mt-0.5">
                                {t.history_picker_hide_disclaimer}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Show hidden toggle */}
        {hiddenCount > 0 && (
          <div className="flex-shrink-0 pt-3 border-t border-border-subtle mt-2">
            <button
              type="button"
              onClick={() => setShowHidden(!showHidden)}
              className="w-full text-center text-xs font-medium text-secondary py-2 rounded-lg active:bg-elevated transition-colors duration-100 cursor-pointer"
            >
              {showHidden
                ? t.history_picker_hide_hidden
                : t.history_picker_show_hidden.replace('{n}', String(hiddenCount))}
            </button>
          </div>
        )}
      </div>
    </ModalSheet>
  );
}
