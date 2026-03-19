'use client';

import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useTranslations } from '@/lib/locale-context';
import type { PlanDay, WorkoutPlan, WorkoutSession } from '@/lib/types';
import { BackButton, Badge, HeadingXL, LabelOverline, Page, PageHeader } from '@/components/ui';
import { todayWeekday } from './helpers';

function getNextDayIndex(plan: WorkoutPlan, sessions: WorkoutSession[]): number {
  const planSessions = sessions
    .filter((s) => s.planId === plan.id && s.planDayId)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  if (planSessions.length === 0) return 0;
  const lastDayIndex = plan.days.findIndex((d) => d.id === planSessions[0].planDayId);
  if (lastDayIndex === -1) return 0;
  return (lastDayIndex + 1) % plan.days.length;
}

export function DayPickerScreen({
  plan,
  sessions,
  onSelect,
  onBack,
}: {
  plan: WorkoutPlan;
  sessions: WorkoutSession[];
  onSelect: (day: PlanDay) => void;
  onBack: () => void;
}) {
  const t = useTranslations();
  const today = todayWeekday();
  const nextDayIndex = getNextDayIndex(plan, sessions);
  const nextDayRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    nextDayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  return (
    <Page className="pb-20">
      <PageHeader>
        <BackButton onClick={onBack} aria-label="Go back">
          <span className="w-9 h-9 rounded-full flex items-center justify-center bg-surface active:bg-elevated">
            <ChevronLeft className="w-5 h-5 text-secondary" />
          </span>
          <span className="text-sm font-medium text-secondary">{t.back}</span>
        </BackButton>
        <LabelOverline className="mb-1">{plan.name}</LabelOverline>
        <HeadingXL>{t.choose_day_title}</HeadingXL>
      </PageHeader>

      <div className="flex-1 px-6 space-y-3 overflow-y-auto">
        {plan.days.map((day, index) => {
          const isSuggested = day.weekdays.includes(today);
          const isNext = index === nextDayIndex;
          const coreCount = day.coreExercises.length;
          const optionalCount = day.optionalExercises.length;
          return (
            <button
              key={day.id}
              ref={isNext ? nextDayRef : null}
              onClick={() => onSelect(day)}
              className={`w-full flex items-center justify-between rounded-2xl border px-4 py-4 gap-3 cursor-pointer active:scale-[0.98] transition-all duration-150 ${
                isNext ? 'bg-brand/10 border-brand/40' : 'bg-surface border-border'
              }`}
            >
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <p className="text-foreground font-semibold text-base">
                    {day.name || t.free_session}
                  </p>
                  {isNext && <Badge variant="brand">{t.next_badge}</Badge>}
                  {isSuggested && !isNext && <Badge variant="subtle">{t.today_badge}</Badge>}
                </div>
                <p className="text-muted text-sm mt-0.5">
                  {coreCount} core{optionalCount > 0 ? ` · ${optionalCount} optional` : ''}
                </p>
                {day.weekdays.length > 0 && (
                  <p className="text-dim text-xs mt-1">
                    {day.weekdays.map((w) => t.weekday_abbr[w]).join(', ')}
                  </p>
                )}
              </div>
              <span className="w-7 h-7 rounded-full bg-elevated/50 flex items-center justify-center flex-shrink-0">
                <ChevronRight className="w-4 h-4 text-muted" />
              </span>
            </button>
          );
        })}
      </div>

      <BottomNav active="home" />
    </Page>
  );
}
