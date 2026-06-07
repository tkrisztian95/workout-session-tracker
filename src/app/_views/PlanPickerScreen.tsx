'use client';

import { ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useTranslations } from '@/lib/locale-context';
import type { WorkoutPlan, WorkoutSession } from '@/lib/types';
import { getPlanExerciseCount, getPlanLastFollowedAt } from '@/lib/plan-list';
import { BackButton, Badge, CardRow, HeadingXL, Page, PageHeader } from '@/components/ui';

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
  const lastFollowedPlanId = getLastFollowedPlanId(plans, sessions);

  const dayCountLabel = (n: number) =>
    (n === 1 ? t.plan_picker_day_count_one : t.plan_picker_day_count).replace('{n}', String(n));
  const exerciseCountLabel = (n: number) =>
    (n === 1 ? t.plan_overview_exercise_count_one : t.plan_overview_exercises_count).replace(
      '{n}',
      String(n),
    );

  return (
    <Page className="pb-20">
      <PageHeader>
        <BackButton onClick={onBack} aria-label="Go back">
          <span className="w-9 h-9 rounded-full flex items-center justify-center bg-surface active:bg-elevated">
            <ChevronLeft className="w-5 h-5 text-secondary" />
          </span>
          <span className="text-sm font-medium text-secondary">{t.back}</span>
        </BackButton>
        <HeadingXL>{t.choose_plan_title}</HeadingXL>
      </PageHeader>

      <div className="flex-1 px-6 space-y-3 overflow-y-auto">
        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 text-center select-none">
            <p className="text-secondary text-base font-medium">{t.no_plans_title}</p>
            <p className="text-muted text-sm mt-1">{t.no_plans_go_to_plans}</p>
          </div>
        ) : (
          plans.map((plan) => {
            const isLastFollowed = plan.id === lastFollowedPlanId;
            return (
              <CardRow key={plan.id} onClick={() => onSelect(plan)}>
                <span
                  aria-hidden
                  className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0"
                >
                  <Dumbbell className="w-5 h-5 text-brand" />
                </span>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-foreground font-semibold text-base truncate">{plan.name}</p>
                    {isLastFollowed && <Badge variant="subtle">{t.last_followed_badge}</Badge>}
                  </div>
                  <p className="text-muted text-sm mt-0.5 truncate">
                    {dayCountLabel(plan.days.length)} ·{' '}
                    {exerciseCountLabel(getPlanExerciseCount(plan))}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-dim flex-shrink-0" />
              </CardRow>
            );
          })
        )}
      </div>

      <BottomNav active="home" />
    </Page>
  );
}
