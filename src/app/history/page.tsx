'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Clock } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import ActivityTiles from '@/components/ActivityTiles';
import { getSessions, getPlans } from '@/lib/storage';
import type { WorkoutSession, WorkoutPlan } from '@/lib/types';
import { useTranslations } from '@/lib/locale-context';

function formatSessionDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function durationMinutes(startedAt: string, completedAt: string): number {
  return Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 60000);
}

export default function HistoryPage() {
  const t = useTranslations();
  const [sessions] = useState<WorkoutSession[]>(() =>
    getSessions()
      .filter((s) => s.completedAt)
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt)),
  );

  const [planMap] = useState<Record<string, WorkoutPlan>>(() => {
    const plans = getPlans();
    return Object.fromEntries(plans.map((p) => [p.id, p]));
  });

  const sessionsByDate = sessions.reduce<Record<string, string[]>>((acc, s) => {
    if (!s.completedAt) return acc;
    const date = s.completedAt.slice(0, 10);
    if (!acc[date]) acc[date] = [];
    acc[date].push(s.id);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-[#111827] flex flex-col max-w-md mx-auto pb-20">
      <div className="px-6 pt-14 pb-6">
        <p className="text-[#6B7280] text-xs font-medium tracking-widest uppercase">
          {t.history_activity_label}
        </p>
        <h1
          className="text-[#F9FAFB] text-5xl font-bold mt-1 leading-none tracking-tight"
          style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
        >
          {t.history_title}
        </h1>
      </div>

      <div className="px-6 pb-4">
        <ActivityTiles sessionsByDate={sessionsByDate} />
      </div>

      <div className="flex-1 px-6 space-y-3 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 text-center">
            <div className="w-20 h-20 rounded-full bg-[#1F2937] border border-[#374151] flex items-center justify-center mb-5">
              <Clock className="w-9 h-9 text-[#374151]" />
            </div>
            <p className="text-[#9CA3AF] text-base font-medium">{t.history_no_sessions_title}</p>
            <p className="text-[#6B7280] text-sm mt-1">{t.history_no_sessions_subtitle}</p>
          </div>
        ) : (
          sessions.map((session) => {
            const planName = session.planId ? planMap[session.planId]?.name : undefined;
            const exerciseCount = session.exercises.length;
            const mins = durationMinutes(session.startedAt, session.completedAt);
            const label = planName ?? t.free_session;

            return (
              <Link
                key={session.id}
                href={`/history/${session.id}`}
                className="flex items-center justify-between rounded-2xl bg-[#1F2937] border border-[#374151] px-4 py-4 gap-3 active:scale-[0.98] transition-transform duration-150"
              >
                <div className="text-left min-w-0">
                  <p className="text-[#F9FAFB] font-semibold text-base truncate">{label}</p>
                  <p className="text-[#6B7280] text-sm mt-0.5">
                    {formatSessionDate(session.completedAt)}
                  </p>
                  <p className="text-[#4B5563] text-xs mt-1">
                    {exerciseCount} {exerciseCount !== 1 ? t.exercise_plural : t.exercise_singular}{' '}
                    · {mins} {t.min_label}
                  </p>
                </div>
                <span className="w-7 h-7 rounded-full bg-[#374151]/50 flex items-center justify-center flex-shrink-0">
                  <ChevronRight className="w-4 h-4 text-[#6B7280]" />
                </span>
              </Link>
            );
          })
        )}
      </div>

      <BottomNav active="history" />
    </main>
  );
}
