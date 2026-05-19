'use client';

import { useState, type Ref } from 'react';
import { Pencil, Sparkles, Trash2, MoreVertical, GripVertical } from 'lucide-react';
import { formatExerciseDetail } from '@/lib/sessionUtils';
import MuscleBadge from '@/components/MuscleBadge';
import { IconButton } from '@/components/ui';
import { useLocale } from '@/lib/locale-context';
import type { Muscle } from '@/lib/muscles';

interface ExerciseLike {
  name: string;
  type: 'sets-reps' | 'sets-duration' | 'duration';
  sets?: number;
  reps?: number;
  duration?: number;
  weightKg?: number;
  scalingNote?: string;
  muscle?: Muscle;
}

interface Props {
  ex: ExerciseLike;
  onRemove?: () => void;
  onEdit?: () => void;
  onAiSwap?: () => void;
  className?: string;
  ref?: Ref<HTMLDivElement>;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
}

export default function PlanExerciseRow({
  ex,
  onRemove,
  onEdit,
  onAiSwap,
  className = 'bg-base',
  ref,
  dragHandleProps,
  isDragging = false,
}: Props) {
  const { t } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const hasActions = Boolean(onEdit || onAiSwap || onRemove);

  return (
    <div
      ref={ref}
      className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 transition-shadow ${className} ${
        isDragging
          ? 'border-brand shadow-lg scale-[1.02] relative z-10 opacity-95'
          : 'border-border'
      }`}
    >
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          role="button"
          tabIndex={0}
          className="flex-shrink-0 -ml-1 flex items-center text-muted hover:text-secondary touch-none cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-brand rounded"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-foreground text-sm font-medium truncate">{ex.name}</p>
          {ex.muscle && <MuscleBadge muscle={ex.muscle} />}
        </div>
        <p className="text-brand text-xs mt-0.5">{formatExerciseDetail(ex)}</p>
        {ex.scalingNote && <p className="text-muted text-xs mt-0.5 truncate">{ex.scalingNote}</p>}
      </div>
      {hasActions && (
        <div className="relative flex-shrink-0">
          <IconButton
            size="sm"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={`${ex.name} actions`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="active:scale-90"
          >
            <MoreVertical className="w-4 h-4 text-muted" />
          </IconButton>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div
                role="menu"
                className="absolute right-0 top-full mt-1 z-20 bg-elevated border border-border rounded-2xl shadow-lg overflow-hidden min-w-[180px]"
              >
                {onEdit && (
                  <button
                    role="menuitem"
                    className="flex items-center gap-3 w-full px-4 py-3.5 text-sm text-foreground active:bg-surface transition-colors cursor-pointer"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit();
                    }}
                  >
                    <Pencil className="w-4 h-4 text-muted flex-shrink-0" />
                    {t.exercise_action_edit}
                  </button>
                )}
                {onAiSwap && (
                  <>
                    {onEdit && <div className="h-px bg-border/50 mx-3" />}
                    <button
                      role="menuitem"
                      className="flex items-center gap-3 w-full px-4 py-3.5 text-sm text-foreground active:bg-surface transition-colors cursor-pointer"
                      onClick={() => {
                        setMenuOpen(false);
                        onAiSwap();
                      }}
                    >
                      <Sparkles className="w-4 h-4 text-brand flex-shrink-0" />
                      {t.exercise_action_ai_swap}
                    </button>
                  </>
                )}
                {onRemove && (
                  <>
                    {(onEdit || onAiSwap) && <div className="h-px bg-border/50 mx-3" />}
                    <button
                      role="menuitem"
                      className="flex items-center gap-3 w-full px-4 py-3.5 text-sm text-danger active:bg-surface transition-colors cursor-pointer"
                      onClick={() => {
                        setMenuOpen(false);
                        onRemove();
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-danger flex-shrink-0" />
                      {t.exercise_action_remove}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
