'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { Check, Minus } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { getSessions, getPlans } from '@/lib/storage';
import type { WorkoutSession, WorkoutPlan } from '@/lib/types';

function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

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
    <main className="min-h-screen bg-[#111827] flex flex-col max-w-md mx-auto pb-20">
      {/* Header */}
      <div className="px-6 pt-14 pb-6">
        <Link href="/history" className="text-[#6B7280] text-sm mb-5 inline-block cursor-pointer">
          ← History
        </Link>
        <p className="text-[#6B7280] text-xs font-medium tracking-widest uppercase mt-3">
          {formatFullDate(session.completedAt)}
        </p>
        <h1
          className="text-[#F9FAFB] text-5xl font-bold mt-1 leading-none tracking-tight"
          style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
        >
          {dayName ?? planName ?? 'Free Session'}
        </h1>
        {planName && dayName && (
          <p className="text-[#F97316] text-sm mt-1 font-medium">{planName}</p>
        )}
        {planName && !dayName && (
          <p className="text-[#F97316] text-sm mt-1 font-medium">{planName}</p>
        )}
        <p className="text-[#6B7280] text-sm mt-2">
          {session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''} · {mins}{' '}
          min
        </p>
      </div>

      {/* Exercise list */}
      <div className="flex-1 px-6 pb-6 space-y-3 overflow-y-auto">
        {session.exercises.length === 0 ? (
          <p className="text-[#6B7280] text-sm">No exercises recorded.</p>
        ) : (
          <>
            {[...completed, ...remaining].map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center gap-3 rounded-xl bg-[#1F2937] border border-[#374151] px-3 py-3"
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                    exercise.completed ? 'bg-[#F97316]' : 'border-2 border-[#4B5563]'
                  }`}
                >
                  {exercise.completed && (
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`font-medium text-sm ${exercise.completed ? 'text-[#F9FAFB]' : 'text-[#9CA3AF]'}`}
                  >
                    {exercise.name}
                  </p>
                  <p className="text-[#6B7280] text-xs mt-0.5">{exerciseDetail(exercise)}</p>
                </div>
              </div>
            ))}

            {skipped.length > 0 && (
              <>
                <p className="text-[#4B5563] text-xs font-medium uppercase tracking-wide pt-2">
                  Skipped
                </p>
                {skipped.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex items-center gap-3 rounded-xl bg-[#111827] border border-[#374151] px-3 py-3 opacity-50"
                  >
                    <div className="w-6 h-6 rounded-md border-2 border-[#4B5563] flex items-center justify-center flex-shrink-0">
                      <Minus className="w-3 h-3 text-[#4B5563]" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[#6B7280] font-medium text-sm">{exercise.name}</p>
                      <p className="text-[#4B5563] text-xs mt-0.5">{exerciseDetail(exercise)}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>

      <BottomNav active="history" />
    </main>
  );
}
