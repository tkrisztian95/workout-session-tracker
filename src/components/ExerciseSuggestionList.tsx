'use client';

// TODO: Remove this component entirely. The add-exercise modals no longer
// render it; delete alongside `src/lib/wgerClient.ts` and
// `src/hooks/useExerciseSuggestions.ts` in a follow-up commit.
import type { WgerExercise } from '@/lib/wgerClient';
import type { Muscle } from '@/lib/muscles';
import { useTranslations } from '@/lib/locale-context';
import MuscleBadge from '@/components/MuscleBadge';

interface Props {
  suggestions: WgerExercise[];
  loading: boolean;
  onSelect: (name: string, muscle: Muscle | undefined) => void;
}

export default function ExerciseSuggestionList({ suggestions, loading, onSelect }: Props) {
  const t = useTranslations();
  const showLoading = loading && suggestions.length === 0;
  const showList = suggestions.length > 0;

  if (!showLoading && !showList) return null;

  return (
    <ul
      className="absolute left-0 right-0 top-full mt-1 z-60 bg-base border border-border rounded-xl overflow-y-auto max-h-56 shadow-lg"
      style={{ touchAction: 'pan-y' }}
    >
      {showLoading && (
        <li className="px-4 py-3 text-muted text-sm animate-pulse">
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
                onSelect(ex.name, ex.muscle);
              }}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface active:bg-elevated transition-colors duration-100 cursor-pointer min-h-[48px]"
            >
              <span className="text-foreground text-sm font-medium truncate">{ex.name}</span>
              {ex.muscle && (
                <span className="ml-3 shrink-0">
                  <MuscleBadge muscle={ex.muscle} />
                </span>
              )}
            </button>
          </li>
        ))}
    </ul>
  );
}
