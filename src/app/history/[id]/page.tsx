'use client';

import { useState } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { Plus } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { SessionDetailHeader } from '@/components/SessionDetailHeader';
import { SessionExerciseItem } from '@/components/SessionExerciseItem';
import { SessionTimeline } from '@/components/SessionTimeline';
import { SessionPlanComparison } from '@/components/SessionPlanComparison';
import { getSessions, getPlans, updateSession, deleteSession } from '@/lib/storage';
import type { Exercise, WorkoutSession, WorkoutPlan } from '@/lib/types';
import { useTranslations } from '@/lib/locale-context';
import {
  Button,
  HeadingXL,
  ListLabel,
  Page,
  PageHeader,
  Tabs,
  type TabItem,
} from '@/components/ui';
import AddExerciseModal from '@/components/AddExerciseModal';
import HistoryExerciseEditor from '@/components/HistoryExerciseEditor';

type DetailTab = 'exercises' | 'timeline' | 'comparison';

interface ExercisesTabContentProps {
  displaySession: WorkoutSession;
  displayCompleted: Exercise[];
  displayRemaining: Exercise[];
  displaySkipped: Exercise[];
  isEditing: boolean;
  updateDraftExercise: (id: string, patch: Partial<Exercise>) => void;
  removeDraftExercise: (id: string) => void;
  setEditingExercise: (ex: Exercise) => void;
  setIsAddModalOpen: (open: boolean) => void;
}

function ExercisesTabContent({
  displaySession,
  displayCompleted,
  displayRemaining,
  displaySkipped,
  isEditing,
  updateDraftExercise,
  removeDraftExercise,
  setEditingExercise,
  setIsAddModalOpen,
}: ExercisesTabContentProps) {
  const t = useTranslations();
  if (displaySession.exercises.length === 0 && !isEditing) {
    return <p className="text-muted text-sm">{t.no_exercises_recorded}</p>;
  }
  return (
    <div className="space-y-3">
      {[...displayCompleted, ...displayRemaining].map((exercise) => (
        <SessionExerciseItem
          key={exercise.id}
          exercise={exercise}
          isEditing={isEditing}
          onToggleComplete={() =>
            updateDraftExercise(exercise.id, {
              completed: !exercise.completed,
              dismissed: false,
            })
          }
          onEdit={() => setEditingExercise(exercise)}
          onRemove={() => removeDraftExercise(exercise.id)}
        />
      ))}

      {displaySkipped.length > 0 && (
        <>
          <ListLabel className="text-dim">{t.skipped_section}</ListLabel>
          {displaySkipped.map((exercise) => (
            <SessionExerciseItem
              key={exercise.id}
              exercise={exercise}
              isEditing={isEditing}
              dismissed
              onToggleComplete={() =>
                updateDraftExercise(exercise.id, { dismissed: false, completed: false })
              }
              onEdit={() => setEditingExercise(exercise)}
              onRemove={() => removeDraftExercise(exercise.id)}
            />
          ))}
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
  );
}

function durationMinutes(startedAt: string, completedAt: string): number {
  return Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 60000);
}

export default function SessionDetailPage() {
  const t = useTranslations();
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
  const [activeTab, setActiveTab] = useState<DetailTab>('exercises');

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

  function handleDurationChange(mins: number) {
    if (!draft) return;
    setDraft({
      ...draft,
      completedAt: new Date(new Date(draft.startedAt).getTime() + mins * 60000).toISOString(),
    });
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

  function handleExecutionEdit(patch: Partial<Exercise>) {
    if (!draft || !editingExercise) return;
    const exId = editingExercise.id;
    setDraft({
      ...draft,
      exercises: draft.exercises.map((ex) => (ex.id === exId ? { ...ex, ...patch } : ex)),
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
        <SessionDetailHeader
          session={session}
          displaySession={displaySession}
          planName={planName}
          dayName={dayName}
          isEditing={isEditing}
          draft={draft}
          mins={mins}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onSave={handleSave}
          onDeleteRequest={() => setShowDeleteConfirm(true)}
          onDurationChange={handleDurationChange}
        />
      </PageHeader>

      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        {isEditing ? (
          <ExercisesTabContent
            displaySession={displaySession}
            displayCompleted={displayCompleted}
            displayRemaining={displayRemaining}
            displaySkipped={displaySkipped}
            isEditing={isEditing}
            updateDraftExercise={updateDraftExercise}
            removeDraftExercise={removeDraftExercise}
            setEditingExercise={setEditingExercise}
            setIsAddModalOpen={setIsAddModalOpen}
          />
        ) : (
          <Tabs
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as DetailTab)}
            stickyTabList
            tabs={
              [
                {
                  id: 'exercises',
                  label: t.tab_exercises_label,
                  content: (
                    <ExercisesTabContent
                      displaySession={displaySession}
                      displayCompleted={displayCompleted}
                      displayRemaining={displayRemaining}
                      displaySkipped={displaySkipped}
                      isEditing={false}
                      updateDraftExercise={updateDraftExercise}
                      removeDraftExercise={removeDraftExercise}
                      setEditingExercise={setEditingExercise}
                      setIsAddModalOpen={setIsAddModalOpen}
                    />
                  ),
                },
                {
                  id: 'timeline',
                  label: t.tab_timeline_label,
                  content: <SessionTimeline session={displaySession} />,
                },
                {
                  id: 'comparison',
                  label: t.tab_comparison_label,
                  content: (
                    <SessionPlanComparison
                      session={displaySession}
                      planDay={planDay}
                      planName={planName}
                    />
                  ),
                },
              ] satisfies TabItem[]
            }
          />
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

      {editingExercise && (
        <HistoryExerciseEditor
          isOpen={editingExercise !== null}
          exercise={editingExercise}
          onConfirm={handleExecutionEdit}
          onCancel={() => setEditingExercise(null)}
        />
      )}
    </Page>
  );
}
