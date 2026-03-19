'use client';

import { ChevronRight, ClipboardList, Dumbbell } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useLocale, useTranslations } from '@/lib/locale-context';
import { Button, HeadingXL, LabelOverline, Page, PageHeader } from '@/components/ui';
import { formatDate } from './helpers';

export function StartScreen({
  hasPlans,
  onFollowPlan,
  onFreeSession,
  onCreatePlan,
  greeting,
  lastSessionInfo,
}: {
  hasPlans: boolean;
  onFollowPlan: () => void;
  onFreeSession: () => void;
  onCreatePlan: () => void;
  greeting?: string;
  lastSessionInfo: { relativeLabel: string; sessionName: string } | null;
}) {
  const t = useTranslations();
  const { locale } = useLocale();
  return (
    <Page className="pb-20">
      <PageHeader>
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
      </PageHeader>

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
