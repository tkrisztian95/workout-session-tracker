'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Clock } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import ActivityTiles from '@/components/ActivityTiles';
import { getSessions, getPlans } from '@/lib/storage';
import type { WorkoutSession, WorkoutPlan } from '@/lib/types';
import { useTranslations } from '@/lib/locale-context';
import CategoryBadge from '@/components/CategoryBadge';
import SessionDateLabel from '@/components/SessionDateLabel';
import { EmptyState, HeadingXL, LabelOverline, Page, PageHeader } from '@/components/ui';

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
    <Page className="pb-20">
      <PageHeader>
        <LabelOverline>{t.history_activity_label}</LabelOverline>
        <HeadingXL className="mt-1">{t.history_title}</HeadingXL>
      </PageHeader>

      <div className="px-6 pb-4">
        <ActivityTiles sessionsByDate={sessionsByDate} />
      </div>

      <div className="flex-1 px-6 overflow-y-auto">
        {sessions.length === 0 ? (
          <EmptyState
            icon={<Clock className="w-9 h-9 text-border" />}
            title={t.history_no_sessions_title}
            subtitle={t.history_no_sessions_subtitle}
          />
        ) : (
          (() => {
            const grouped: { date: string; sessions: typeof sessions }[] = [];
            for (const session of sessions) {
              const date = session.completedAt.slice(0, 10);
              const last = grouped[grouped.length - 1];
              if (last && last.date === date) {
                last.sessions.push(session);
              } else {
                grouped.push({ date, sessions: [session] });
              }
            }
            return grouped.map(({ date, sessions: daySessions }) => (
              <div key={date} className="mb-6">
                <SessionDateLabel iso={daySessions[0].completedAt} className="mb-3" />
                <div className="space-y-3">
                  {daySessions.map((session) => {
                    const planName = session.planId ? planMap[session.planId]?.name : undefined;
                    const exerciseCount = session.exercises.length;
                    const mins = durationMinutes(session.startedAt, session.completedAt);
                    const label = planName ?? t.free_session;
                    const categories = [
                      ...new Set(
                        session.exercises
                          .map((e) => e.category)
                          .filter((c): c is string => Boolean(c)),
                      ),
                    ];
                    return (
                      <Link
                        key={session.id}
                        href={`/history/${session.id}`}
                        className="rounded-2xl bg-surface border border-border flex items-center justify-between px-4 py-4 gap-3 active:scale-[0.98] transition-transform duration-150"
                      >
                        <div className="text-left min-w-0">
                          <p className="text-foreground font-semibold text-base truncate">
                            {label}
                          </p>
                          <p className="text-dim text-xs mt-1">
                            {exerciseCount}{' '}
                            {exerciseCount !== 1 ? t.exercise_plural : t.exercise_singular} · {mins}{' '}
                            {t.min_label}
                          </p>
                          {categories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {categories.map((cat) => (
                                <CategoryBadge key={cat} category={cat} />
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="w-7 h-7 rounded-full bg-elevated/50 flex items-center justify-center flex-shrink-0">
                          <ChevronRight className="w-4 h-4 text-muted" />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ));
          })()
        )}
      </div>

      <BottomNav active="history" />
    </Page>
  );
}
