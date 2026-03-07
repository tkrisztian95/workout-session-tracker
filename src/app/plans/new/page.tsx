'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { savePlan } from '@/lib/storage';
import type { PlanDay, WorkoutPlan } from '@/lib/types';
import PlanDayEditor from '@/components/PlanDayEditor';
import { useTranslations } from '@/lib/locale-context';
import { Button, CtaBar, FieldLabel, HeadingXL, Input, Page, PageHeader } from '@/components/ui';

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
  const t = useTranslations();
  const router = useRouter();
  const [name, setName] = useState('');
  const [days, setDays] = useState<PlanDay[]>([newDay()]);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setError(t.plan_name_required);
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
    <Page className="pb-32">
      <PageHeader>
        <HeadingXL>{t.new_plan}</HeadingXL>
      </PageHeader>

      <div className="px-6 space-y-6">
        <div>
          <FieldLabel htmlFor="plan-name">{t.plan_name_label}</FieldLabel>
          <Input
            id="plan-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder={t.plan_name_placeholder}
            autoComplete="off"
          />
          {error && <p className="text-danger text-xs mt-1.5">{error}</p>}
        </div>

        <div>
          <p className="block text-secondary text-xs font-medium uppercase tracking-wide mb-3">
            {t.training_days_label}
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
            className="flex items-center gap-2 text-brand text-sm font-semibold mt-4 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t.add_training_day}
          </button>
        </div>
      </div>

      <CtaBar>
        <div className="flex gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex-1 py-4">
            {t.discard}
          </Button>
          <Button onClick={handleSave} className="flex-[2] gap-2">
            {t.save_plan}
          </Button>
        </div>
      </CtaBar>
    </Page>
  );
}
