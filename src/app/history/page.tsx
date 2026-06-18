'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CalendarDays, Clock, Plus, SlidersHorizontal, X } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import ActivityTiles from '@/components/ActivityTiles';
import NewHistorySessionSheet from '@/components/NewHistorySessionSheet';
import DateRangePicker from '@/components/DateRangePicker';
import HistoryFilterSheet from '@/components/HistoryFilterSheet';
import { WorkoutHistoryDayGroup } from '@/components/WorkoutHistoryCard';
import { getSessions, getPlans } from '@/lib/storage';
import type { WorkoutSession, WorkoutPlan } from '@/lib/types';
import type { MuscleGroup } from '@/lib/muscles';
import {
  availableExerciseNames,
  filterSessions,
  hasActiveFilters,
  nonDateFilterCount,
  normalizeExerciseName,
  EMPTY_FILTERS,
  type HistoryFilters,
} from '@/lib/historyFilters';
import { useLocale, useTranslations } from '@/lib/locale-context';
import { formatMonthBucket, getSessionBucket, type RelativeBucketKey } from '@/lib/sessionUtils';
import { EmptyState, HeadingXL, Page, PageHeader } from '@/components/ui';

const RELATIVE_BUCKET_LABEL_KEY = {
  this_week: 'history_bucket_this_week',
  last_week: 'history_bucket_last_week',
  two_weeks_ago: 'history_bucket_two_weeks_ago',
  earlier_this_month: 'history_bucket_earlier_this_month',
} as const satisfies Record<RelativeBucketKey, keyof ReturnType<typeof useTranslations>>;

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

// ─── Filter pill ───────────────────────────────────────────────────────────────

function FilterPill({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/15 text-brand text-sm font-medium">
      {label}
      <button
        onClick={onClear}
        aria-label={`Clear ${label} filter`}
        className="ml-0.5 -mr-1 p-0.5 rounded-full active:bg-brand/30 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  );
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<HistoryFilters>(EMPTY_FILTERS);

  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollTargetRef = useRef<HTMLDivElement>(null);

  const availableExercises = useMemo(() => availableExerciseNames(sessions), [sessions]);

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

  const filteredSessions = filterSessions(sessions, filters);

  const grouped: { date: string; sessions: WorkoutSession[] }[] = [];
  for (const session of filteredSessions) {
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

  const now = new Date();
  const bucketedGroups = grouped.map((group) => {
    const bucket = getSessionBucket(group.sessions[0].completedAt, now);
    const label = bucket.relativeKey
      ? t[RELATIVE_BUCKET_LABEL_KEY[bucket.relativeKey]]
      : formatMonthBucket(bucket.monthDate!, locale, now);
    return { ...group, bucketId: bucket.id, bucketLabel: label };
  });

  const rangeLabel =
    filters.dateFrom && filters.dateTo
      ? formatRangeLabel(filters.dateFrom, filters.dateTo, locale)
      : null;
  const extraFilterCount = nonDateFilterCount(filters);
  const anyFilterActive = hasActiveFilters(filters);

  const sessionTypeLabel =
    filters.sessionType === 'plan'
      ? t.history_filter_type_plan
      : filters.sessionType === 'free'
        ? t.history_filter_type_free
        : null;

  function clearMuscleGroup(group: MuscleGroup) {
    setFilters((f) => ({ ...f, muscleGroups: f.muscleGroups.filter((g) => g !== group) }));
  }

  function clearExercise(name: string) {
    const key = normalizeExerciseName(name);
    setFilters((f) => ({
      ...f,
      exercises: f.exercises.filter((e) => normalizeExerciseName(e) !== key),
    }));
  }

  return (
    <Page className="pb-20">
      <PageHeader>
        <div className="flex items-center justify-between">
          <HeadingXL>{t.history_title}</HeadingXL>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFilterOpen(true)}
              aria-label={t.history_filter_title}
              className={[
                'relative w-11 h-11 rounded-full flex items-center justify-center border transition-colors',
                extraFilterCount > 0
                  ? 'bg-brand border-brand text-white'
                  : 'bg-surface border-border active:bg-elevated',
              ].join(' ')}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {extraFilterCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-brand text-[11px] font-bold flex items-center justify-center ring-2 ring-base">
                  {extraFilterCount}
                </span>
              )}
            </button>
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
        {anyFilterActive && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {rangeLabel && (
              <FilterPill
                label={rangeLabel}
                onClear={() => setFilters((f) => ({ ...f, dateFrom: null, dateTo: null }))}
              />
            )}
            {sessionTypeLabel && (
              <FilterPill
                label={sessionTypeLabel}
                onClear={() => setFilters((f) => ({ ...f, sessionType: 'all' }))}
              />
            )}
            {filters.muscleGroups.map((group) => (
              <FilterPill
                key={group}
                label={t.muscle_group_labels[group]}
                onClear={() => clearMuscleGroup(group)}
              />
            ))}
            {filters.exercises.map((name) => (
              <FilterPill key={name} label={name} onClear={() => clearExercise(name)} />
            ))}
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
        ) : bucketedGroups.length === 0 ? (
          <EmptyState
            icon={<Clock className="w-9 h-9 text-border" />}
            title={t.history_filter_no_results_title}
            subtitle={t.history_filter_no_results_subtitle}
          />
        ) : (
          bucketedGroups.map(({ date, sessions: daySessions, bucketId, bucketLabel }, i) => {
            const showBucketHeader = i === 0 || bucketedGroups[i - 1].bucketId !== bucketId;
            return (
              <div key={date} ref={date === dateFilter ? scrollTargetRef : null}>
                {showBucketHeader && (
                  <h2
                    className={`text-foreground font-condensed text-2xl font-bold tracking-tight mb-3 ${
                      i === 0 ? '' : 'mt-7'
                    }`}
                  >
                    {bucketLabel}
                  </h2>
                )}
                <WorkoutHistoryDayGroup
                  date={date}
                  sessions={daySessions}
                  planMap={planMap}
                  newSessionId={newSessionId}
                />
              </div>
            );
          })
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
        value={{ from: filters.dateFrom, to: filters.dateTo }}
        onApply={(from: string, to: string) => {
          setFilters((f) => ({ ...f, dateFrom: from, dateTo: to }));
          setIsPickerOpen(false);
        }}
        onClear={() => {
          setFilters((f) => ({ ...f, dateFrom: null, dateTo: null }));
          setIsPickerOpen(false);
        }}
        sessions={sessions}
      />

      <HistoryFilterSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        value={{
          sessionType: filters.sessionType,
          muscleGroups: filters.muscleGroups,
          exercises: filters.exercises,
        }}
        availableExercises={availableExercises}
        onApply={(next) => {
          setFilters((f) => ({ ...f, ...next }));
          setIsFilterOpen(false);
        }}
        onClear={() => {
          setFilters((f) => ({
            ...f,
            sessionType: 'all',
            muscleGroups: [],
            exercises: [],
          }));
          setIsFilterOpen(false);
        }}
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
