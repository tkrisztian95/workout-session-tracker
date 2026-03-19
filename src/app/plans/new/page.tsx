'use client';

import { useRouter } from 'next/navigation';
import { savePlan } from '@/lib/storage';
import type { WorkoutPlan } from '@/lib/types';
import PlanForm from '@/components/PlanForm';

export default function NewPlanPage() {
  const router = useRouter();

  const handleSave = (plan: WorkoutPlan) => {
    savePlan(plan);
    router.push('/plans');
  };

  return <PlanForm onSave={handleSave} onCancel={() => router.back()} />;
}
