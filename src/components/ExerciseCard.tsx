'use client';

import { useState } from 'react';
import { Check, X, RotateCcw, Plus, Info, Timer } from 'lucide-react';
import type { Exercise, LoggedSet } from '@/lib/types';
import { IconButton } from '@/components/ui';
import LoggedSetBadge from '@/components/LoggedSetBadge';
import ExerciseStopwatchOverlay from '@/components/ExerciseStopwatchOverlay';
import { useTranslations } from '@/lib/locale-context';
import type { Translations } from '@/lib/i18n';
import {
  classifyLoggedSets,
  countsTowardSetsGoal,
  formatClock,
  formatRepsTarget,
} from '@/lib/sessionUtils';

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
  if (ex.type === 'sets-reps') {
    if (ex.repsPerSet && ex.repsPerSet.length > 0) return formatRepsTarget(ex);
    return t.exercise_detail_sets_reps
      .replace('{sets}', String(ex.sets ?? 0))
      .replace('{reps}', String(ex.reps ?? 0));
  }
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
  const [showStopwatch, setShowStopwatch] = useState(false);
  // Elapsed seconds retained while the stopwatch overlay is closed, so reopening
  // resumes instead of restarting.
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [weightInput, setWeightInput] = useState('');
  const [repsInput, setRepsInput] = useState('');
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);

  const detail = exerciseDetail(exercise, t);
  const isDismissed = exercise.dismissed === true;
  const isCompleted = exercise.completed === true;
  const isDone = isCompleted || isDismissed;
  const showActiveStyle = isActive && !isDone;
  const isTimed = exercise.type === 'sets-duration' || exercise.type === 'duration';
  const canLogSets = exercise.type === 'sets-reps' && !isDone && !!onLogSet;
  const canTimeSets = isTimed && !isDone && !!onLogSet;
  const showSetSlots =
    (exercise.type === 'sets-reps' || exercise.type === 'sets-duration') && exercise.sets != null;

  // A stopwatch run that was paused (overlay closed with time banked). Shows the
  // time left next to the target and turns the "Time it" button into "Resume".
  const stopwatchPaused = canTimeSets && !showStopwatch && stopwatchSeconds > 0;
  const stopwatchTargetSec = exercise.duration ?? 0;
  const stopwatchReachedTarget = stopwatchTargetSec > 0 && stopwatchSeconds >= stopwatchTargetSec;
  const stopwatchRemainingSec = Math.max(0, stopwatchTargetSec - stopwatchSeconds);

  const loggedCount = exercise.loggedSets?.length ?? 0;
  // Per-set warmup/partial/working classification drives both badge colours and
  // what counts toward the goal. A set qualifies once it hits the target weight;
  // a "partial" set that fell short on reps still counts (the weight target is
  // the harder constraint), only sub-target "warmup" sets are excluded.
  const setClassifications = classifyLoggedSets(exercise);
  const qualifyingSetCount =
    exercise.weightKg == null
      ? loggedCount
      : setClassifications.filter((c) => countsTowardSetsGoal(c.status)).length;
  const setsGoalAchieved =
    exercise.type === 'sets-reps'
      ? exercise.sets != null && qualifyingSetCount >= exercise.sets
      : exercise.type === 'sets-duration'
        ? exercise.sets != null && loggedCount >= exercise.sets
        : exercise.type === 'duration'
          ? loggedCount >= 1
          : false;
  const weightGoalAchieved =
    exercise.weightKg != null &&
    loggedCount > 0 &&
    exercise.loggedSets!.some((s) => s.weight >= exercise.weightKg!);
  const allTargetsAchieved = setsGoalAchieved && (exercise.weightKg == null || weightGoalAchieved);

  // Live "qualifying sets / target" progress for the sets goal. Uses the same
  // qualifyingSetCount the checkmark is judged on, so the counter, the green
  // set badges, and the tick all agree on what "counts".
  const showSetsProgress =
    (exercise.type === 'sets-reps' || exercise.type === 'sets-duration') && exercise.sets != null;

  // Slot count keeps an empty placeholder open for every set still needed to
  // reach the target. Non-qualifying warmups don't consume a target slot, so a
  // fresh placeholder is added for each one — there are always enough empty
  // slots left to hit the qualifying-set goal.
  const setSlotCount = loggedCount + Math.max(0, (exercise.sets ?? 0) - qualifyingSetCount);

  // Target line: weight target first, then the reps/sets detail, joined by a
  // dot. `mergedDetail` is the plain-text form for the collapsed card.
  const weightLabel = exercise.weightKg != null ? `${exercise.weightKg} kg` : null;
  const mergedDetail = weightLabel ? `${weightLabel} · ${detail}` : detail;

  const goalCheck = (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-success/20">
      <Check className="w-2.5 h-2.5 text-success" strokeWidth={3} />
    </span>
  );

  const openSetForm = () => {
    setWeightInput(defaultWeight(exercise));
    const scheme = exercise.repsPerSet;
    if (scheme && scheme.length > 0) {
      const idx = Math.min(loggedCount, scheme.length - 1);
      setRepsInput(String(scheme[idx]));
    } else {
      setRepsInput(exercise.reps != null ? String(exercise.reps) : '');
    }
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
            <p className="flex flex-wrap items-center gap-1.5 mt-1 text-base font-medium text-brand">
              {weightLabel != null && (
                <span className="inline-flex items-center gap-1.5 text-foreground">
                  {weightLabel}
                  {weightGoalAchieved && goalCheck}
                </span>
              )}
              {weightLabel != null && <span className="text-muted">·</span>}
              {detail}
              {showSetsProgress && (
                <span
                  className={`text-xs font-semibold tabular-nums px-1.5 py-0.5 rounded-md ${
                    setsGoalAchieved ? 'text-success' : 'bg-elevated text-secondary'
                  }`}
                >
                  {qualifyingSetCount}/{exercise.sets}
                </span>
              )}
              {setsGoalAchieved && goalCheck}
              {stopwatchPaused && (
                <span
                  className={`text-xs font-semibold tabular-nums px-1.5 py-0.5 rounded-md ${
                    stopwatchReachedTarget ? 'text-success' : 'bg-elevated text-secondary'
                  }`}
                >
                  {stopwatchReachedTarget
                    ? t.exercise_time_target_reached
                    : stopwatchTargetSec > 0
                      ? t.exercise_time_left.replace('{time}', formatClock(stopwatchRemainingSec))
                      : t.exercise_time_elapsed.replace('{time}', formatClock(stopwatchSeconds))}
                </span>
              )}
            </p>
            {exercise.scalingNote && (
              <div className="mt-2 flex items-start gap-1.5 bg-elevated/40 rounded-xl px-3 py-2 border border-border/50">
                <Info className="w-3.5 h-3.5 text-brand/70 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-secondary leading-snug">{exercise.scalingNote}</p>
              </div>
            )}
          </div>

          {/* Set progress slots — shown for sets-reps and sets-duration exercises */}
          {showSetSlots && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-3">
              {Array.from({
                length: setSlotCount,
              }).map((_, i) => {
                const logged = exercise.loggedSets?.[i];
                return logged ? (
                  <LoggedSetBadge
                    key={i}
                    set={logged}
                    status={setClassifications[i]?.status}
                    repTarget={setClassifications[i]?.repTarget}
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
                    {exercise.repsPerSet?.[i] != null && (
                      <span className="ml-1">· {exercise.repsPerSet[i]}</span>
                    )}
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
                {canTimeSets && (
                  <button
                    onClick={() => setShowStopwatch(true)}
                    className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium active:bg-border/40 cursor-pointer transition-colors duration-150 ${
                      stopwatchPaused
                        ? 'bg-brand/15 text-brand font-semibold'
                        : 'bg-elevated text-secondary'
                    }`}
                  >
                    <Timer className="w-3.5 h-3.5" strokeWidth={2.5} />
                    {stopwatchPaused
                      ? t.exercise_resume_time.replace('{time}', formatClock(stopwatchSeconds))
                      : t.exercise_log_time}
                  </button>
                )}
                <div className={`relative flex-1${allTargetsAchieved ? '' : ''}`}>
                  {allTargetsAchieved && (
                    <span
                      className="absolute inset-0 rounded-xl bg-success motion-safe:animate-ping-sm opacity-40"
                      style={{ animationDelay: '2s', animationDuration: '2s' }}
                    />
                  )}
                  <button
                    onClick={onComplete}
                    className="relative flex w-full items-center justify-center gap-1.5 py-2.5 rounded-xl bg-success/15 text-success text-sm font-semibold active:bg-success/25 cursor-pointer transition-colors duration-150"
                  >
                    <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    {t.exercise_done}
                  </button>
                </div>
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
              {mergedDetail}
            </p>
            {exercise.scalingNote && !isDone && (
              <p className="mt-1 text-xs text-muted leading-snug">{exercise.scalingNote}</p>
            )}
            {/* Logged sets inline for completed */}
            {exercise.loggedSets && exercise.loggedSets.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {exercise.loggedSets.map((s, i) => (
                  <LoggedSetBadge
                    key={i}
                    set={s}
                    status={setClassifications[i]?.status}
                    repTarget={setClassifications[i]?.repTarget}
                  />
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

      {showStopwatch && (
        <ExerciseStopwatchOverlay
          exerciseName={exercise.name}
          targetSeconds={exercise.duration}
          initialSeconds={stopwatchSeconds}
          onCancel={(seconds) => {
            setStopwatchSeconds(seconds);
            setShowStopwatch(false);
          }}
          onSave={(seconds) => {
            onLogSet?.({ weight: 0, reps: 0, seconds });
            setStopwatchSeconds(0);
            setShowStopwatch(false);
          }}
        />
      )}
    </div>
  );
}
