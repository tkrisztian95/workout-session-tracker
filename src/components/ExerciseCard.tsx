'use client';

import { useState } from 'react';
import { Check, X, Play, RotateCcw, Plus } from 'lucide-react';
import type { Exercise, LoggedSet } from '@/lib/types';
import { IconButton } from '@/components/ui';

interface Props {
  exercise: Exercise;
  onComplete: () => void;
  onDismiss: () => void;
  isActive?: boolean;
  targetWeightLabel?: string;
  onSetActive?: () => void;
  onUndoDismiss?: () => void;
  onLogSet?: (set: Omit<LoggedSet, 'loggedAt'>) => void;
}

function exerciseDetail(ex: Exercise): string {
  if (ex.type === 'sets-reps') return `${ex.sets} sets × ${ex.reps} reps`;
  if (ex.type === 'sets-duration') return `${ex.sets} sets · ${ex.duration}s`;
  const d = ex.duration ?? 0;
  return d >= 60 ? `${Math.round(d / 60)} min` : `${d}s`;
}

function defaultWeight(exercise: Exercise): string {
  if (exercise.loggedSets && exercise.loggedSets.length > 0) {
    return String(exercise.loggedSets[exercise.loggedSets.length - 1].weight);
  }
  if (exercise.weightKg != null) return String(exercise.weightKg);
  return '';
}

export default function ExerciseCard({
  exercise,
  onComplete,
  onDismiss,
  isActive = false,
  targetWeightLabel = 'Target',
  onSetActive,
  onUndoDismiss,
  onLogSet,
}: Props) {
  const [showSetForm, setShowSetForm] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [repsInput, setRepsInput] = useState('');

  const detail = exerciseDetail(exercise);
  const isDismissed = exercise.dismissed === true;
  const isCompleted = exercise.completed === true;
  const isDone = isCompleted || isDismissed;
  const showActiveStyle = isActive && !isDone;
  const canLogSets = exercise.type === 'sets-reps' && !isDone && !!onLogSet;

  const openSetForm = () => {
    setWeightInput(defaultWeight(exercise));
    setRepsInput(exercise.reps != null ? String(exercise.reps) : '');
    setShowSetForm(true);
  };

  const submitSet = () => {
    const w = parseFloat(weightInput);
    const r = parseInt(repsInput, 10);
    if (!isNaN(w) && !isNaN(r) && r > 0) {
      onLogSet!({ weight: w, reps: r });
    }
    setShowSetForm(false);
  };

  return (
    <div
      className={`rounded-2xl border flex flex-col px-4 gap-3 transition-all duration-200 ${
        showActiveStyle ? 'py-5' : 'py-4'
      } ${
        isDismissed
          ? 'bg-base border-surface opacity-40'
          : isCompleted
            ? 'bg-surface border-border opacity-70'
            : showActiveStyle
              ? 'bg-surface border-brand'
              : 'bg-surface border-border'
      }`}
    >
      {/* Main row */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={`leading-tight truncate ${
              showActiveStyle ? 'text-lg font-bold' : 'text-base font-semibold'
            } ${isDone ? 'line-through text-muted' : 'text-foreground'}`}
          >
            {exercise.name}
          </p>
          <p
            className={`mt-1 font-medium ${showActiveStyle ? 'text-base' : 'text-sm'} ${
              isDone ? 'text-dim' : 'text-brand'
            }`}
          >
            {detail}
          </p>
          {showActiveStyle && exercise.weightKg != null && (
            <p className="text-sm text-foreground font-medium mt-1.5">
              {targetWeightLabel}: {exercise.weightKg} kg
            </p>
          )}
          {exercise.scalingNote && (
            <p
              className={`mt-1.5 leading-snug ${
                showActiveStyle ? 'text-sm text-secondary' : 'text-xs text-muted'
              }`}
            >
              {exercise.scalingNote}
            </p>
          )}
        </div>

        {isDismissed ? (
          onUndoDismiss && (
            <div className="flex-shrink-0">
              <IconButton
                onClick={onUndoDismiss}
                aria-label={`Restore ${exercise.name}`}
                className="active:bg-brand/20"
              >
                <RotateCcw className="w-4 h-4 text-secondary" />
              </IconButton>
            </div>
          )
        ) : (
          <div className="flex items-center gap-2 flex-shrink-0">
            {onSetActive && (
              <IconButton
                onClick={onSetActive}
                aria-label={`Do ${exercise.name} now`}
                className="active:bg-brand/20"
              >
                <Play className="w-4 h-4 text-secondary" />
              </IconButton>
            )}
            {canLogSets && (
              <IconButton
                onClick={openSetForm}
                aria-label={`Log set for ${exercise.name}`}
                className="active:bg-brand/20"
              >
                <Plus className="w-4 h-4 text-secondary" />
              </IconButton>
            )}
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

      {/* Logged sets list */}
      {exercise.loggedSets && exercise.loggedSets.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/50">
          {exercise.loggedSets.map((s, i) => (
            <span
              key={i}
              className="text-xs bg-elevated rounded-lg px-2 py-1 text-secondary font-medium"
            >
              {s.weight} kg × {s.reps}
            </span>
          ))}
        </div>
      )}

      {/* Inline set-entry form */}
      {showSetForm && (
        <div
          className="flex items-center gap-2 pt-1 border-t border-border/50"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="number"
            inputMode="decimal"
            placeholder="kg"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            className="w-16 text-sm bg-base border border-border rounded-lg px-2 py-1.5 text-foreground text-center focus:outline-none focus:border-brand"
          />
          <span className="text-muted text-xs">×</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="reps"
            value={repsInput}
            onChange={(e) => setRepsInput(e.target.value)}
            className="w-16 text-sm bg-base border border-border rounded-lg px-2 py-1.5 text-foreground text-center focus:outline-none focus:border-brand"
          />
          <button
            onClick={submitSet}
            className="ml-auto text-xs font-semibold text-brand px-3 py-1.5 rounded-lg active:bg-brand/10"
          >
            Save
          </button>
          <button
            onClick={() => setShowSetForm(false)}
            className="text-xs text-muted px-2 py-1.5 rounded-lg active:bg-elevated"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
