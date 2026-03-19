'use client';

import { useState } from 'react';
import { Check, X, RotateCcw, Plus, Info } from 'lucide-react';
import type { Exercise, LoggedSet } from '@/lib/types';
import { IconButton } from '@/components/ui';
import LoggedSetBadge from '@/components/LoggedSetBadge';
import { useTranslations } from '@/lib/locale-context';
import type { Translations } from '@/lib/i18n';

interface Props {
  exercise: Exercise;
  onComplete: () => void;
  onDismiss: () => void;
  isActive?: boolean;
  onSetActive?: () => void;
  onUndoDismiss?: () => void;
  onLogSet?: (set: Omit<LoggedSet, 'loggedAt'>) => void;
  onRemoveSet?: (index: number) => void;
}

function exerciseDetail(ex: Exercise, t: Translations): string {
  if (ex.type === 'sets-reps')
    return t.exercise_detail_sets_reps
      .replace('{sets}', String(ex.sets ?? 0))
      .replace('{reps}', String(ex.reps ?? 0));
  if (ex.type === 'sets-duration')
    return t.exercise_detail_sets_duration
      .replace('{sets}', String(ex.sets ?? 0))
      .replace('{duration}', String(ex.duration ?? 0));
  const d = ex.duration ?? 0;
  return d >= 60 ? `${Math.round(d / 60)} ${t.min_label}` : `${d}s`;
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
  onSetActive,
  onUndoDismiss,
  onLogSet,
  onRemoveSet,
}: Props) {
  const t = useTranslations();
  const [showSetForm, setShowSetForm] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [repsInput, setRepsInput] = useState('');
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);

  const detail = exerciseDetail(exercise, t);
  const isDismissed = exercise.dismissed === true;
  const isCompleted = exercise.completed === true;
  const isDone = isCompleted || isDismissed;
  const showActiveStyle = isActive && !isDone;
  const canLogSets = exercise.type === 'sets-reps' && !isDone && !!onLogSet;

  const loggedCount = exercise.loggedSets?.length ?? 0;
  const qualifyingSetCount =
    exercise.weightKg != null
      ? (exercise.loggedSets?.filter((s) => s.weight >= exercise.weightKg!).length ?? 0)
      : loggedCount;
  const setsGoalAchieved =
    exercise.type === 'sets-reps' && exercise.sets != null && qualifyingSetCount >= exercise.sets;
  const weightGoalAchieved =
    exercise.weightKg != null &&
    loggedCount > 0 &&
    exercise.loggedSets!.some((s) => s.weight >= exercise.weightKg!);

  const openSetForm = () => {
    setWeightInput(defaultWeight(exercise));
    setRepsInput(exercise.reps != null ? String(exercise.reps) : '');
    setShowSetForm(true);
  };

  const submitSet = () => {
    const w = weightInput.trim() === '' ? 0 : parseFloat(weightInput);
    const r = parseInt(repsInput, 10);
    if (!isNaN(w) && !isNaN(r) && r > 0) {
      onLogSet!({ weight: w, reps: r });
    }
    setShowSetForm(false);
  };

  return (
    <div
      className={`rounded-2xl border flex flex-col transition-all duration-200 ${
        isDismissed
          ? 'bg-base border-surface opacity-40'
          : isCompleted
            ? 'bg-surface border-border opacity-70'
            : showActiveStyle
              ? 'bg-surface border-brand'
              : 'bg-surface border-border'
      }`}
    >
      {/* ── Active exercise ─────────────────────────────────────────────── */}
      {showActiveStyle ? (
        <>
          {/* Info area */}
          <div className="px-4 pt-5 pb-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-lg font-bold leading-tight text-foreground flex-1">
                {exercise.name}
              </p>
              <button
                onClick={onDismiss}
                className="text-xs text-muted font-medium px-2.5 py-1 rounded-lg border border-border/60 active:bg-elevated active:border-border cursor-pointer transition-colors duration-150 flex-shrink-0"
              >
                {t.exercise_skip}
              </button>
            </div>
            <p className="flex items-center gap-1.5 mt-1 text-base font-medium text-brand">
              {detail}
              {setsGoalAchieved && (
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-success/20">
                  <Check className="w-2.5 h-2.5 text-success" strokeWidth={3} />
                </span>
              )}
            </p>
            {exercise.weightKg != null && (
              <p className="flex items-center gap-1.5 text-sm text-foreground font-medium mt-1.5">
                {t.target_weight}: {exercise.weightKg} kg
                {weightGoalAchieved && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-success/20">
                    <Check className="w-2.5 h-2.5 text-success" strokeWidth={3} />
                  </span>
                )}
              </p>
            )}
            {exercise.scalingNote && (
              <div className="mt-2 flex items-start gap-1.5 bg-elevated/40 rounded-xl px-3 py-2 border border-border/50">
                <Info className="w-3.5 h-3.5 text-brand/70 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-secondary leading-snug">{exercise.scalingNote}</p>
              </div>
            )}
          </div>

          {/* Set progress slots — shown for sets-reps exercises */}
          {exercise.type === 'sets-reps' && exercise.sets != null && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-3">
              {Array.from({
                length: Math.max(exercise.sets, exercise.loggedSets?.length ?? 0),
              }).map((_, i) => {
                const logged = exercise.loggedSets?.[i];
                return logged ? (
                  <LoggedSetBadge
                    key={i}
                    set={logged}
                    isPendingDelete={pendingDeleteIndex === i}
                    removeLabel={t.exercise_remove_set}
                    onRemove={() => {
                      if (!onRemoveSet) return;
                      if (pendingDeleteIndex === i) {
                        onRemoveSet(i);
                        setPendingDeleteIndex(null);
                      } else {
                        setPendingDeleteIndex(i);
                      }
                    }}
                    onBlur={() => setPendingDeleteIndex(null)}
                  />
                ) : (
                  <span
                    key={i}
                    className="text-xs rounded-lg px-2.5 py-1 font-medium border border-dashed border-border text-dim"
                  >
                    {t.exercise_set_slot.replace('{n}', String(i + 1))}
                  </span>
                );
              })}
            </div>
          )}

          {/* Action bar — swaps to set-entry form when logging */}
          <div className="px-4 pb-4 pt-3 border-t border-border/50">
            {showSetForm ? (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="kg"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="w-16 text-sm bg-base border border-border rounded-xl px-2 py-2.5 text-foreground text-center focus:outline-none focus:border-brand"
                />
                <span className="text-muted text-xs">×</span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="reps"
                  value={repsInput}
                  onChange={(e) => setRepsInput(e.target.value)}
                  className="w-16 text-sm bg-base border border-border rounded-xl px-2 py-2.5 text-foreground text-center focus:outline-none focus:border-brand"
                />
                <button
                  onClick={() => setShowSetForm(false)}
                  className="flex flex-1 items-center justify-center py-2.5 rounded-xl bg-elevated text-muted text-sm font-medium active:bg-border/40 cursor-pointer transition-colors duration-150"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={submitSet}
                  className="flex flex-1 items-center justify-center py-2.5 rounded-xl bg-brand/15 text-brand text-sm font-semibold active:bg-brand/25 cursor-pointer transition-colors duration-150"
                >
                  {t.save_label}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                {canLogSets && (
                  <button
                    onClick={openSetForm}
                    className="flex flex-1 items-center justify-center gap-1.5 py-2.5 rounded-xl bg-elevated text-secondary text-sm font-medium active:bg-border/40 cursor-pointer transition-colors duration-150"
                  >
                    <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                    {t.exercise_log_set}
                  </button>
                )}
                <button
                  onClick={onComplete}
                  className="flex flex-1 items-center justify-center gap-1.5 py-2.5 rounded-xl bg-success/15 text-success text-sm font-semibold active:bg-success/25 cursor-pointer transition-colors duration-150"
                >
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                  {t.exercise_done}
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* ── Non-active / completed / dismissed / queue ─────────────────── */
        <div
          className={`flex items-center px-4 py-3.5 gap-3 ${onSetActive ? 'cursor-pointer active:bg-elevated/60' : ''}`}
          onClick={!isDone && onSetActive ? onSetActive : undefined}
        >
          {/* Info */}
          <div className="min-w-0 flex-1">
            <p
              className={`text-sm font-semibold leading-tight truncate ${
                isDone ? 'line-through text-muted' : 'text-foreground'
              }`}
            >
              {exercise.name}
            </p>
            <p className={`mt-0.5 text-xs font-medium ${isDone ? 'text-dim' : 'text-brand'}`}>
              {detail}
            </p>
            {exercise.scalingNote && !isDone && (
              <p className="mt-1 text-xs text-muted leading-snug">{exercise.scalingNote}</p>
            )}
            {/* Logged sets inline for completed */}
            {exercise.loggedSets && exercise.loggedSets.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {exercise.loggedSets.map((s, i) => (
                  <LoggedSetBadge key={i} set={s} />
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div
            className="flex items-center gap-1.5 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {isDismissed ? (
              onUndoDismiss && (
                <IconButton
                  onClick={onUndoDismiss}
                  aria-label={t.exercise_restore_aria.replace('{name}', exercise.name)}
                  className="active:bg-brand/20"
                >
                  <RotateCcw className="w-4 h-4 text-secondary" />
                </IconButton>
              )
            ) : (
              <>
                <IconButton
                  onClick={onComplete}
                  aria-label={
                    isCompleted
                      ? t.exercise_unmark_complete_aria.replace('{name}', exercise.name)
                      : t.exercise_mark_complete_aria.replace('{name}', exercise.name)
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
                {!isCompleted && (
                  <IconButton
                    onClick={onDismiss}
                    aria-label={t.exercise_dismiss_aria.replace('{name}', exercise.name)}
                    className="active:bg-danger/20"
                  >
                    <X className="w-4 h-4 text-secondary" />
                  </IconButton>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
