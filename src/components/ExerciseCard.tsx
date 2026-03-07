'use client';

import { Check, X } from 'lucide-react';
import type { Exercise } from '@/lib/types';
import { IconButton } from '@/components/ui';

interface Props {
  exercise: Exercise;
  onComplete: () => void;
  onDismiss: () => void;
}

function exerciseDetail(ex: Exercise): string {
  if (ex.type === 'sets-reps') return `${ex.sets} sets × ${ex.reps} reps`;
  if (ex.type === 'sets-duration') return `${ex.sets} sets · ${ex.duration}s`;
  const d = ex.duration ?? 0;
  return d >= 60 ? `${Math.round(d / 60)} min` : `${d}s`;
}

export default function ExerciseCard({ exercise, onComplete, onDismiss }: Props) {
  const detail = exerciseDetail(exercise);
  const isDismissed = exercise.dismissed === true;
  const isCompleted = exercise.completed === true;
  const isDone = isCompleted || isDismissed;

  return (
    <div
      className={`rounded-2xl border flex items-center justify-between px-4 py-4 gap-3 transition-all duration-200 ${
        isDismissed
          ? 'bg-base border-surface opacity-40'
          : isCompleted
            ? 'bg-surface border-border opacity-70'
            : 'bg-surface border-border'
      }`}
    >
      <div className="min-w-0 flex-1">
        <p
          className={`font-semibold text-base leading-tight truncate ${
            isDone ? 'line-through text-muted' : 'text-foreground'
          }`}
        >
          {exercise.name}
        </p>
        <p className={`text-sm mt-1 font-medium ${isDone ? 'text-dim' : 'text-brand'}`}>{detail}</p>
        {exercise.scalingNote && (
          <p className="text-muted text-xs mt-1.5 leading-snug">{exercise.scalingNote}</p>
        )}
      </div>

      {!isDismissed && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <IconButton
            onClick={onComplete}
            aria-label={
              isCompleted
                ? `Unmark ${exercise.name} as complete`
                : `Mark ${exercise.name} as complete`
            }
            className={
              isCompleted
                ? 'bg-success/20 border border-success/50 active:bg-success/40'
                : 'active:bg-success/10'
            }
          >
            <Check
              className={`w-4 h-4 ${isCompleted ? 'text-success' : 'text-secondary'}`}
              strokeWidth={isCompleted ? 3 : 2}
            />
          </IconButton>

          <IconButton
            onClick={onDismiss}
            aria-label={`Dismiss ${exercise.name}`}
            className="active:bg-danger/20"
          >
            <X className="w-4 h-4 text-secondary" />
          </IconButton>
        </div>
      )}
    </div>
  );
}
