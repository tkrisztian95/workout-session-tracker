'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Dumbbell, ChevronRight, ChevronDown, CheckCircle, RotateCcw } from 'lucide-react';
import { getPlans, togglePlanStatus } from '@/lib/storage';
import type { WorkoutPlan } from '@/lib/types';
import BottomNav from '@/components/BottomNav';
import { useTranslations } from '@/lib/locale-context';

export default function PlansPage() {
  const t = useTranslations();
  const [plans, setPlans] = useState<WorkoutPlan[]>(() => getPlans());
  const [completedOpen, setCompletedOpen] = useState(false);

  const activePlans = plans.filter((p) => (p.status ?? 'active') === 'active');
  const completedPlans = plans.filter((p) => p.status === 'completed');

  const handleToggleStatus = (id: string) => {
    togglePlanStatus(id);
    setPlans(getPlans());
  };

  return (
    <main className="min-h-screen bg-[#111827] flex flex-col max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="px-6 pt-14 pb-6">
        <h1
          className="text-[#F9FAFB] text-5xl font-bold leading-none tracking-tight"
          style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
        >
          {t.plans_title}
        </h1>
        {activePlans.length > 0 && (
          <p className="text-[#6B7280] text-sm mt-3">
            {activePlans.length}{' '}
            {activePlans.length !== 1 ? t.plans_active_plans : t.plans_active_plan}
          </p>
        )}
      </div>

      {/* Plan list */}
      <div className="flex-1 px-6 space-y-3 overflow-y-auto">
        {activePlans.length === 0 && completedPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 text-center select-none">
            <div className="w-20 h-20 rounded-full bg-[#1F2937] border border-[#374151] flex items-center justify-center mb-5">
              <Dumbbell className="w-9 h-9 text-[#374151]" />
            </div>
            <p className="text-[#9CA3AF] text-base font-medium">{t.plans_no_plans_title}</p>
            <p className="text-[#6B7280] text-sm mt-1">{t.plans_no_plans_subtitle}</p>
          </div>
        ) : (
          <>
            {activePlans.length === 0 && (
              <p className="text-[#6B7280] text-sm py-2">{t.plans_no_active}</p>
            )}
            {activePlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onToggleStatus={() => handleToggleStatus(plan.id)}
              />
            ))}

            {/* Completed section */}
            {completedPlans.length > 0 && (
              <div className="pt-2">
                <button
                  onClick={() => setCompletedOpen((o) => !o)}
                  className="flex items-center gap-2 w-full text-left py-2 cursor-pointer"
                >
                  <span className="text-[#6B7280] text-xs font-medium uppercase tracking-wide">
                    {t.plan_completed_count.replace('{n}', String(completedPlans.length))}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#6B7280] transition-transform duration-200 ${completedOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {completedOpen && (
                  <div className="space-y-3 mt-1">
                    {completedPlans.map((plan) => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        onToggleStatus={() => handleToggleStatus(plan.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* New Plan CTA */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto px-6 pb-4 pt-6 bg-gradient-to-t from-[#111827] via-[#111827]/90 to-transparent">
        <Link
          href="/plans/new"
          className="w-full bg-[#F97316] text-white font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform duration-150"
          style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          {t.new_plan}
        </Link>
      </div>

      <BottomNav active="plans" />
    </main>
  );
}

function PlanCard({ plan, onToggleStatus }: { plan: WorkoutPlan; onToggleStatus: () => void }) {
  const t = useTranslations();
  const isCompleted = plan.status === 'completed';

  return (
    <div
      className={`flex items-center justify-between rounded-2xl border px-4 py-4 gap-3 ${
        isCompleted ? 'bg-[#1F2937]/50 border-[#374151]/50' : 'bg-[#1F2937] border-[#374151]'
      }`}
    >
      <Link
        href={`/plans/${plan.id}`}
        className="flex-1 min-w-0 active:opacity-70 transition-opacity duration-150"
      >
        <p
          className={`font-semibold text-base ${isCompleted ? 'text-[#6B7280]' : 'text-[#F9FAFB]'}`}
        >
          {plan.name}
        </p>
        <p className="text-[#6B7280] text-sm mt-0.5">
          {plan.days.length} {plan.days.length !== 1 ? t.training_days : t.training_day}
          {isCompleted && (
            <span className="ml-2 text-[#4B5563] text-xs">· {t.plan_completed_label}</span>
          )}
        </p>
      </Link>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onToggleStatus}
          aria-label={isCompleted ? 'Reactivate plan' : 'Mark plan as completed'}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#374151]/50 cursor-pointer active:scale-90 transition-transform duration-150"
        >
          {isCompleted ? (
            <RotateCcw className="w-4 h-4 text-[#9CA3AF]" />
          ) : (
            <CheckCircle className="w-4 h-4 text-[#6B7280]" />
          )}
        </button>
        <Link
          href={`/plans/${plan.id}`}
          tabIndex={-1}
          className="w-7 h-7 rounded-full bg-[#374151]/50 flex items-center justify-center"
        >
          <ChevronRight className="w-4 h-4 text-[#6B7280]" />
        </Link>
      </div>
    </div>
  );
}
