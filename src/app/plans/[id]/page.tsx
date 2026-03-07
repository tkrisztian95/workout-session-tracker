'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Trash2, X } from 'lucide-react';
import { getPlans, savePlan, deletePlan } from '@/lib/storage';
import type { PlanDay, PlanExercise, WorkoutPlan } from '@/lib/types';
import PlanDayEditor from '@/components/PlanDayEditor';
import AddPlanExerciseModal from '@/components/AddPlanExerciseModal';
import { useTranslations } from '@/lib/locale-context';
import CategoryBadge from '@/components/CategoryBadge';
import {
  Button,
  CtaBar,
  FieldLabel,
  HeadingXL,
  IconButton,
  Input,
  Page,
  PageHeader,
} from '@/components/ui';

function newDay(): PlanDay {
  return {
    id: crypto.randomUUID(),
    name: '',
    weekdays: [],
    coreExercises: [],
    optionalExercises: [],
  };
}

function sharedExerciseDetail(ex: PlanExercise): string {
  if (ex.type === 'sets-reps') return `${ex.sets}×${ex.reps}`;
  if (ex.type === 'sets-duration') return `${ex.sets}×${ex.duration}s`;
  const d = ex.duration ?? 0;
  return d >= 60 ? `${Math.round(d / 60)} min` : `${d}s`;
}

export default function PlanDetailPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [plan] = useState<WorkoutPlan | null>(
    () => getPlans().find((p) => p.id === params.id) ?? null,
  );
  const [name, setName] = useState(() => getPlans().find((p) => p.id === params.id)?.name ?? '');
  const [days, setDays] = useState<PlanDay[]>(
    () => getPlans().find((p) => p.id === params.id)?.days ?? [],
  );
  const [sharedExercises, setSharedExercises] = useState<PlanExercise[]>(
    () => getPlans().find((p) => p.id === params.id)?.sharedExercises ?? [],
  );
  const [isSharedModalOpen, setIsSharedModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setError(t.plan_name_required);
      return;
    }
    if (!plan) return;
    const updated: WorkoutPlan = {
      ...plan,
      name: name.trim(),
      days,
      sharedExercises,
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

  const handleAddShared = (ex: Omit<PlanExercise, 'id'>) => {
    setSharedExercises((prev) => [...prev, { ...ex, id: crypto.randomUUID() }]);
    setIsSharedModalOpen(false);
  };

  const removeShared = (id: string) => {
    setSharedExercises((prev) => prev.filter((e) => e.id !== id));
  };

  if (!plan) {
    return (
      <Page className="items-center justify-center">
        <p className="text-muted">{t.plan_not_found}</p>
      </Page>
    );
  }

  return (
    <Page className="pb-32">
      <PageHeader>
        <div className="flex items-start justify-between gap-3">
          <HeadingXL>{t.edit_plan_title}</HeadingXL>
          <IconButton
            onClick={() => setShowDeleteConfirm(true)}
            aria-label="Delete plan"
            className="mt-1 border border-border hover:border-danger/50"
          >
            <Trash2 className="w-4 h-4 text-muted" />
          </IconButton>
        </div>
      </PageHeader>

      <div className="px-6 space-y-6">
        <div>
          <FieldLabel htmlFor="edit-plan-name">{t.plan_name_label}</FieldLabel>
          <Input
            id="edit-plan-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder={t.plan_name_placeholder}
          />
          {error && <p className="text-danger text-xs mt-1.5">{error}</p>}
        </div>

        <div>
          <p className="block text-secondary text-xs font-medium uppercase tracking-wide mb-1">
            {t.shared_exercises_label}
          </p>
          <p className="text-muted text-xs mb-3">{t.shared_exercises_subtitle}</p>
          <div className="space-y-2">
            {sharedExercises.map((ex) => (
              <div
                key={ex.id}
                className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2.5"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-foreground text-sm font-medium truncate">{ex.name}</p>
                    {ex.category && <CategoryBadge category={ex.category} />}
                  </div>
                  <p className="text-brand text-xs mt-0.5">{sharedExerciseDetail(ex)}</p>
                  {ex.scalingNote && (
                    <p className="text-muted text-xs mt-0.5 truncate">{ex.scalingNote}</p>
                  )}
                </div>
                <IconButton
                  size="sm"
                  onClick={() => removeShared(ex.id)}
                  aria-label={`Remove ${ex.name}`}
                  className="flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5 text-secondary" />
                </IconButton>
              </div>
            ))}
            {sharedExercises.length === 0 && (
              <p className="text-muted text-sm">{t.no_shared_exercises}</p>
            )}
          </div>
          <button
            onClick={() => setIsSharedModalOpen(true)}
            className="flex items-center gap-2 text-brand text-sm font-semibold mt-3 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t.add_shared_exercise}
          </button>
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
          <Button onClick={handleSave} className="flex-[2]">
            {t.save_changes}
          </Button>
        </div>
      </CtaBar>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end max-w-md mx-auto">
          <div className="w-full bg-surface rounded-t-3xl px-6 pt-6 pb-10">
            <HeadingXL as="h3" className="text-2xl mb-2">
              {t.delete_plan_title}
            </HeadingXL>
            <p className="text-secondary text-sm mb-6">
              &ldquo;{plan.name}&rdquo; will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3.5"
              >
                {t.cancel}
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete} className="flex-1 py-3.5">
                {t.delete}
              </Button>
            </div>
          </div>
        </div>
      )}

      <AddPlanExerciseModal
        isOpen={isSharedModalOpen}
        onClose={() => setIsSharedModalOpen(false)}
        onAdd={handleAddShared}
        showRole={false}
      />
    </Page>
  );
}
