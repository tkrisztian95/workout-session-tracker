'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { getPlans, savePlan, deletePlan } from '@/lib/storage';
import type { PlanDay, WorkoutPlan } from '@/lib/types';
import PlanDayEditor from '@/components/PlanDayEditor';

const inputClass =
  'w-full bg-[#1F2937] text-[#F9FAFB] rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#F97316] border border-[#374151] placeholder-[#4B5563]';

function newDay(): PlanDay {
  return {
    id: crypto.randomUUID(),
    name: '',
    weekdays: [],
    coreExercises: [],
    optionalExercises: [],
  };
}

export default function PlanDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [name, setName] = useState('');
  const [days, setDays] = useState<PlanDay[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const found = getPlans().find((p) => p.id === params.id) ?? null;
    if (found) {
      setPlan(found);
      setName(found.name);
      setDays(found.days);
    }
  }, [params.id]);

  const handleSave = () => {
    if (!name.trim()) {
      setError('Plan name is required');
      return;
    }
    if (!plan) return;
    const updated: WorkoutPlan = {
      ...plan,
      name: name.trim(),
      days,
      updatedAt: new Date().toISOString(),
    };
    savePlan(updated);
    router.push('/plans');
  };

  const handleDelete = () => {
    if (!plan) return;
    deletePlan(plan.id);
    router.push('/plans');
  };

  const updateDay = (index: number, day: PlanDay) => {
    setDays((prev) => prev.map((d, i) => (i === index ? day : d)));
  };

  const removeDay = (index: number) => {
    setDays((prev) => prev.filter((_, i) => i !== index));
  };

  if (!plan) {
    return (
      <main className="min-h-screen bg-[#111827] flex items-center justify-center max-w-md mx-auto">
        <p className="text-[#6B7280]">Plan not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#111827] flex flex-col max-w-md mx-auto pb-32">
      {/* Header */}
      <div className="px-6 pt-14 pb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[#6B7280] text-sm mb-5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-start justify-between gap-3">
          <h1
            className="text-[#F9FAFB] text-5xl font-bold leading-none tracking-tight"
            style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
          >
            Edit Plan
          </h1>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="mt-1 w-10 h-10 flex items-center justify-center rounded-full bg-[#1F2937] border border-[#374151] cursor-pointer hover:border-red-500/50 transition-colors"
            aria-label="Delete plan"
          >
            <Trash2 className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Plan name */}
        <div>
          <label htmlFor="edit-plan-name" className="block text-[#9CA3AF] text-xs font-medium uppercase tracking-wide mb-2">
            Plan Name
          </label>
          <input
            id="edit-plan-name"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            placeholder="e.g. Strength A/B"
            className={inputClass}
          />
          {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
        </div>

        {/* Training days */}
        <div>
          <p className="block text-[#9CA3AF] text-xs font-medium uppercase tracking-wide mb-3">
            Training Days
          </p>
          <div className="space-y-4">
            {days.map((day, i) => (
              <PlanDayEditor
                key={day.id}
                day={day}
                onChange={(d) => updateDay(i, d)}
                onRemove={() => removeDay(i)}
              />
            ))}
          </div>
          <button
            onClick={() => setDays((prev) => [...prev, newDay()])}
            className="flex items-center gap-2 text-[#F97316] text-sm font-semibold mt-4 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Training Day
          </button>
        </div>
      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-6 pb-10 pt-6 bg-gradient-to-t from-[#111827] via-[#111827]/90 to-transparent">
        <button
          onClick={handleSave}
          className="w-full bg-[#F97316] text-white font-bold text-lg py-4 rounded-2xl cursor-pointer active:scale-[0.98] transition-transform duration-150"
          style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
        >
          Save Changes
        </button>
      </div>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end max-w-md mx-auto">
          <div className="w-full bg-[#1F2937] rounded-t-3xl px-6 pt-6 pb-10">
            <h3
              className="text-[#F9FAFB] text-2xl font-bold mb-2"
              style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
            >
              Delete Plan?
            </h3>
            <p className="text-[#9CA3AF] text-sm mb-6">
              &ldquo;{plan.name}&rdquo; will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3.5 rounded-2xl border border-[#374151] text-[#9CA3AF] font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white font-semibold cursor-pointer active:scale-[0.98] transition-transform"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
