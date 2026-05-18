'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Dumbbell,
  ChevronDown,
  CheckCircle,
  RotateCcw,
  Sparkles,
  Copy,
  MoreVertical,
  ChevronRight,
} from 'lucide-react';
import { getPlans, togglePlanStatus, savePlan, duplicatePlan } from '@/lib/storage';
import type { WorkoutPlan } from '@/lib/types';
import type { Muscle } from '@/lib/muscles';
import BottomNav from '@/components/BottomNav';
import { useTranslations } from '@/lib/locale-context';
import MuscleBadge from '@/components/MuscleBadge';
import { EmptyState, HeadingXL, IconButton, Page, PageHeader } from '@/components/ui';
import AiPlanSuggestionModal from '@/components/AiPlanSuggestionModal';

export default function PlansPage() {
  const t = useTranslations();
  const router = useRouter();
  const [plans, setPlans] = useState<WorkoutPlan[]>(() => getPlans());
  const [completedOpen, setCompletedOpen] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  const activePlans = plans.filter((p) => (p.status ?? 'active') === 'active');
  const completedPlans = plans.filter((p) => p.status === 'completed');

  const handleToggleStatus = (id: string) => {
    togglePlanStatus(id);
    setPlans(getPlans());
  };

  const handleDuplicate = (id: string) => {
    const copy = duplicatePlan(id);
    setPlans(getPlans());
    router.push(`/plans/${copy.id}`);
  };

  const handleAiApply = (planData: Omit<WorkoutPlan, 'id' | 'status'>) => {
    const now = new Date().toISOString();
    const newPlan: WorkoutPlan = {
      ...planData,
      id: crypto.randomUUID(),
      status: 'active',
      aiGenerated: true,
      createdAt: planData.createdAt ?? now,
      updatedAt: now,
    };
    savePlan(newPlan);
    setShowAiModal(false);
    router.push(`/plans/${newPlan.id}`);
  };

  return (
    <Page className="pb-24">
      <PageHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <HeadingXL>{t.plans_title}</HeadingXL>
            {activePlans.length > 0 && (
              <p className="text-muted text-sm mt-3">
                {activePlans.length}{' '}
                {activePlans.length !== 1 ? t.plans_active_plans : t.plans_active_plan}
              </p>
            )}
          </div>
          <IconButton
            onClick={() => setShowAiModal(true)}
            aria-label="AI Suggest Plan"
            className="mt-1 border border-border flex-shrink-0"
          >
            <Sparkles className="w-4 h-4 text-brand" />
          </IconButton>
        </div>
      </PageHeader>

      <div className="flex-1 px-6 space-y-3 overflow-y-auto pb-28">
        {activePlans.length === 0 && completedPlans.length === 0 ? (
          <EmptyState
            icon={<Dumbbell className="w-9 h-9 text-border" />}
            title={t.plans_no_plans_title}
            subtitle={t.plans_no_plans_subtitle}
          />
        ) : (
          <>
            {activePlans.length === 0 && (
              <p className="text-muted text-sm py-2">{t.plans_no_active}</p>
            )}
            {activePlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onToggleStatus={() => handleToggleStatus(plan.id)}
                onDuplicate={() => handleDuplicate(plan.id)}
              />
            ))}

            {completedPlans.length > 0 && (
              <div className="pt-2">
                <button
                  onClick={() => setCompletedOpen((o) => !o)}
                  className="flex items-center gap-2 w-full text-left py-3 cursor-pointer"
                >
                  <span className="text-muted text-xs font-medium tracking-widest uppercase">
                    {t.plan_completed_count.replace('{n}', String(completedPlans.length))}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted transition-transform duration-200 ${completedOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {completedOpen && (
                  <div className="space-y-3 mt-1">
                    {completedPlans.map((plan) => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        onToggleStatus={() => handleToggleStatus(plan.id)}
                        onDuplicate={() => handleDuplicate(plan.id)}
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
      <div
        className="fixed bottom-16 left-0 right-0 max-w-md mx-auto px-6 pb-4 pt-6"
        style={{ background: 'linear-gradient(to top, var(--color-base) 60%, transparent)' }}
      >
        <Link
          href="/plans/new"
          className="font-bold rounded-2xl cursor-pointer transition-transform duration-150 active:scale-[0.98] flex items-center justify-center font-condensed bg-brand text-white text-base py-3.5 px-6 w-full gap-2"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          {t.new_plan}
        </Link>
      </div>

      {showAiModal && (
        <AiPlanSuggestionModal onApply={handleAiApply} onClose={() => setShowAiModal(false)} />
      )}

      <BottomNav active="plans" />
    </Page>
  );
}

function getPlanMuscles(plan: WorkoutPlan): Muscle[] {
  const all = [
    ...plan.sharedExercises,
    ...plan.days.flatMap((d) => [...d.coreExercises, ...d.optionalExercises]),
  ];
  return [...new Set(all.map((e) => e.muscle).filter((m): m is Muscle => Boolean(m)))];
}

function PlanCard({
  plan,
  onToggleStatus,
  onDuplicate,
}: {
  plan: WorkoutPlan;
  onToggleStatus: () => void;
  onDuplicate: () => void;
}) {
  const t = useTranslations();
  const isCompleted = plan.status === 'completed';
  const muscles = getPlanMuscles(plan);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={`relative flex items-center rounded-2xl border px-4 py-4 gap-3 ${
        isCompleted ? 'bg-surface/50 border-border/50' : 'bg-surface border-border'
      }`}
    >
      {plan.aiGenerated === true && (
        <div className="absolute -top-px left-3 flex items-center gap-1 bg-brand text-white rounded-b-md px-1.5 py-0.5">
          <Sparkles className="w-2.5 h-2.5" />
          <span className="text-[9px] font-bold tracking-wide uppercase leading-none">AI</span>
        </div>
      )}

      <Link
        href={`/plans/${plan.id}`}
        className="flex-1 min-w-0 active:opacity-70 transition-opacity duration-150"
      >
        <p className={`font-semibold text-base ${isCompleted ? 'text-muted' : 'text-foreground'}`}>
          {plan.name}
        </p>
        <p className="text-muted text-sm mt-0.5">
          {plan.days.length} {plan.days.length !== 1 ? t.training_days : t.training_day}
          {plan.scheduledWeeks && (
            <span className="ml-2">
              · {plan.scheduledWeeks} {plan.scheduledWeeks !== 1 ? 'weeks' : 'week'}
            </span>
          )}
          {isCompleted && <span className="ml-2 text-dim text-xs">· {t.plan_completed_label}</span>}
        </p>
        {muscles.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {muscles.map((m) => (
              <MuscleBadge key={m} muscle={m} />
            ))}
          </div>
        )}
      </Link>

      <div className="relative flex items-center gap-2 flex-shrink-0">
        <ChevronRight className="w-4 h-4 text-muted/40 pointer-events-none" />
        <IconButton
          size="sm"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Plan actions"
          className="bg-elevated/50 active:scale-90"
        >
          <MoreVertical className="w-4 h-4 text-muted" />
        </IconButton>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-20 bg-elevated border border-border rounded-2xl shadow-lg overflow-hidden min-w-[180px]">
              <button
                className="flex items-center gap-3 w-full px-4 py-3.5 text-sm text-foreground active:bg-surface transition-colors cursor-pointer"
                onClick={() => {
                  setMenuOpen(false);
                  onDuplicate();
                }}
              >
                <Copy className="w-4 h-4 text-muted flex-shrink-0" />
                {t.plan_action_duplicate}
              </button>
              <div className="h-px bg-border/50 mx-3" />
              <button
                className="flex items-center gap-3 w-full px-4 py-3.5 text-sm text-foreground active:bg-surface transition-colors cursor-pointer"
                onClick={() => {
                  setMenuOpen(false);
                  onToggleStatus();
                }}
              >
                {isCompleted ? (
                  <>
                    <RotateCcw className="w-4 h-4 text-secondary flex-shrink-0" />
                    {t.plan_action_reactivate}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-muted flex-shrink-0" />
                    {t.plan_action_mark_completed}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
