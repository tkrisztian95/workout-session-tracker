'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CalendarDays, Clock, Plus, X } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import ActivityTiles from '@/components/ActivityTiles';
import NewHistorySessionSheet from '@/components/NewHistorySessionSheet';
import DateRangePicker from '@/components/DateRangePicker';
import { WorkoutHistoryDayGroup } from '@/components/WorkoutHistoryCard';
import { getSessions, getPlans } from '@/lib/storage';
import type { WorkoutSession, WorkoutPlan } from '@/lib/types';
import { useLocale, useTranslations } from '@/lib/locale-context';
import { EmptyState, HeadingXL, Page, PageHeader } from '@/components/ui';

function loadSessions(): WorkoutSession[] {
  return getSessions()
    .filter((s) => s.completedAt)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}

function formatRangeLabel(from: string, to: string, locale: string): string {
  const fmt = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  return from === to ? fmt(from) : `${fmt(from)} – ${fmt(to)}`;
}

function HistoryContent() {
  const t = useTranslations();
  const { locale } = useLocale();
  const searchParams = useSearchParams();
  const dateFilter = searchParams.get('date');

  const [sessions, setSessions] = useState<WorkoutSession[]>(loadSessions);
  const [planMap] = useState<Record<string, WorkoutPlan>>(() => {
    const plans = getPlans();
    return Object.fromEntries(plans.map((p) => [p.id, p]));
  });

  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [newSessionId, setNewSessionId] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: string | null; to: string | null }>({
    from: null,
    to: null,
  });

  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollTargetRef = useRef<HTMLDivElement>(null);

  function handleSessionSaved(sessionId: string) {
    setSessions(loadSessions());
    setIsNewSessionOpen(false);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    setNewSessionId(sessionId);
    flashTimerRef.current = setTimeout(() => setNewSessionId(null), 1300);
  }

  // Scroll-to-day when navigating from activity tile (?date param)
  useEffect(() => {
    if (!dateFilter) return;
    requestAnimationFrame(() => {
      scrollTargetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [dateFilter]);

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

  const visibleGroups =
    dateRange.from && dateRange.to
      ? grouped.filter((g) => g.date >= dateRange.from! && g.date <= dateRange.to!)
      : grouped;

  const rangeLabel =
    dateRange.from && dateRange.to ? formatRangeLabel(dateRange.from, dateRange.to, locale) : null;

  return (
    <Page className="pb-20">
      <PageHeader>
        <div className="flex items-center justify-between">
          <HeadingXL>{t.history_title}</HeadingXL>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPickerOpen(true)}
              aria-label="Filter by date range"
              className={[
                'w-11 h-11 rounded-full flex items-center justify-center border transition-colors',
                rangeLabel
                  ? 'bg-brand border-brand text-white'
                  : 'bg-surface border-border active:bg-elevated',
              ].join(' ')}
            >
              <CalendarDays className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsNewSessionOpen(true)}
              aria-label={t.new_history_session_title}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-surface border border-border active:bg-elevated"
            >
              <Plus className="w-4 h-4 text-brand" />
            </button>
          </div>
        </div>
        {rangeLabel && (
          <div className="flex items-center gap-2 mt-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/15 text-brand text-sm font-medium">
              {rangeLabel}
              <button
                onClick={() => setDateRange({ from: null, to: null })}
                aria-label="Clear date range filter"
                className="ml-0.5 -mr-1 p-0.5 rounded-full active:bg-brand/30 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          </div>
        )}
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
        ) : visibleGroups.length === 0 ? (
          <EmptyState
            icon={<Clock className="w-9 h-9 text-border" />}
            title={t.history_filter_no_results_title}
            subtitle={t.history_filter_no_results_subtitle}
          />
        ) : (
          visibleGroups.map(({ date, sessions: daySessions }) => (
            <div key={date} ref={date === dateFilter ? scrollTargetRef : null}>
              <WorkoutHistoryDayGroup
                date={date}
                sessions={daySessions}
                planMap={planMap}
                newSessionId={newSessionId}
              />
            </div>
          ))
        )}
      </div>

      <BottomNav active="history" />

      <NewHistorySessionSheet
        isOpen={isNewSessionOpen}
        onClose={() => setIsNewSessionOpen(false)}
        onSaved={handleSessionSaved}
      />

      <DateRangePicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        value={dateRange}
        onApply={(from: string, to: string) => {
          setDateRange({ from, to });
          setIsPickerOpen(false);
        }}
        onClear={() => {
          setDateRange({ from: null, to: null });
          setIsPickerOpen(false);
        }}
        sessions={sessions}
      />
    </Page>
  );
}

export default function HistoryPage() {
  return (
    <Suspense>
      <HistoryContent />
    </Suspense>
  );
}
