'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import MuscleBadge from '@/components/MuscleBadge';
import SessionDateLabel from '@/components/SessionDateLabel';
import type { WorkoutSession, WorkoutPlan } from '@/lib/types';
import type { Muscle } from '@/lib/muscles';
import { useTranslations } from '@/lib/locale-context';
import { RATING_EMOJI } from '@/lib/sessionUtils';

function durationMinutes(startedAt: string, completedAt: string): number {
  return Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 60000);
}

function formatStartTime(startedAt: string): string {
  return new Date(startedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

interface WorkoutHistoryCardProps {
  session: WorkoutSession;
  planMap: Record<string, WorkoutPlan>;
  isNew?: boolean;
}

export function WorkoutHistoryCard({ session, planMap, isNew = false }: WorkoutHistoryCardProps) {
  const t = useTranslations();
  const planName = session.planId ? planMap[session.planId]?.name : undefined;
  const label = planName ?? t.free_session;
  const totalCount = session.exercises.length;
  const doneCount = session.exercises.filter((e) => e.completed && !e.dismissed).length;
  const exerciseCountLabel =
    doneCount === totalCount ? `${doneCount}` : `${doneCount}/${totalCount}`;
  const mins = durationMinutes(session.startedAt, session.completedAt);
  const muscles = [
    ...new Set(session.exercises.map((e) => e.muscle).filter((m): m is Muscle => Boolean(m))),
  ];

  return (
    <Link
      href={`/history/${session.id}`}
      className={`rounded-2xl bg-surface border border-border flex items-center justify-between px-4 py-4 gap-3 active:scale-[0.98] transition-transform duration-150 ${isNew ? 'animate-flash-success' : ''}`}
    >
      <div className="text-left min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-foreground font-semibold text-base truncate">{label}</p>
          {session.rating != null && (
            <span
              className="text-base leading-none"
              aria-label={`Rated ${session.rating} out of 5`}
            >
              {RATING_EMOJI[session.rating - 1]}
            </span>
          )}
        </div>
        <p className="text-dim text-xs mt-1">
          {formatStartTime(session.startedAt)} · {mins} {t.min_label} · {exerciseCountLabel}{' '}
          {totalCount !== 1 ? t.exercise_plural : t.exercise_singular}
        </p>
        {muscles.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {muscles.map((m) => (
              <MuscleBadge key={m} muscle={m} />
            ))}
          </div>
        )}
      </div>
      <span className="w-7 h-7 rounded-full bg-elevated/50 flex items-center justify-center flex-shrink-0">
        <ChevronRight className="w-4 h-4 text-muted" />
      </span>
    </Link>
  );
}

interface WorkoutHistoryDayGroupProps {
  date: string;
  sessions: WorkoutSession[];
  planMap: Record<string, WorkoutPlan>;
  newSessionId?: string | null;
}

export function WorkoutHistoryDayGroup({
  sessions,
  planMap,
  newSessionId,
}: WorkoutHistoryDayGroupProps) {
  return (
    <div className="mb-6">
      <SessionDateLabel iso={sessions[0].completedAt} className="mb-3" />
      <div className="space-y-3">
        {sessions.map((session) => (
          <WorkoutHistoryCard
            key={session.id}
            session={session}
            planMap={planMap}
            isNew={session.id === newSessionId}
          />
        ))}
      </div>
    </div>
  );
}
