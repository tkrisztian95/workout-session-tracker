'use client';

import { ChevronLeft, ClipboardList } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useLocale, useTranslations } from '@/lib/locale-context';
import type { WorkoutPlan, WorkoutSession } from '@/lib/types';
import { getPlanFollowCount, getPlanLastFollowedAt } from '@/lib/plan-list';
import PlanCard from '@/components/PlanCard';
import { BackButton, HeadingXL, LabelOverline, Page, PageHeader } from '@/components/ui';
import { formatDate } from './helpers';

/** Id of the plan with the most recent completed session, or null if none followed. */
function getLastFollowedPlanId(plans: WorkoutPlan[], sessions: WorkoutSession[]): string | null {
  let bestId: string | null = null;
  let bestAt: string | null = null;
  for (const plan of plans) {
    const followedAt = getPlanLastFollowedAt(plan.id, sessions);
    if (followedAt && (bestAt === null || followedAt > bestAt)) {
      bestAt = followedAt;
      bestId = plan.id;
    }
  }
  return bestId;
}

export function PlanPickerScreen({
  plans,
  sessions,
  onSelect,
  onBack,
}: {
  plans: WorkoutPlan[];
  sessions: WorkoutSession[];
  onSelect: (plan: WorkoutPlan) => void;
  onBack: () => void;
}) {
  const t = useTranslations();
  const { locale } = useLocale();
  const lastFollowedPlanId = getLastFollowedPlanId(plans, sessions);

  return (
    <Page className="pb-20">
      <PageHeader>
        <BackButton onClick={onBack} aria-label="Go back">
          <span className="w-9 h-9 rounded-full flex items-center justify-center bg-surface active:bg-elevated">
            <ChevronLeft className="w-5 h-5 text-secondary" />
          </span>
          <span className="text-sm font-medium text-secondary">{t.back}</span>
        </BackButton>
        <LabelOverline className="mb-1">{formatDate(locale)}</LabelOverline>
        <HeadingXL>{t.choose_plan_title}</HeadingXL>
      </PageHeader>

      <div className="flex-1 px-6 space-y-3 overflow-y-auto">
        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 text-center select-none">
            <p className="text-secondary text-base font-medium">{t.no_plans_title}</p>
            <p className="text-muted text-sm mt-1">{t.no_plans_go_to_plans}</p>
          </div>
        ) : (
          plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              followCount={getPlanFollowCount(plan.id, sessions)}
              lastFollowed={plan.id === lastFollowedPlanId}
              onSelect={() => onSelect(plan)}
              leadingIcon={<ClipboardList className="w-5 h-5 text-brand" />}
              trailingChevron
              compact
            />
          ))
        )}
      </div>

      <BottomNav active="home" />
    </Page>
  );
}
