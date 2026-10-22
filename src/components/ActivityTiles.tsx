'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { CalendarClock, ChevronRight, CornerUpLeft, Dumbbell } from 'lucide-react';
import { useLocale, useTranslations } from '@/lib/locale-context';
import { getScheduledPlanDays } from '@/lib/plan-list';
import type { WorkoutPlan, WorkoutSession } from '@/lib/types';

interface Props {
  /** Completed sessions, used to mark trained days and list what was logged. */
  sessions: WorkoutSession[];
  /** All plans, used to surface what's scheduled for upcoming days. */
  plans: WorkoutPlan[];
}

/** Weeks of history shown before the current week. */
const WEEKS_BEFORE = 2;
/** Weeks of upcoming days shown after the current week. */
const WEEKS_AFTER = 2;

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Local midnight of the Monday that starts the week containing `d`. */
function startOfWeek(d: Date): Date {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const mondayOffset = (r.getDay() + 6) % 7; // Sunday (0) → 6, Monday (1) → 0
  r.setDate(r.getDate() - mondayOffset);
  return r;
}

export default function ActivityTiles({ sessions, plans }: Props) {
  const t = useTranslations();
  const { locale } = useLocale();

  const weekStartRef = useRef<HTMLButtonElement>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayIso = toISODate(today);

  const [selectedIso, setSelectedIso] = useState(todayIso);

  // Session ids grouped by calendar day, newest-first per day.
  const sessionsByDate = useMemo(() => {
    const map: Record<string, WorkoutSession[]> = {};
    for (const s of sessions) {
      if (!s.completedAt) continue;
      const date = s.completedAt.slice(0, 10);
      (map[date] ??= []).push(s);
    }
    for (const list of Object.values(map)) {
      list.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    }
    return map;
  }, [sessions]);

  const planMap = useMemo(() => Object.fromEntries(plans.map((p) => [p.id, p])), [plans]);

  // A month-wide window of days, aligned to whole weeks (Mon → Sun).
  const days = useMemo(() => {
    const weekStart = startOfWeek(today);
    const rangeStart = new Date(weekStart);
    rangeStart.setDate(rangeStart.getDate() - WEEKS_BEFORE * 7);
    const totalDays = (WEEKS_BEFORE + 1 + WEEKS_AFTER) * 7;
    const out: Date[] = [];
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(rangeStart);
      d.setDate(rangeStart.getDate() + i);
      out.push(d);
    }
    return out;
  }, [today]);

  const currentWeekMondayIso = useMemo(() => toISODate(startOfWeek(today)), [today]);

  const scrollToCurrentWeek = (behavior: ScrollBehavior) => {
    weekStartRef.current?.scrollIntoView({ behavior, block: 'nearest', inline: 'start' });
  };

  // Land on the current week on mount.
  useEffect(() => {
    scrollToCurrentWeek('instant');
  }, []);

  const handleJumpToday = () => {
    setSelectedIso(todayIso);
    scrollToCurrentWeek('smooth');
  };

  // ─── Selected-day detail ────────────────────────────────────────────────────
  const selectedDate = new Date(`${selectedIso}T12:00:00`);
  const selectedSessions = sessionsByDate[selectedIso] ?? [];
  const isPastSelection = selectedIso < todayIso;
  // Only surface what's planned for today and upcoming days.
  const scheduled = isPastSelection ? [] : getScheduledPlanDays(plans, selectedDate.getDay());

  const monthLabel = selectedDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  const selectedDayLabel = selectedDate.toLocaleDateString(locale, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted">
          {monthLabel}
        </span>
        <button
          onClick={handleJumpToday}
          aria-label={t.history_jump_today}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface border border-border text-xs font-medium text-brand active:bg-elevated transition-colors"
        >
          <CornerUpLeft className="w-3 h-3" />
          {t.history_jump_today}
        </button>
      </div>

      <div
        className="overflow-x-auto -mx-1 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="flex gap-1.5 px-1 py-1" style={{ width: 'max-content' }}>
          {days.map((day) => {
            const iso = toISODate(day);
            const isToday = iso === todayIso;
            const isWeekStart = iso === currentWeekMondayIso;
            const isSelected = iso === selectedIso;
            const count = (sessionsByDate[iso] ?? []).length;
            const hasWorkout = count > 0;
            const isFutureOrToday = iso >= todayIso;
            const isPlanned =
              !hasWorkout &&
              isFutureOrToday &&
              getScheduledPlanDays(plans, day.getDay()).length > 0;

            const tone = isToday
              ? hasWorkout
                ? 'bg-brand'
                : 'bg-surface ring-2 ring-brand/60'
              : hasWorkout
                ? 'bg-success'
                : isPlanned
                  ? 'bg-surface border border-dashed border-brand/50'
                  : 'bg-surface';

            const dimWeekday =
              !isToday && !hasWorkout && !isPlanned ? 'text-muted' : 'text-foreground/80';
            const dimNumber =
              !isToday && !hasWorkout && !isPlanned ? 'text-border' : 'text-foreground';

            return (
              <button
                key={iso}
                ref={isWeekStart ? weekStartRef : null}
                onClick={() => setSelectedIso(iso)}
                aria-pressed={isSelected}
                aria-label={`${iso}${
                  hasWorkout
                    ? `, ${count} workout${count > 1 ? 's' : ''}`
                    : isPlanned
                      ? `, ${t.history_week_planned_label.toLowerCase()}`
                      : ''
                }`}
                className={[
                  'flex flex-col items-center gap-1 w-[52px] py-3 rounded-2xl transition-all duration-150 cursor-pointer active:scale-95',
                  tone,
                  isSelected
                    ? 'outline outline-2 outline-foreground/40 outline-offset-2'
                    : 'outline-none',
                ].join(' ')}
              >
                <span
                  className={`text-[10px] font-bold tracking-widest uppercase ${
                    isToday && !hasWorkout ? 'text-brand' : dimWeekday
                  }`}
                >
                  {t.weekday_abbr[day.getDay()]}
                </span>
                <span
                  className={`text-2xl font-bold leading-none ${dimNumber}`}
                  style={{ fontFamily: 'var(--font-condensed)' }}
                >
                  {day.getDate()}
                </span>
                <span className="h-3 flex items-center justify-center">
                  {count > 1 ? (
                    <span className="text-[10px] font-bold text-foreground/70">{`×${count}`}</span>
                  ) : hasWorkout ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/70 block" />
                  ) : isPlanned ? (
                    <span className="w-1.5 h-1.5 rounded-full border border-brand block" />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-surface border border-border px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
          {selectedDayLabel}
        </p>

        {selectedSessions.length === 0 && scheduled.length === 0 ? (
          <p className="text-dim text-sm">{t.history_week_nothing}</p>
        ) : (
          <div className="space-y-2">
            {selectedSessions.map((s) => {
              const name = s.planId ? (planMap[s.planId]?.name ?? t.free_session) : t.free_session;
              return (
                <Link
                  key={s.id}
                  href={`/history/${s.id}`}
                  className="flex items-center gap-2.5 rounded-xl bg-elevated/40 px-3 py-2 active:scale-[0.98] transition-transform"
                >
                  <span className="w-7 h-7 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-3.5 h-3.5 text-success" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-foreground text-sm font-medium truncate">
                      {name}
                    </span>
                    <span className="block text-dim text-[11px] uppercase tracking-wide">
                      {t.history_week_completed_label}
                    </span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
                </Link>
              );
            })}

            {scheduled.map(({ plan, day }) => (
              <div
                key={`${plan.id}-${day.id}`}
                className="flex items-center gap-2.5 rounded-xl bg-elevated/40 px-3 py-2"
              >
                <span className="w-7 h-7 rounded-lg bg-brand/15 flex items-center justify-center flex-shrink-0">
                  <CalendarClock className="w-3.5 h-3.5 text-brand" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-foreground text-sm font-medium truncate">
                    {day.name || t.free_session}
                  </span>
                  <span className="block text-dim text-[11px] truncate">
                    {t.history_week_planned_label} · {plan.name}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
