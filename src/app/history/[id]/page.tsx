'use client';

import { useState } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import Link from 'next/link';
import { Check, ChevronLeft, Clock, Minus, X, Plus, Trash2, Pencil } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { getSessions, getPlans, updateSession, deleteSession } from '@/lib/storage';
import type { Exercise, WorkoutSession, WorkoutPlan } from '@/lib/types';
import { useLocale, useTranslations } from '@/lib/locale-context';
import CategoryBadge from '@/components/CategoryBadge';
import SessionDateLabel from '@/components/SessionDateLabel';
import { Button, HeadingXL, IconButton, ListLabel, Page, PageHeader } from '@/components/ui';
import AddExerciseModal from '@/components/AddExerciseModal';
import { formatExerciseDetail } from '@/lib/sessionUtils';

function durationMinutes(startedAt: string, completedAt: string): number {
  return Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 60000);
}

function parseNum(value: string): number | undefined {
  const n = Number(value);
  return isNaN(n) || value === '' ? undefined : n;
}

export default function SessionDetailPage() {
  const t = useTranslations();
  const { locale } = useLocale();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [session, setSession] = useState<WorkoutSession | null>(() => {
    const sessions = getSessions();
    return sessions.find((s) => s.id === id) ?? null;
  });

  const [planMap] = useState<Record<string, WorkoutPlan>>(() => {
    const plans = getPlans();
    return Object.fromEntries(plans.map((p) => [p.id, p]));
  });

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<WorkoutSession | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  if (!session) {
    notFound();
  }

  const plan = session.planId ? planMap[session.planId] : undefined;
  const planDay =
    plan && session.planDayId ? plan.days.find((d) => d.id === session.planDayId) : undefined;
  const planName = plan?.name;
  const dayName = planDay?.name;

  function handleDelete() {
    deleteSession(session!.id);
    router.push('/history');
  }

  function handleEdit() {
    setDraft(structuredClone(session));
    setIsEditing(true);
  }

  function handleCancel() {
    setDraft(null);
    setIsEditing(false);
  }

  function handleSave() {
    if (!draft) return;
    updateSession(draft);
    setSession(draft);
    setDraft(null);
    setIsEditing(false);
  }

  function removeDraftExercise(exerciseId: string) {
    if (!draft) return;
    setDraft({ ...draft, exercises: draft.exercises.filter((ex) => ex.id !== exerciseId) });
  }

  function handleAddExercise(ex: Omit<Exercise, 'id'>) {
    if (!draft) return;
    setDraft({
      ...draft,
      exercises: [...draft.exercises, { ...ex, id: crypto.randomUUID(), completed: false }],
    });
    setIsAddModalOpen(false);
  }

  function handleEditExercise(updated: Omit<Exercise, 'id'>) {
    if (!draft || !editingExercise) return;
    const id = editingExercise.id;
    setDraft({
      ...draft,
      exercises: draft.exercises.map((ex) => (ex.id === id ? { ...ex, ...updated, id } : ex)),
    });
    setEditingExercise(null);
  }

  function updateDraftExercise(
    exerciseId: string,
    patch: Partial<WorkoutSession['exercises'][number]>,
  ) {
    if (!draft) return;
    setDraft({
      ...draft,
      exercises: draft.exercises.map((ex) => (ex.id === exerciseId ? { ...ex, ...patch } : ex)),
    });
  }

  const displaySession = isEditing && draft ? draft : session;
  const mins = durationMinutes(displaySession.startedAt, displaySession.completedAt);
  const displayCompleted = displaySession.exercises.filter((e) => e.completed && !e.dismissed);
  const displaySkipped = displaySession.exercises.filter((e) => e.dismissed);
  const displayRemaining = displaySession.exercises.filter((e) => !e.completed && !e.dismissed);

  return (
    <Page className="pb-20">
      <PageHeader>
        <div className="flex items-center justify-between">
          <Link
            href="/history"
            className="flex items-center gap-2 w-fit mb-2"
            aria-label="Back to History"
          >
            <span className="w-9 h-9 rounded-full flex items-center justify-center bg-surface active:bg-elevated">
              <ChevronLeft className="w-5 h-5 text-secondary" />
            </span>
            <span className="text-sm font-medium text-secondary">{t.history_title}</span>
          </Link>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="text-sm font-medium text-brand px-3 py-1.5 rounded-lg active:bg-surface"
            >
              {t.edit_label}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="text-sm font-medium text-secondary px-3 py-1.5 rounded-lg active:bg-surface"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSave}
                className="text-sm font-medium text-brand px-3 py-1.5 rounded-lg active:bg-surface"
              >
                {t.save_label}
              </button>
            </div>
          )}
        </div>
        <SessionDateLabel iso={session.completedAt} format="long" className="mt-3" />
        <div className="flex items-center gap-2 mt-1">
          <HeadingXL>{dayName ?? planName ?? t.free_session}</HeadingXL>
          {isEditing && (
            <IconButton
              onClick={() => setShowDeleteConfirm(true)}
              aria-label="Delete session"
              className="flex-shrink-0"
            >
              <Trash2 className="w-4 h-4 text-muted" />
            </IconButton>
          )}
        </div>
        {planName && <p className="text-brand text-sm mt-1 font-medium">{planName}</p>}
        <p className="text-muted text-sm mt-2">
          {displaySession.exercises.length}{' '}
          {displaySession.exercises.length !== 1 ? t.exercise_plural : t.exercise_singular}
        </p>
        <p className="text-muted text-sm mt-1 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          {t.session_started_at}{' '}
          {new Date(displaySession.startedAt).toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit',
          })}
          {' · '}
          {isEditing && draft ? (
            <>
              <input
                type="number"
                min={1}
                value={mins}
                onChange={(e) => {
                  const n = parseNum(e.target.value);
                  if (n == null || n < 1) return;
                  setDraft({
                    ...draft,
                    completedAt: new Date(
                      new Date(draft.startedAt).getTime() + n * 60000,
                    ).toISOString(),
                  });
                }}
                className="w-14 rounded-md border border-border bg-base px-1.5 py-0.5 text-sm text-foreground text-center"
              />{' '}
              {t.min_label}
            </>
          ) : (
            <>
              {mins} {t.min_label}
            </>
          )}
        </p>
      </PageHeader>

      <div className="flex-1 px-6 pb-6 space-y-3 overflow-y-auto">
        {displaySession.exercises.length === 0 ? (
          <p className="text-muted text-sm">{t.no_exercises_recorded}</p>
        ) : (
          <>
            {[...displayCompleted, ...displayRemaining].map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center gap-3 rounded-xl bg-surface border border-border px-3 py-3"
              >
                <button
                  onClick={
                    isEditing
                      ? () =>
                          updateDraftExercise(exercise.id, {
                            completed: !exercise.completed,
                            dismissed: false,
                          })
                      : undefined
                  }
                  disabled={!isEditing}
                  className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                    exercise.completed ? 'bg-brand' : 'border-2 border-border-subtle'
                  } ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {exercise.completed && (
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={`font-medium text-sm ${exercise.completed ? 'text-foreground' : 'text-secondary'}`}
                    >
                      {exercise.name}
                    </p>
                    {exercise.category && <CategoryBadge category={exercise.category} />}
                  </div>
                  <p className="text-muted text-xs mt-0.5">{formatExerciseDetail(exercise)}</p>
                </div>
                {isEditing && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <IconButton
                      size="sm"
                      onClick={() => setEditingExercise(exercise)}
                      aria-label={`Edit ${exercise.name}`}
                    >
                      <Pencil className="w-3.5 h-3.5 text-muted" />
                    </IconButton>
                    <button
                      onClick={() => removeDraftExercise(exercise.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-full active:bg-elevated"
                    >
                      <X className="w-4 h-4 text-dim" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {displaySkipped.length > 0 && (
              <>
                <ListLabel className="text-dim">{t.skipped_section}</ListLabel>
                {displaySkipped.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex items-center gap-3 rounded-xl bg-base border border-border px-3 py-3 opacity-50"
                  >
                    <button
                      onClick={
                        isEditing
                          ? () =>
                              updateDraftExercise(exercise.id, {
                                dismissed: false,
                                completed: false,
                              })
                          : undefined
                      }
                      disabled={!isEditing}
                      className={`w-6 h-6 rounded-md border-2 border-border-subtle flex items-center justify-center flex-shrink-0 ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <Minus className="w-3 h-3 text-dim" strokeWidth={2} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-muted font-medium text-sm">{exercise.name}</p>
                        {exercise.category && <CategoryBadge category={exercise.category} />}
                      </div>
                      <p className="text-dim text-xs mt-0.5">{formatExerciseDetail(exercise)}</p>
                    </div>
                    {isEditing && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <IconButton
                          size="sm"
                          onClick={() => setEditingExercise(exercise)}
                          aria-label={`Edit ${exercise.name}`}
                        >
                          <Pencil className="w-3.5 h-3.5 text-muted" />
                        </IconButton>
                        <button
                          onClick={() => removeDraftExercise(exercise.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-full active:bg-elevated"
                        >
                          <X className="w-4 h-4 text-dim" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </>
        )}
        {isEditing && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 text-brand text-sm font-semibold cursor-pointer pt-1"
          >
            <Plus className="w-4 h-4" />
            {t.add_exercise_title}
          </button>
        )}
      </div>

      <BottomNav active="history" />

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end max-w-md mx-auto">
          <div className="w-full bg-surface rounded-t-3xl px-6 pt-6 pb-10">
            <HeadingXL as="h3" className="text-2xl mb-2">
              {t.delete_session_title}
            </HeadingXL>
            <p className="text-secondary text-sm mb-6">{t.history_delete_body}</p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3.5"
              >
                {t.cancel}
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete} className="flex-1 py-3.5">
                {t.delete}
              </Button>
            </div>
          </div>
        </div>
      )}

      <AddExerciseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddExercise}
      />
      <AddExerciseModal
        isOpen={editingExercise !== null}
        onClose={() => setEditingExercise(null)}
        onAdd={handleAddExercise}
        onEdit={handleEditExercise}
        initialValues={editingExercise ?? undefined}
      />
    </Page>
  );
}
