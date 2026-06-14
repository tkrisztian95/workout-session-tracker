'use client';

import { useEffect } from 'react';
import { Pause, Play as PlayIcon } from 'lucide-react';
import SessionTimer from '@/components/SessionTimer';
import { useTranslations } from '@/lib/locale-context';
import type { ActiveSession } from '@/lib/types';
import { appendAutoLoggedSets } from '@/lib/timedSession';
import { useTimedEngine } from '@/lib/useTimedEngine';
import { Button, CtaBar, HeadingXL, LabelOverline, Page, PageHeader } from '@/components/ui';

function formatClock(ms: number): string {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function TimedSessionView({
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
  const state = useTimedEngine(session);
  const config = session.timed;
  const isPaused = session.pausedAt !== undefined;

  const completedWorkIntervals = state?.completedWorkIntervals ?? 0;
  const isDone = state?.phase === 'done';

  // Auto-log: append a set for each newly-completed work interval. Idempotent —
  // appendAutoLoggedSets reads the already-logged count from the session, so
  // this no-ops once caught up and never double-logs across refreshes.
  useEffect(() => {
    if (!config) return;
    const next = appendAutoLoggedSets(
      session,
      completedWorkIntervals,
      config.workSec ?? 0,
      new Date().toISOString(),
    );
    if (next) onUpdate(next);
  }, [session, config, completedWorkIntervals, onUpdate]);

  // When the engine is done, mark any not-yet-completed circuit exercise as
  // completed so the history card reflects a fully-finished session.
  useEffect(() => {
    if (!isDone) return;
    if (session.exercises.every((e) => e.completed)) return;
    onUpdate({
      ...session,
      exercises: session.exercises.map((e) =>
        e.completed ? e : { ...e, completed: true, completedAt: new Date().toISOString() },
      ),
    });
  }, [isDone, session, onUpdate]);

  const handlePause = () => onUpdate({ ...session, pausedAt: new Date().toISOString() });
  const handleResume = () => {
    const pausedMs = session.pausedAt ? Date.now() - new Date(session.pausedAt).getTime() : 0;
    onUpdate({
      ...session,
      pausedAt: undefined,
      totalPausedMs: (session.totalPausedMs ?? 0) + pausedMs,
    });
  };

  const phaseLabel =
    state?.phase === 'rest' ? t.timed_phase_rest : isDone ? t.timed_done_title : t.timed_phase_work;
  const isRest = state?.phase === 'rest';
  const activeExercise =
    state && state.activeExerciseIndex >= 0 ? session.exercises[state.activeExerciseIndex] : null;

  return (
    <Page>
      <PageHeader>
        <div className="flex items-center justify-between gap-3">
          <LabelOverline>{t.timed_mode_tabata}</LabelOverline>
          <SessionTimer
            startedAt={session.startedAt}
            totalPausedMs={session.totalPausedMs}
            pausedAt={session.pausedAt}
          />
        </div>
      </PageHeader>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center">
        <span
          className={`text-sm font-bold tracking-[0.2em] ${
            isDone ? 'text-brand' : isRest ? 'text-warning' : 'text-brand'
          }`}
        >
          {phaseLabel}
        </span>

        {!isDone && (
          <div
            className={`font-mono font-bold tabular-nums leading-none text-7xl ${
              isRest ? 'text-warning' : 'text-primary'
            }`}
          >
            {formatClock(state?.phaseRemainingMs ?? 0)}
          </div>
        )}

        {state && !isDone && (
          <div className="flex flex-col items-center gap-1">
            <HeadingXL>{activeExercise?.name ?? ''}</HeadingXL>
            <p className="text-muted text-sm">
              {t.timed_round_of
                .replace('{n}', String(state.roundIndex + 1))
                .replace('{total}', String(state.totalRounds))}
            </p>
          </div>
        )}

        {isDone && (
          <p className="text-muted text-sm">
            {t.timed_round_of
              .replace('{n}', String(state?.totalRounds ?? 0))
              .replace('{total}', String(state?.totalRounds ?? 0))}
          </p>
        )}
      </div>

      <CtaBar>
        {isDone ? (
          <Button size="lg" onClick={() => onFinish()}>
            {t.timed_done_finish}
          </Button>
        ) : isPaused ? (
          <Button size="lg" onClick={handleResume}>
            <span className="flex items-center gap-2">
              <PlayIcon className="w-5 h-5" /> {t.timed_resume}
            </span>
          </Button>
        ) : (
          <Button variant="secondary" size="lg" onClick={handlePause}>
            <span className="flex items-center gap-2">
              <Pause className="w-5 h-5" /> {t.timed_pause}
            </span>
          </Button>
        )}
        <Button variant="ghost" onClick={onDiscard}>
          {t.discard}
        </Button>
      </CtaBar>
    </Page>
  );
}
