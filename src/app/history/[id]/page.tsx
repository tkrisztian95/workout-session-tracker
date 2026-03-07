'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { Check, ChevronLeft, Minus, X, Plus } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { getSessions, getPlans, updateSession } from '@/lib/storage';
import type { WorkoutSession, WorkoutPlan } from '@/lib/types';
import { useTranslations } from '@/lib/locale-context';
import CategoryBadge from '@/components/CategoryBadge';
import SessionDateLabel from '@/components/SessionDateLabel';
import { HeadingXL, ListLabel, Page, PageHeader } from '@/components/ui';

function durationMinutes(startedAt: string, completedAt: string): number {
  return Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 60000);
}

function exerciseDetail(exercise: WorkoutSession['exercises'][number]): string {
  if (exercise.type === 'sets-reps') return `${exercise.sets ?? '?'}×${exercise.reps ?? '?'} reps`;
  if (exercise.type === 'sets-duration')
    return `${exercise.sets ?? '?'}×${exercise.duration ?? '?'}s`;
  return `${exercise.duration ?? '?'}s`;
}

function parseNum(value: string): number | undefined {
  const n = Number(value);
  return isNaN(n) || value === '' ? undefined : n;
}

export default function SessionDetailPage() {
  const t = useTranslations();
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
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<WorkoutSession['exercises'][number]['type']>('sets-reps');

  if (!session) {
    notFound();
  }

  const plan = session.planId ? planMap[session.planId] : undefined;
  const planDay =
    plan && session.planDayId ? plan.days.find((d) => d.id === session.planDayId) : undefined;
  const planName = plan?.name;
  const dayName = planDay?.name;
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

  function addDraftExercise() {
    if (!draft || !newName.trim()) return;
    const exercise: WorkoutSession['exercises'][number] = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      type: newType,
      completed: false,
      dismissed: false,
    };
    setDraft({ ...draft, exercises: [...draft.exercises, exercise] });
    setNewName('');
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
        <HeadingXL className="mt-1">{dayName ?? planName ?? t.free_session}</HeadingXL>
        {planName && <p className="text-brand text-sm mt-1 font-medium">{planName}</p>}
        <p className="text-muted text-sm mt-2">
          {displaySession.exercises.length}{' '}
          {displaySession.exercises.length !== 1 ? t.exercise_plural : t.exercise_singular} ·{' '}
          {isEditing && draft ? (
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
            />
          ) : (
            mins
          )}{' '}
          {t.min_label}
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
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-1">
                      {(exercise.type === 'sets-reps' || exercise.type === 'sets-duration') && (
                        <label className="flex items-center gap-1 text-xs text-muted">
                          {t.exercise_sets_label}
                          <input
                            type="number"
                            min={0}
                            className="w-14 rounded-md border border-border bg-base px-1.5 py-0.5 text-xs text-foreground text-center"
                            value={exercise.sets ?? ''}
                            onChange={(e) =>
                              updateDraftExercise(exercise.id, { sets: parseNum(e.target.value) })
                            }
                          />
                        </label>
                      )}
                      {exercise.type === 'sets-reps' && (
                        <label className="flex items-center gap-1 text-xs text-muted">
                          {t.exercise_reps_label}
                          <input
                            type="number"
                            min={0}
                            className="w-14 rounded-md border border-border bg-base px-1.5 py-0.5 text-xs text-foreground text-center"
                            value={exercise.reps ?? ''}
                            onChange={(e) =>
                              updateDraftExercise(exercise.id, { reps: parseNum(e.target.value) })
                            }
                          />
                        </label>
                      )}
                      {(exercise.type === 'sets-duration' || exercise.type === 'duration') && (
                        <label className="flex items-center gap-1 text-xs text-muted">
                          {t.exercise_duration_label}
                          <input
                            type="number"
                            min={0}
                            className="w-14 rounded-md border border-border bg-base px-1.5 py-0.5 text-xs text-foreground text-center"
                            value={exercise.duration ?? ''}
                            onChange={(e) =>
                              updateDraftExercise(exercise.id, {
                                duration: parseNum(e.target.value),
                              })
                            }
                          />
                        </label>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted text-xs mt-0.5">{exerciseDetail(exercise)}</p>
                  )}
                </div>
                {isEditing && (
                  <button
                    onClick={() => removeDraftExercise(exercise.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-full active:bg-elevated flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-dim" />
                  </button>
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
                      <p className="text-dim text-xs mt-0.5">{exerciseDetail(exercise)}</p>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => removeDraftExercise(exercise.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-full active:bg-elevated flex-shrink-0"
                      >
                        <X className="w-4 h-4 text-dim" />
                      </button>
                    )}
                  </div>
                ))}
              </>
            )}
          </>
        )}
        {isEditing && (
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder={t.exercise_name_placeholder}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addDraftExercise()}
              className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-dim"
            />
            <select
              value={newType}
              onChange={(e) =>
                setNewType(e.target.value as WorkoutSession['exercises'][number]['type'])
              }
              className="rounded-xl border border-border bg-surface px-2 py-2 text-sm text-foreground"
            >
              <option value="sets-reps">{t.exercise_type_sets_reps}</option>
              <option value="sets-duration">{t.exercise_type_sets_duration}</option>
              <option value="duration">{t.exercise_type_duration}</option>
            </select>
            <button
              onClick={addDraftExercise}
              disabled={!newName.trim()}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand disabled:opacity-40"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>
        )}
      </div>

      <BottomNav active="history" />
    </Page>
  );
}
