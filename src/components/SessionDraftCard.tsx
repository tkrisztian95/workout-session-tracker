'use client';

import { Plus, Trash2, X } from 'lucide-react';
import type { WorkoutSession, Exercise } from '@/lib/types';
import { useTranslations } from '@/lib/locale-context';

interface SessionDraftCardProps {
  session: WorkoutSession;
  index: number;
  onUpdateDate: (date: string) => void;
  onUpdateDuration: (mins: number) => void;
  onUpdateExercise: (exIdx: number, patch: Partial<Exercise>) => void;
  onRemoveExercise: (exIdx: number) => void;
  onAddExercise: () => void;
  onRemoveSession: () => void;
}

const INPUT_CLASS =
  'rounded-md border border-border bg-base px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand/40 w-full';

export default function SessionDraftCard({
  session,
  index,
  onUpdateDate,
  onUpdateDuration,
  onUpdateExercise,
  onRemoveExercise,
  onAddExercise,
  onRemoveSession,
}: SessionDraftCardProps) {
  const t = useTranslations();

  const durationMins = Math.round(
    (new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 60000,
  );
  const dateValue = session.startedAt.slice(0, 10);

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      {/* ── Card header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 bg-elevated border-b border-border">
        <p className="text-sm font-semibold text-foreground">
          {t.new_history_session_title} {index + 1}
        </p>
        <button
          onClick={onRemoveSession}
          aria-label={t.ai_import_remove_session}
          className="w-8 h-8 flex items-center justify-center rounded-full active:bg-border transition-colors cursor-pointer text-danger"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* ── Date + Duration ──────────────────────────────────────────────────── */}
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="text-xs text-secondary mb-1">{t.new_history_session_date_label}</p>
            <input
              type="date"
              value={dateValue}
              onChange={(e) => onUpdateDate(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div className="w-28">
            <p className="text-xs text-secondary mb-1">{t.new_history_session_duration_label}</p>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={durationMins}
                onChange={(e) => onUpdateDuration(Number(e.target.value) || 1)}
                className={INPUT_CLASS}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-secondary pointer-events-none">
                min
              </span>
            </div>
          </div>
        </div>

        {/* ── Exercise rows ────────────────────────────────────────────────────── */}
        {session.exercises.length > 0 && (
          <div className="space-y-2">
            {session.exercises.map((exercise, exIdx) => (
              <ExerciseRow
                key={exercise.id}
                exercise={exercise}
                onUpdate={(patch) => onUpdateExercise(exIdx, patch)}
                onRemove={() => onRemoveExercise(exIdx)}
              />
            ))}
          </div>
        )}

        {/* ── Add exercise ─────────────────────────────────────────────────────── */}
        <button
          onClick={onAddExercise}
          className="flex items-center gap-1.5 text-brand text-sm font-semibold cursor-pointer active:opacity-70 transition-opacity duration-150 pt-1"
        >
          <Plus className="w-4 h-4" />
          {t.ai_import_add_exercise}
        </button>
      </div>
    </div>
  );
}

// ── Exercise row sub-component ────────────────────────────────────────────────

function ExerciseRow({
  exercise,
  onUpdate,
  onRemove,
}: {
  exercise: Exercise;
  onUpdate: (patch: Partial<Exercise>) => void;
  onRemove: () => void;
}) {
  const t = useTranslations();

  return (
    <div className="rounded-xl border border-border bg-base px-3 py-2.5 space-y-2">
      {/* Name + type + remove */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={exercise.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Exercise name"
          className="flex-1 rounded-md border border-border bg-elevated px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand/40"
        />
        <select
          value={exercise.type}
          onChange={(e) => onUpdate({ type: e.target.value as Exercise['type'] })}
          className="rounded-md border border-border bg-elevated px-2 py-1.5 text-xs text-secondary focus:outline-none focus:ring-1 focus:ring-brand/40 cursor-pointer"
        >
          <option value="sets-reps">sets×reps</option>
          <option value="sets-duration">sets×dur</option>
          <option value="duration">duration</option>
        </select>
        <button
          onClick={onRemove}
          aria-label={t.ai_import_remove_exercise}
          className="w-7 h-7 flex items-center justify-center rounded-full active:bg-elevated transition-colors cursor-pointer text-dim flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Numeric fields */}
      <div className="flex gap-2">
        {(exercise.type === 'sets-reps' || exercise.type === 'sets-duration') && (
          <NumField label="Sets" value={exercise.sets} onChange={(v) => onUpdate({ sets: v })} />
        )}
        {exercise.type === 'sets-reps' && (
          <NumField label="Reps" value={exercise.reps} onChange={(v) => onUpdate({ reps: v })} />
        )}
        {(exercise.type === 'sets-duration' || exercise.type === 'duration') && (
          <NumField
            label="Dur (s)"
            value={exercise.duration}
            onChange={(v) => onUpdate({ duration: v })}
          />
        )}
        {exercise.type !== 'duration' && (
          <NumField
            label="kg"
            value={exercise.weightKg}
            onChange={(v) => onUpdate({ weightKg: v })}
          />
        )}
      </div>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <div className="flex-1 min-w-0">
      <p className="text-xs text-secondary mb-1">{label}</p>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={value ?? ''}
        onChange={(e) => {
          const v = e.target.value === '' ? undefined : Number(e.target.value);
          onChange(v);
        }}
        className="w-full rounded-md border border-border bg-elevated px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand/40"
      />
    </div>
  );
}
