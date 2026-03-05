'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Dumbbell, ChevronRight } from 'lucide-react';
import { getPlans } from '@/lib/storage';
import type { WorkoutPlan } from '@/lib/types';
import BottomNav from '@/components/BottomNav';

export default function PlansPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);

  useEffect(() => {
    setPlans(getPlans());
  }, []);

  return (
    <main className="min-h-screen bg-[#111827] flex flex-col max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="px-6 pt-14 pb-6">
        <h1
          className="text-[#F9FAFB] text-5xl font-bold leading-none tracking-tight"
          style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
        >
          My Plans
        </h1>
        {plans.length > 0 && (
          <p className="text-[#6B7280] text-sm mt-3">
            {plans.length} plan{plans.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Plan list */}
      <div className="flex-1 px-6 space-y-3 overflow-y-auto">
        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 text-center select-none">
            <div className="w-20 h-20 rounded-full bg-[#1F2937] border border-[#374151] flex items-center justify-center mb-5">
              <Dumbbell className="w-9 h-9 text-[#374151]" />
            </div>
            <p className="text-[#9CA3AF] text-base font-medium">No plans yet</p>
            <p className="text-[#6B7280] text-sm mt-1">Tap the button below to create your first plan</p>
          </div>
        ) : (
          plans.map((plan) => (
            <Link
              key={plan.id}
              href={`/plans/${plan.id}`}
              className="flex items-center justify-between rounded-2xl bg-[#1F2937] border border-[#374151] px-4 py-4 gap-3 active:scale-[0.98] transition-transform duration-150"
            >
              <div>
                <p className="text-[#F9FAFB] font-semibold text-base">{plan.name}</p>
                <p className="text-[#6B7280] text-sm mt-0.5">
                  {plan.days.length} training day{plan.days.length !== 1 ? 's' : ''}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#4B5563] flex-shrink-0" />
            </Link>
          ))
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
          New Plan
        </Link>
      </div>

      <BottomNav active="plans" />
    </main>
  );
}
