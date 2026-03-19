'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useTranslations } from '@/lib/locale-context';
import type { WorkoutPlan } from '@/lib/types';
import { BackButton, CardRow, HeadingXL, Page, PageHeader } from '@/components/ui';

export function PlanPickerScreen({
  plans,
  onSelect,
  onBack,
}: {
  plans: WorkoutPlan[];
  onSelect: (plan: WorkoutPlan) => void;
  onBack: () => void;
}) {
  const t = useTranslations();
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
          plans.map((plan) => (
            <CardRow key={plan.id} onClick={() => onSelect(plan)}>
              <div className="text-left">
                <p className="text-foreground font-semibold text-base">{plan.name}</p>
                <p className="text-muted text-sm mt-0.5">
                  {plan.days.length} day{plan.days.length !== 1 ? 's' : ''}
                </p>
              </div>
              <span className="w-7 h-7 rounded-full bg-elevated/50 flex items-center justify-center flex-shrink-0">
                <ChevronRight className="w-4 h-4 text-muted" />
              </span>
            </CardRow>
          ))
        )}
      </div>

      <BottomNav active="home" />
    </Page>
  );
}
