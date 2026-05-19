'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getPlans, savePlan, deletePlan, togglePlanStatus } from '@/lib/storage';
import type { WorkoutPlan } from '@/lib/types';
import PlanForm from '@/components/PlanForm';
import { useTranslations } from '@/lib/locale-context';
import { Page } from '@/components/ui';

export default function PlanDetailPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [plan, setPlan] = useState<WorkoutPlan | null>(
    () => getPlans().find((p) => p.id === params.id) ?? null,
  );

  if (!plan) {
    return (
      <Page className="items-center justify-center">
        <p className="text-muted">{t.plan_not_found}</p>
      </Page>
    );
  }

  const handleSave = (updated: WorkoutPlan) => {
    savePlan(updated);
    router.push('/plans');
  };

  const handleDelete = () => {
    deletePlan(plan.id);
    router.push('/plans');
  };

  const handleToggleStatus = () => {
    togglePlanStatus(plan.id);
    setPlan(getPlans().find((p) => p.id === plan.id) ?? null);
  };

  return (
    <PlanForm
      initialPlan={plan}
      onSave={handleSave}
      onCancel={() => router.back()}
      onDelete={handleDelete}
      onToggleStatus={handleToggleStatus}
      readOnly={plan.status === 'completed'}
    />
  );
}
