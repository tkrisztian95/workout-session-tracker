'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import { savePlan } from '@/lib/storage';
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

export default function NewPlanPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [days, setDays] = useState<PlanDay[]>([newDay()]);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setError('Plan name is required');
      return;
    }
    const now = new Date().toISOString();
    const plan: WorkoutPlan = {
      id: crypto.randomUUID(),
      name: name.trim(),
      days,
      sharedExercises: [],
      createdAt: now,
      updatedAt: now,
    };
    savePlan(plan);
    router.push('/plans');
  };

  const updateDay = (index: number, day: PlanDay) => {
    setDays((prev) => prev.map((d, i) => (i === index ? day : d)));
  };

  const removeDay = (index: number) => {
    setDays((prev) => prev.filter((_, i) => i !== index));
  };

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
        <h1
          className="text-[#F9FAFB] text-5xl font-bold leading-none tracking-tight"
          style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
        >
          New Plan
        </h1>
      </div>

      <div className="px-6 space-y-6">
        {/* Plan name */}
        <div>
          <label
            htmlFor="plan-name"
            className="block text-[#9CA3AF] text-xs font-medium uppercase tracking-wide mb-2"
          >
            Plan Name
          </label>
          <input
            id="plan-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="e.g. Strength A/B"
            autoComplete="off"
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
          className="w-full bg-[#F97316] text-white font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-transform duration-150 disabled:opacity-40"
          style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
        >
          Save Plan
        </button>
      </div>
    </main>
  );
}
