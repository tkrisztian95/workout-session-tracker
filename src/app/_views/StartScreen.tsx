'use client';

import { CalendarCheck, ChevronRight, ClipboardList, Dumbbell, Trophy } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useLocale, useTranslations } from '@/lib/locale-context';
import { Button, HeadingXL, LabelOverline, Page, PageHeader } from '@/components/ui';
import type { HomeBackground } from '@/lib/storage';
import { formatDate } from './helpers';

export interface TodaysSession {
  planId: string;
  dayId: string;
  planName: string;
  dayName: string;
  coreCount: number;
  optionalCount: number;
}

export function StartScreen({
  hasPlans,
  onFollowPlan,
  onFreeSession,
  onCreatePlan,
  greeting,
  lastSessionInfo,
  todaysSessions = [],
  onStartTodaysSession,
  achievementCount,
  onOpenAchievements,
  homeBackground = 'velocity',
}: {
  hasPlans: boolean;
  onFollowPlan: () => void;
  onFreeSession: () => void;
  onCreatePlan: () => void;
  greeting?: string;
  lastSessionInfo: { relativeLabel: string; sessionName: string } | null;
  todaysSessions?: TodaysSession[];
  onStartTodaysSession?: (planId: string, dayId: string) => void;
  achievementCount: number;
  onOpenAchievements: () => void;
  homeBackground?: HomeBackground;
}) {
  const t = useTranslations();
  const { locale } = useLocale();
  const coreCountLabel = (n: number) => t.day_picker_core_count.replace('{n}', String(n));
  const optionalCountLabel = (n: number) => t.day_picker_optional_count.replace('{n}', String(n));
  return (
    <Page
      className="pb-20 overflow-hidden"
      data-home-bg={homeBackground}
      {...(homeBackground === 'ignite' ? { 'data-theme': 'dark' } : {})}
    >
      {homeBackground !== 'none' && <div className={`home-bg bg-${homeBackground}`} aria-hidden />}
      <PageHeader transparent={homeBackground !== 'none'}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <LabelOverline>{formatDate(locale)}</LabelOverline>
            {greeting && (
              <p
                className="text-brand text-lg font-semibold mt-1"
                style={{ fontFamily: 'var(--font-condensed)' }}
              >
                {greeting}
              </p>
            )}
            {lastSessionInfo && (
              <p className="text-muted text-sm mt-1.5">
                <span className="text-dim">{t.last_workout_label}: </span>
                <span className="text-secondary">{lastSessionInfo.relativeLabel}</span>
                <span className="mx-1.5 text-border">·</span>
                <span className="text-secondary">{lastSessionInfo.sessionName}</span>
              </p>
            )}
          </div>
          <button
            onClick={onOpenAchievements}
            className="relative shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-surface active:bg-elevated transition-colors"
            aria-label={t.achievements_title}
          >
            <Trophy className="w-5 h-5 text-brand" />
            {achievementCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-brand text-white text-[0.625rem] font-bold leading-none flex items-center justify-center">
                {achievementCount}
              </span>
            )}
          </button>
        </div>
      </PageHeader>

      {todaysSessions.length > 0 && (
        <div className="px-6 pt-2 space-y-2">
          <LabelOverline className="flex items-center gap-1.5">
            <CalendarCheck className="w-3.5 h-3.5 text-brand" />
            {t.home_today_overline}
          </LabelOverline>
          {todaysSessions.map((s) => (
            <button
              key={`${s.planId}-${s.dayId}`}
              onClick={() => onStartTodaysSession?.(s.planId, s.dayId)}
              className="w-full flex items-center gap-3 rounded-2xl border border-brand/40 bg-brand/10 px-4 py-3 text-left cursor-pointer active:scale-[0.98] transition-transform duration-150"
            >
              <span
                aria-hidden
                className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center flex-shrink-0"
              >
                <Dumbbell className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-semibold text-base truncate">
                  {s.dayName || s.planName}
                </p>
                <p className="text-muted text-sm mt-0.5 truncate">
                  {s.dayName ? `${s.planName} · ` : ''}
                  {coreCountLabel(s.coreCount)}
                  {s.optionalCount > 0 ? ` · ${optionalCountLabel(s.optionalCount)}` : ''}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-brand flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center px-6 gap-4">
        <HeadingXL className="mb-2">{t.home_title}</HeadingXL>
        {hasPlans ? (
          <>
            <Button size="lg" onClick={onFollowPlan}>
              <span className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" /> {t.home_follow_plan}
              </span>
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <ChevronRight className="w-5 h-5" />
              </span>
            </Button>

            <Button variant="secondary" size="lg" onClick={onFreeSession}>
              <span className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5" /> {t.home_free_session}
              </span>
              <span className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center">
                <ChevronRight className="w-5 h-5" />
              </span>
            </Button>
          </>
        ) : (
          <>
            <Button size="lg" onClick={onFreeSession}>
              <span className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5" /> {t.home_start_free_session}
              </span>
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <ChevronRight className="w-5 h-5" />
              </span>
            </Button>

            <Button variant="secondary" size="lg" onClick={onCreatePlan}>
              {t.home_create_plan}
              <span className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center">
                <ChevronRight className="w-5 h-5" />
              </span>
            </Button>
          </>
        )}
      </div>

      <BottomNav active="home" />
    </Page>
  );
}
