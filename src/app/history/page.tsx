'use client';

import { useRef, useState } from 'react';
import { Clock, Plus } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import ActivityTiles from '@/components/ActivityTiles';
import NewHistorySessionSheet from '@/components/NewHistorySessionSheet';
import { WorkoutHistoryDayGroup } from '@/components/WorkoutHistoryCard';
import { getSessions, getPlans } from '@/lib/storage';
import type { WorkoutSession, WorkoutPlan } from '@/lib/types';
import { useTranslations } from '@/lib/locale-context';
import { EmptyState, HeadingXL, Page, PageHeader } from '@/components/ui';

function loadSessions(): WorkoutSession[] {
  return getSessions()
    .filter((s) => s.completedAt)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}

export default function HistoryPage() {
  const t = useTranslations();
  const [sessions, setSessions] = useState<WorkoutSession[]>(loadSessions);

  const [planMap] = useState<Record<string, WorkoutPlan>>(() => {
    const plans = getPlans();
    return Object.fromEntries(plans.map((p) => [p.id, p]));
  });

  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [newSessionId, setNewSessionId] = useState<string | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSessionSaved(sessionId: string) {
    setSessions(loadSessions());
    setIsNewSessionOpen(false);

    // Clear any existing timer, then light up the card for 1.3s
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    setNewSessionId(sessionId);
    flashTimerRef.current = setTimeout(() => setNewSessionId(null), 1300);
  }

  const sessionsByDate = sessions.reduce<Record<string, string[]>>((acc, s) => {
    if (!s.completedAt) return acc;
    const date = s.completedAt.slice(0, 10);
    if (!acc[date]) acc[date] = [];
    acc[date].push(s.id);
    return acc;
  }, {});

  const grouped: { date: string; sessions: WorkoutSession[] }[] = [];
  for (const session of sessions) {
    const date = session.completedAt.slice(0, 10);
    const last = grouped[grouped.length - 1];
    if (last && last.date === date) {
      last.sessions.push(session);
    } else {
      grouped.push({ date, sessions: [session] });
    }
  }
  for (const group of grouped) {
    group.sessions.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  }

  return (
    <Page className="pb-20">
      <PageHeader>
        <div className="flex items-center justify-between">
          <HeadingXL>{t.history_title}</HeadingXL>
          <button
            onClick={() => setIsNewSessionOpen(true)}
            aria-label={t.new_history_session_title}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-surface border border-border active:bg-elevated"
          >
            <Plus className="w-4 h-4 text-brand" />
          </button>
        </div>
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
          grouped.map(({ date, sessions: daySessions }) => (
            <WorkoutHistoryDayGroup
              key={date}
              date={date}
              sessions={daySessions}
              planMap={planMap}
              newSessionId={newSessionId}
            />
          ))
        )}
      </div>

      <BottomNav active="history" />

      <NewHistorySessionSheet
        isOpen={isNewSessionOpen}
        onClose={() => setIsNewSessionOpen(false)}
        onSaved={handleSessionSaved}
      />
    </Page>
  );
}
