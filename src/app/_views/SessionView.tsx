'use client';

import { useState } from 'react';
import { Dumbbell, Pause, Play as PlayIcon, Plus } from 'lucide-react';
import ExerciseCard from '@/components/ExerciseCard';
import AddExerciseModal from '@/components/AddExerciseModal';
import SessionTimer from '@/components/SessionTimer';
import SessionProgressBar from '@/components/SessionProgressBar';
import SessionCompleteOverlay from '@/components/SessionCompleteOverlay';
import SessionPausedOverlay from '@/components/SessionPausedOverlay';
import PulsingButton from '@/components/PulsingButton';
import FinishSessionConfirmSheet from '@/components/FinishSessionConfirmSheet';
import DiscardSessionConfirmSheet from '@/components/DiscardSessionConfirmSheet';
import { useLocale, useTranslations } from '@/lib/locale-context';
import type { ActiveSession, Exercise } from '@/lib/types';
import {
  Button,
  CtaBar,
  EmptyState,
  HeadingXL,
  LabelOverline,
  ListLabel,
  Page,
  PageHeader,
} from '@/components/ui';
import { formatDate } from './helpers';

export function SessionView({
  session,
  onUpdate,
  onFinish,
  onDiscard,
}: {
  session: ActiveSession;
  onUpdate: (session: ActiveSession) => void;
  onFinish: (rating?: 1 | 2 | 3 | 4 | 5) => void;
  onDiscard: () => void;
}) {
  const t = useTranslations();
  const { locale } = useLocale();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showCompleteOverlay, setShowCompleteOverlay] = useState(false);

  const handleAdd = (exercise: Omit<Exercise, 'id'>) => {
    const updated: ActiveSession = {
      ...session,
      exercises: [...session.exercises, { ...exercise, id: crypto.randomUUID() }],
    };
    onUpdate(updated);
    setIsModalOpen(false);
  };

  const isPaused = session.pausedAt !== undefined;

  const handlePause = () => {
    const updated: ActiveSession = { ...session, pausedAt: new Date().toISOString() };
    onUpdate(updated);
  };

  const handleResume = () => {
    const pausedMs = session.pausedAt ? Date.now() - new Date(session.pausedAt).getTime() : 0;
    const updated: ActiveSession = {
      ...session,
      pausedAt: undefined,
      totalPausedMs: (session.totalPausedMs ?? 0) + pausedMs,
    };
    onUpdate(updated);
  };

  const handleComplete = (id: string) => {
    const updated: ActiveSession = {
      ...session,
      exercises: session.exercises.map((e) => {
        if (e.id !== id) return e;
        const nowCompleted = !e.completed;
        return {
          ...e,
          completed: nowCompleted,
          completedAt: nowCompleted ? new Date().toISOString() : undefined,
        };
      }),
    };
    onUpdate(updated);
  };

  const handleDismiss = (id: string) => {
    const updated: ActiveSession = {
      ...session,
      exercises: session.exercises.map((e) => (e.id === id ? { ...e, dismissed: true } : e)),
    };
    onUpdate(updated);
  };

  const handleUndoDismiss = (id: string) => {
    const updated: ActiveSession = {
      ...session,
      exercises: session.exercises.map((e) => (e.id === id ? { ...e, dismissed: false } : e)),
    };
    onUpdate(updated);
  };

  const handleLogSet = (id: string, weight: number, reps: number) => {
    const updated: ActiveSession = {
      ...session,
      exercises: session.exercises.map((e) =>
        e.id === id
          ? {
              ...e,
              loggedSets: [
                ...(e.loggedSets ?? []),
                { weight, reps, loggedAt: new Date().toISOString() },
              ],
            }
          : e,
      ),
    };
    onUpdate(updated);
  };

  const handleRemoveSet = (id: string, index: number) => {
    const updated: ActiveSession = {
      ...session,
      exercises: session.exercises.map((e) =>
        e.id === id ? { ...e, loggedSets: (e.loggedSets ?? []).filter((_, i) => i !== index) } : e,
      ),
    };
    onUpdate(updated);
  };

  const handleSetActive = (id: string) => {
    const exercises = session.exercises;
    const targetIndex = exercises.findIndex((e) => e.id === id);
    const activeIndex = exercises.findIndex((e) => !e.completed && !e.dismissed);
    if (targetIndex === -1 || activeIndex === -1 || targetIndex === activeIndex) return;
    const reordered = [...exercises];
    const [target] = reordered.splice(targetIndex, 1);
    const insertAt = targetIndex < activeIndex ? activeIndex - 1 : activeIndex;
    reordered.splice(insertAt, 0, target);
    onUpdate({ ...session, exercises: reordered });
  };

  const remaining = session.exercises.filter((e) => !e.completed && !e.dismissed);
  const completed = session.exercises.filter((e) => e.completed && !e.dismissed);
  const dismissed = session.exercises.filter((e) => e.dismissed);
  const totalCount = session.exercises.length;
  const activeExercise = remaining[0] ?? null;
  const allDone = totalCount > 0 && remaining.length === 0;
  const queue = remaining.slice(1);

  return (
    <Page>
      <PageHeader className="pb-1">
        <LabelOverline className="mb-1">{formatDate(locale)}</LabelOverline>
        <HeadingXL className="mt-1">{session.planDayName ?? t.free_session}</HeadingXL>
        {session.planName && (
          <p className="text-brand text-sm mt-1 font-medium">{session.planName}</p>
        )}
      </PageHeader>

      <div className="flex-1 relative overflow-hidden flex flex-col">
        <div className="px-6 pb-3 space-y-3 flex-shrink-0">
          <div>
            <SessionProgressBar
              completed={completed.length}
              remaining={remaining.length}
              dismissed={dismissed.length}
              rightSlot={
                <div className="flex items-center gap-2">
                  <SessionTimer
                    startedAt={session.startedAt}
                    totalPausedMs={session.totalPausedMs ?? 0}
                    pausedAt={session.pausedAt}
                  />
                  <button
                    onClick={isPaused ? handleResume : handlePause}
                    aria-label={isPaused ? 'Resume session' : 'Pause session'}
                    className="w-7 h-7 rounded-full flex items-center justify-center bg-surface border border-border active:bg-elevated"
                  >
                    {isPaused ? (
                      <PlayIcon className="w-3.5 h-3.5 text-brand" />
                    ) : (
                      <Pause className="w-3.5 h-3.5 text-secondary" />
                    )}
                  </button>
                </div>
              }
            />
          </div>
          {activeExercise && (
            <ExerciseCard
              key={activeExercise.id}
              exercise={activeExercise}
              isActive
              onComplete={() => handleComplete(activeExercise.id)}
              onDismiss={() => handleDismiss(activeExercise.id)}
              onLogSet={(s) => handleLogSet(activeExercise.id, s.weight, s.reps)}
              onRemoveSet={(i) => handleRemoveSet(activeExercise.id, i)}
            />
          )}
        </div>

        <div className="flex-1 px-6 pb-28 space-y-3 overflow-y-auto">
          {totalCount === 0 ? (
            <>
              <EmptyState
                icon={<Dumbbell className="w-9 h-9 text-border" />}
                title={t.no_exercises_title}
                subtitle={t.no_exercises_subtitle}
              />
              <Button
                variant="secondary"
                onClick={() => setIsModalOpen(true)}
                className="w-full gap-2"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                {t.add_exercise_button}
              </Button>
            </>
          ) : (
            <>
              {queue.length > 0 && (
                <>
                  <ListLabel>{t.upcoming_section}</ListLabel>
                  {queue.map((exercise) => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      onComplete={() => handleComplete(exercise.id)}
                      onDismiss={() => handleDismiss(exercise.id)}
                      onSetActive={() => handleSetActive(exercise.id)}
                      onLogSet={(s) => handleLogSet(exercise.id, s.weight, s.reps)}
                    />
                  ))}
                </>
              )}

              <Button
                variant="secondary"
                onClick={() => setIsModalOpen(true)}
                className="w-full gap-2"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                {t.add_exercise_button}
              </Button>

              {completed.length > 0 && (
                <>
                  <ListLabel>{t.completed_section}</ListLabel>
                  {completed.map((exercise) => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      onComplete={() => handleComplete(exercise.id)}
                      onDismiss={() => handleDismiss(exercise.id)}
                    />
                  ))}
                </>
              )}

              {dismissed.length > 0 && (
                <>
                  <ListLabel className="text-dim">{t.skipped_section}</ListLabel>
                  {dismissed.map((exercise) => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      onComplete={() => handleComplete(exercise.id)}
                      onDismiss={() => handleDismiss(exercise.id)}
                      onUndoDismiss={() => handleUndoDismiss(exercise.id)}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>

        {isPaused && <SessionPausedOverlay onResume={handleResume} />}
      </div>

      <CtaBar slim className="space-y-2">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setShowDiscardConfirm(true)}
            className="flex-1 py-3.5 text-sm"
          >
            {t.discard}
          </Button>
          {allDone ? (
            <PulsingButton onClick={() => setShowCompleteOverlay(true)} className="flex-[2]">
              {t.finish_session}
            </PulsingButton>
          ) : (
            <Button
              onClick={() => {
                if (remaining.length > 0) {
                  setShowFinishConfirm(true);
                } else {
                  setShowCompleteOverlay(true);
                }
              }}
              className="flex-[2]"
            >
              {t.finish_session}
            </Button>
          )}
        </div>
      </CtaBar>

      <AddExerciseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAdd}
      />

      {showCompleteOverlay && (
        <SessionCompleteOverlay
          exercises={session.exercises}
          startedAt={session.startedAt}
          totalPausedMs={session.totalPausedMs ?? 0}
          onDismiss={(rating) => {
            setShowCompleteOverlay(false);
            onFinish(rating);
          }}
        />
      )}

      {showFinishConfirm && (
        <FinishSessionConfirmSheet
          remainingCount={remaining.length}
          onKeepGoing={() => setShowFinishConfirm(false)}
          onFinish={() => {
            setShowFinishConfirm(false);
            setShowCompleteOverlay(true);
          }}
        />
      )}

      {showDiscardConfirm && (
        <DiscardSessionConfirmSheet
          onKeepGoing={() => setShowDiscardConfirm(false)}
          onDiscard={onDiscard}
        />
      )}
    </Page>
  );
}
