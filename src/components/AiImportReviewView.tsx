'use client';

import { useState } from 'react';
import { ChevronLeft, Clock, Plus, Trash2 } from 'lucide-react';
import { Button, FieldLabel, ModalSheet } from '@/components/ui';
import { SessionExerciseItem } from '@/components/SessionExerciseItem';
import { HistoryExerciseEditorContent, formatTarget } from '@/components/HistoryExerciseEditor';
import AddExerciseModal from '@/components/AddExerciseModal';
import { useTranslations } from '@/lib/locale-context';
import type { Exercise, WorkoutSession } from '@/lib/types';

interface AiImportReviewViewProps {
  sessions: WorkoutSession[];
  onBack: () => void;
  onConfirm: (sessions: WorkoutSession[]) => void;
}

function durationMins(session: WorkoutSession) {
  return Math.round(
    (new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 60000,
  );
}

export default function AiImportReviewView({
  sessions: initialSessions,
  onBack,
  onConfirm,
}: AiImportReviewViewProps) {
  const t = useTranslations();
  const [drafts, setDrafts] = useState(initialSessions);
  const [editingExercise, setEditingExercise] = useState<{
    sessionIdx: number;
    exercise: Exercise;
  } | null>(null);
  const [addToSession, setAddToSession] = useState<number | null>(null);

  const totalExercises = drafts.reduce((n, s) => n + s.exercises.length, 0);
  const canSave = drafts.length > 0 && !drafts.some((s) => s.exercises.length === 0);
  const saveLabel =
    drafts.length === 1
      ? t.ai_import_save
      : t.ai_import_save_n.replace('{{count}}', String(drafts.length));

  // ── Draft mutation helpers ──────────────────────────────────────────────────

  function updateDate(si: number, date: string) {
    setDrafts((prev) =>
      prev.map((s, i) => {
        if (i !== si) return s;
        const ms = new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime();
        const startedAt = new Date(`${date}T09:00:00`).toISOString();
        return {
          ...s,
          startedAt,
          completedAt: new Date(new Date(startedAt).getTime() + ms).toISOString(),
        };
      }),
    );
  }

  function updateDuration(si: number, mins: number) {
    setDrafts((prev) =>
      prev.map((s, i) => {
        if (i !== si) return s;
        return {
          ...s,
          completedAt: new Date(new Date(s.startedAt).getTime() + mins * 60000).toISOString(),
        };
      }),
    );
  }

  function removeSession(si: number) {
    setDrafts((prev) => prev.filter((_, i) => i !== si));
  }

  function removeExercise(si: number, exId: string) {
    setDrafts((prev) =>
      prev.map((s, i) => {
        if (i !== si) return s;
        return { ...s, exercises: s.exercises.filter((e) => e.id !== exId) };
      }),
    );
  }

  function saveExerciseEdit(patch: Partial<Exercise>) {
    if (!editingExercise) return;
    const { sessionIdx, exercise } = editingExercise;
    setDrafts((prev) =>
      prev.map((s, i) => {
        if (i !== sessionIdx) return s;
        return {
          ...s,
          exercises: s.exercises.map((e) => (e.id === exercise.id ? { ...e, ...patch } : e)),
        };
      }),
    );
    setEditingExercise(null);
  }

  function addExercise(si: number, ex: Omit<Exercise, 'id'>) {
    setDrafts((prev) =>
      prev.map((s, i) => {
        if (i !== si) return s;
        return {
          ...s,
          exercises: [...s.exercises, { ...ex, id: crypto.randomUUID(), completed: true }],
        };
      }),
    );
    setAddToSession(null);
  }

  return (
    <div className="fixed inset-0 bg-base z-[60] flex flex-col max-w-md mx-auto">
      {/* ── Sticky header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 bg-base border-b border-border flex-shrink-0">
        <button
          onClick={onBack}
          aria-label={t.ai_import_discard}
          className="flex items-center gap-1 cursor-pointer text-secondary active:text-foreground transition-colors duration-150 min-w-0"
        >
          <ChevronLeft className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium truncate">{t.ai_import_discard}</span>
        </button>

        <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-bold text-foreground font-condensed whitespace-nowrap pointer-events-none">
          {t.ai_import_review_title}
        </h1>

        <Button
          onClick={() => onConfirm(drafts)}
          disabled={!canSave}
          className="text-sm py-2 px-3 flex-shrink-0"
        >
          {saveLabel}
        </Button>
      </div>

      {/* ── Summary bar ──────────────────────────────────────────────────────── */}
      <div className="px-6 py-2.5 bg-elevated border-b border-border flex-shrink-0">
        <p className="text-sm text-secondary">
          <span className="font-semibold text-foreground">{drafts.length}</span>{' '}
          {drafts.length === 1
            ? t.session_label.toLowerCase()
            : t.session_label.toLowerCase() + 's'}
          {' · '}
          <span className="font-semibold text-foreground">{totalExercises}</span>{' '}
          {totalExercises === 1 ? t.exercise_singular : t.exercise_plural}
        </p>
      </div>

      {/* ── Scrollable body ───────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {drafts.length === 0 ? (
          <p className="text-secondary text-sm text-center py-12">{t.ai_import_discard}</p>
        ) : (
          <div className="divide-y divide-border">
            {drafts.map((session, si) => (
              <SessionSection
                key={session.id}
                session={session}
                index={si}
                onUpdateDate={(d) => updateDate(si, d)}
                onUpdateDuration={(m) => updateDuration(si, m)}
                onRemoveSession={() => removeSession(si)}
                onEditExercise={(ex) => setEditingExercise({ sessionIdx: si, exercise: ex })}
                onRemoveExercise={(exId) => removeExercise(si, exId)}
                onAddExercise={() => setAddToSession(si)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Exercise editor modal ─────────────────────────────────────────────── */}
      {editingExercise && (
        <ReviewExerciseEditor
          exercise={editingExercise.exercise}
          onConfirm={saveExerciseEdit}
          onCancel={() => setEditingExercise(null)}
        />
      )}

      {/* ── Add exercise modal ────────────────────────────────────────────────── */}
      <AddExerciseModal
        isOpen={addToSession !== null}
        onClose={() => setAddToSession(null)}
        onAdd={(ex) => addToSession !== null && addExercise(addToSession, ex)}
      />
    </div>
  );
}

// ── Session section ────────────────────────────────────────────────────────────

function SessionSection({
  session,
  index,
  onUpdateDate,
  onUpdateDuration,
  onRemoveSession,
  onEditExercise,
  onRemoveExercise,
  onAddExercise,
}: {
  session: WorkoutSession;
  index: number;
  onUpdateDate: (date: string) => void;
  onUpdateDuration: (mins: number) => void;
  onRemoveSession: () => void;
  onEditExercise: (ex: Exercise) => void;
  onRemoveExercise: (exId: string) => void;
  onAddExercise: () => void;
}) {
  const t = useTranslations();
  const mins = durationMins(session);
  const dateValue = session.startedAt.slice(0, 10);

  return (
    <div className="px-6 py-5 space-y-4">
      {/* ── Section header ────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <p className="text-xs font-semibold text-secondary uppercase tracking-wide">
            {t.session_label} {index + 1}
          </p>
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={dateValue}
              onChange={(e) => onUpdateDate(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand/40"
            />
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted flex-shrink-0" />
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={mins}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (n >= 1) onUpdateDuration(n);
                }}
                className="w-14 rounded-md border border-border bg-surface px-1.5 py-1 text-sm text-foreground text-center focus:outline-none focus:ring-1 focus:ring-brand/40"
              />
              <span className="text-sm text-muted">{t.min_label}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onRemoveSession}
          aria-label={t.ai_import_remove_session}
          className="w-9 h-9 flex items-center justify-center rounded-full active:bg-elevated transition-colors duration-150 cursor-pointer text-danger flex-shrink-0 mt-4"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* ── Exercise list ─────────────────────────────────────────────── */}
      {session.exercises.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
            {t.new_history_exercises_label}{' '}
            <span className="font-normal">({session.exercises.length})</span>
          </p>
          <div className="space-y-2">
            {session.exercises.map((exercise) => (
              <SessionExerciseItem
                key={exercise.id}
                exercise={exercise}
                isEditing={true}
                onEdit={() => onEditExercise(exercise)}
                onRemove={() => onRemoveExercise(exercise.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Add exercise ──────────────────────────────────────────────── */}
      <button
        onClick={onAddExercise}
        className="flex items-center gap-2 text-brand text-sm font-semibold cursor-pointer active:opacity-70 transition-opacity duration-150"
      >
        <Plus className="w-4 h-4" />
        {t.ai_import_add_exercise}
      </button>
    </div>
  );
}

// ── Review exercise editor (name + sets/reps/duration) ─────────────────────────

function ReviewExerciseEditor({
  exercise,
  onConfirm,
  onCancel,
}: {
  exercise: Exercise;
  onConfirm: (patch: Partial<Exercise>) => void;
  onCancel: () => void;
}) {
  const t = useTranslations();
  const [name, setName] = useState(exercise.name);
  const target = formatTarget(exercise);

  return (
    <ModalSheet
      isOpen={true}
      onClose={onCancel}
      title={name || exercise.name}
      subtitle={target ? `${t.history_exercise_editor_target_label} ${target}` : undefined}
    >
      <div className="flex-1 min-h-0 flex flex-col gap-4">
        <div className="flex-shrink-0">
          <FieldLabel htmlFor="rev-ex-name">{t.ai_import_exercise_name_label}</FieldLabel>
          <input
            id="rev-ex-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-border bg-base px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand/40"
          />
        </div>
        <HistoryExerciseEditorContent
          exercise={exercise}
          onConfirm={(patch) => onConfirm({ ...patch, name })}
          onCancel={onCancel}
        />
      </div>
    </ModalSheet>
  );
}
