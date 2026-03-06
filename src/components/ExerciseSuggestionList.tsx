'use client';

import type { WgerExercise } from '@/lib/wgerClient';
import { useTranslations } from '@/lib/locale-context';

interface Props {
  suggestions: WgerExercise[];
  loading: boolean;
  onSelect: (name: string, category: string) => void;
}

export default function ExerciseSuggestionList({ suggestions, loading, onSelect }: Props) {
  const t = useTranslations();
  const showLoading = loading && suggestions.length === 0;
  const showList = suggestions.length > 0;

  if (!showLoading && !showList) return null;

  return (
    <ul
      className="absolute left-0 right-0 top-full mt-1 z-60 bg-[#111827] border border-[#374151] rounded-xl overflow-y-auto max-h-56 shadow-lg"
      style={{ touchAction: 'pan-y' }}
    >
      {showLoading && (
        <li className="px-4 py-3 text-[#6B7280] text-sm animate-pulse">
          {t.exercise_suggestions_loading}
        </li>
      )}
      {showList &&
        suggestions.map((ex, i) => (
          <li key={i}>
            <button
              type="button"
              onMouseDown={(e) => {
                // Prevent blur from firing before click
                e.preventDefault();
                onSelect(ex.name, ex.category);
              }}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#1F2937] active:bg-[#374151] transition-colors duration-100 cursor-pointer min-h-[48px]"
            >
              <span className="text-[#F9FAFB] text-sm font-medium truncate">{ex.name}</span>
              <span className="ml-3 shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#374151] text-[#9CA3AF]">
                {ex.category}
              </span>
            </button>
          </li>
        ))}
    </ul>
  );
}
