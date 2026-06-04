'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getPlans, getSessions, savePlan, deletePlan, togglePlanStatus } from '@/lib/storage';
import type { WorkoutPlan, WorkoutSession } from '@/lib/types';
import { getPlanFollowCount, getPlanLastFollowedAt } from '@/lib/plan-list';
import PlanForm from '@/components/PlanForm';
import PlanOverview from '@/components/PlanOverview';
import { useTranslations } from '@/lib/locale-context';
import { Page } from '@/components/ui';

export default function PlanDetailPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [plan, setPlan] = useState<WorkoutPlan | null>(
    () => getPlans().find((p) => p.id === params.id) ?? null,
  );
  const [sessions] = useState<WorkoutSession[]>(() => getSessions());
  const [mode, setMode] = useState<'overview' | 'edit'>('overview');

  if (!plan) {
    return (
      <Page className="items-center justify-center">
        <p className="text-muted">{t.plan_not_found}</p>
      </Page>
    );
  }

  const handleSave = (updated: WorkoutPlan) => {
    savePlan(updated);
    setPlan(updated);
    setMode('overview');
  };

  const handleDelete = () => {
    deletePlan(plan.id);
    router.push('/plans');
  };

  const handleToggleStatus = () => {
    togglePlanStatus(plan.id);
    setPlan(getPlans().find((p) => p.id === plan.id) ?? null);
  };

  if (mode === 'edit') {
    return (
      <PlanForm
        initialPlan={plan}
        onSave={handleSave}
        onCancel={() => setMode('overview')}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        readOnly={plan.status === 'completed'}
      />
    );
  }

  return (
    <PlanOverview
      plan={plan}
      followCount={getPlanFollowCount(plan.id, sessions)}
      lastFollowedAt={getPlanLastFollowedAt(plan.id, sessions)}
      onEdit={() => setMode('edit')}
      onBack={() => router.push('/plans')}
      onDelete={handleDelete}
      onToggleStatus={handleToggleStatus}
    />
  );
}
