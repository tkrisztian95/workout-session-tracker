'use client';

import { Check, Minus, Pencil, X } from 'lucide-react';
import MuscleBadge from '@/components/MuscleBadge';
import { IconButton } from '@/components/ui';
import { formatExerciseDetail } from '@/lib/sessionUtils';
import type { Exercise } from '@/lib/types';

interface SessionExerciseItemProps {
  exercise: Exercise;
  isEditing: boolean;
  dismissed?: boolean;
  onToggleComplete?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
}

export function SessionExerciseItem({
  exercise,
  isEditing,
  dismissed = false,
  onToggleComplete,
  onEdit,
  onRemove,
}: SessionExerciseItemProps) {
  if (dismissed) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-base border border-border px-3 py-3 opacity-50">
        <button
          onClick={isEditing ? onToggleComplete : undefined}
          disabled={!isEditing}
          className={`w-6 h-6 rounded-md border-2 border-border-subtle flex items-center justify-center flex-shrink-0 ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <Minus className="w-3 h-3 text-dim" strokeWidth={2} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-muted font-medium text-sm">{exercise.name}</p>
            {exercise.muscle && <MuscleBadge muscle={exercise.muscle} />}
          </div>
          <p className="text-dim text-xs mt-0.5">{formatExerciseDetail(exercise)}</p>
        </div>
        {isEditing && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <IconButton size="sm" onClick={onEdit} aria-label={`Edit ${exercise.name}`}>
              <Pencil className="w-3.5 h-3.5 text-muted" />
            </IconButton>
            <button
              onClick={onRemove}
              className="w-7 h-7 flex items-center justify-center rounded-full active:bg-elevated"
            >
              <X className="w-4 h-4 text-dim" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl bg-surface border border-border px-3 py-3">
      <button
        onClick={isEditing ? onToggleComplete : undefined}
        disabled={!isEditing}
        className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
          exercise.completed ? 'bg-brand' : 'border-2 border-border-subtle'
        } ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
      >
        {exercise.completed && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={`font-medium text-sm ${exercise.completed ? 'text-foreground' : 'text-secondary'}`}
          >
            {exercise.name}
          </p>
          {exercise.muscle && <MuscleBadge muscle={exercise.muscle} />}
        </div>
        <p className="text-muted text-xs mt-0.5">{formatExerciseDetail(exercise)}</p>
        {exercise.loggedSets && exercise.loggedSets.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {exercise.loggedSets.map((s, i) => (
              <span
                key={i}
                className="text-xs bg-elevated rounded-md px-1.5 py-0.5 text-secondary font-medium"
              >
                {s.weight}kg×{s.reps}
              </span>
            ))}
          </div>
        )}
      </div>
      {isEditing && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <IconButton size="sm" onClick={onEdit} aria-label={`Edit ${exercise.name}`}>
            <Pencil className="w-3.5 h-3.5 text-muted" />
          </IconButton>
          <button
            onClick={onRemove}
            className="w-7 h-7 flex items-center justify-center rounded-full active:bg-elevated"
          >
            <X className="w-4 h-4 text-dim" />
          </button>
        </div>
      )}
    </div>
  );
}
