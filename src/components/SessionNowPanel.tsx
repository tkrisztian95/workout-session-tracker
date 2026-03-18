'use client';

import { Pause, Play as PlayIcon } from 'lucide-react';
import ExerciseCard from '@/components/ExerciseCard';
import SessionTimer from '@/components/SessionTimer';
import SessionProgressBar from '@/components/SessionProgressBar';
import type { ActiveSession, Exercise, LoggedSet } from '@/lib/types';

interface Props {
  session: ActiveSession;
  activeExercise: Exercise | null;
  isPaused: boolean;
  completed: number;
  remaining: number;
  dismissed: number;
  onPause: () => void;
  onResume: () => void;
  onComplete: (id: string) => void;
  onDismiss: (id: string) => void;
  onLogSet: (id: string, set: Omit<LoggedSet, 'loggedAt'>) => void;
  onRemoveSet: (id: string, index: number) => void;
}

export default function SessionNowPanel({
  session,
  activeExercise,
  isPaused,
  completed,
  remaining,
  dismissed,
  onPause,
  onResume,
  onComplete,
  onDismiss,
  onLogSet,
  onRemoveSet,
}: Props) {
  return (
    <div className="px-6 pt-2 pb-3 space-y-3 flex-shrink-0">
      <div className="flex items-center justify-between">
        <SessionTimer
          startedAt={session.startedAt}
          totalPausedMs={session.totalPausedMs ?? 0}
          pausedAt={session.pausedAt}
        />
        <button
          onClick={isPaused ? onResume : onPause}
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
      <div>
        <SessionProgressBar completed={completed} remaining={remaining} dismissed={dismissed} />
      </div>
      {activeExercise && (
        <ExerciseCard
          key={activeExercise.id}
          exercise={activeExercise}
          isActive
          onComplete={() => onComplete(activeExercise.id)}
          onDismiss={() => onDismiss(activeExercise.id)}
          onLogSet={(s) => onLogSet(activeExercise.id, s)}
          onRemoveSet={(i) => onRemoveSet(activeExercise.id, i)}
        />
      )}
    </div>
  );
}
