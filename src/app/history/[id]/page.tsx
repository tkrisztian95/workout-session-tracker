'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { Check, ChevronLeft, Minus } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { getSessions, getPlans } from '@/lib/storage';
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

export default function SessionDetailPage() {
  const t = useTranslations();
  const { id } = useParams<{ id: string }>();

  const [session] = useState<WorkoutSession | null>(() => {
    const sessions = getSessions();
    return sessions.find((s) => s.id === id) ?? null;
  });

  const [planMap] = useState<Record<string, WorkoutPlan>>(() => {
    const plans = getPlans();
    return Object.fromEntries(plans.map((p) => [p.id, p]));
  });

  if (!session) {
    notFound();
  }

  const plan = session.planId ? planMap[session.planId] : undefined;
  const planDay =
    plan && session.planDayId ? plan.days.find((d) => d.id === session.planDayId) : undefined;
  const planName = plan?.name;
  const dayName = planDay?.name;
  const mins = durationMinutes(session.startedAt, session.completedAt);
  const completed = session.exercises.filter((e) => e.completed && !e.dismissed);
  const skipped = session.exercises.filter((e) => e.dismissed);
  const remaining = session.exercises.filter((e) => !e.completed && !e.dismissed);

  return (
    <Page className="pb-20">
      <PageHeader>
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
        <SessionDateLabel iso={session.completedAt} format="long" className="mt-3" />
        <HeadingXL className="mt-1">{dayName ?? planName ?? t.free_session}</HeadingXL>
        {planName && <p className="text-brand text-sm mt-1 font-medium">{planName}</p>}
        <p className="text-muted text-sm mt-2">
          {session.exercises.length}{' '}
          {session.exercises.length !== 1 ? t.exercise_plural : t.exercise_singular} · {mins}{' '}
          {t.min_label}
        </p>
      </PageHeader>

      <div className="flex-1 px-6 pb-6 space-y-3 overflow-y-auto">
        {session.exercises.length === 0 ? (
          <p className="text-muted text-sm">{t.no_exercises_recorded}</p>
        ) : (
          <>
            {[...completed, ...remaining].map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center gap-3 rounded-xl bg-surface border border-border px-3 py-3"
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                    exercise.completed ? 'bg-brand' : 'border-2 border-border-subtle'
                  }`}
                >
                  {exercise.completed && (
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={`font-medium text-sm ${exercise.completed ? 'text-foreground' : 'text-secondary'}`}
                    >
                      {exercise.name}
                    </p>
                    {exercise.category && <CategoryBadge category={exercise.category} />}
                  </div>
                  <p className="text-muted text-xs mt-0.5">{exerciseDetail(exercise)}</p>
                </div>
              </div>
            ))}

            {skipped.length > 0 && (
              <>
                <ListLabel className="text-dim">{t.skipped_section}</ListLabel>
                {skipped.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex items-center gap-3 rounded-xl bg-base border border-border px-3 py-3 opacity-50"
                  >
                    <div className="w-6 h-6 rounded-md border-2 border-border-subtle flex items-center justify-center flex-shrink-0">
                      <Minus className="w-3 h-3 text-dim" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-muted font-medium text-sm">{exercise.name}</p>
                        {exercise.category && <CategoryBadge category={exercise.category} />}
                      </div>
                      <p className="text-dim text-xs mt-0.5">{exerciseDetail(exercise)}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>

      <BottomNav active="history" />
    </Page>
  );
}
