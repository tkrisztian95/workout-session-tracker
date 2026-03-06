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
      <main className="min-h-screen bg-[#111827] flex items-center justify-center max-w-md mx-auto">
        <p className="text-[#6B7280]">{t.plan_not_found}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#111827] flex flex-col max-w-md mx-auto pb-32">
      {/* Header */}
      <div className="px-6 pt-14 pb-6">
        <div className="flex items-start justify-between gap-3">
          <h1
            className="text-[#F9FAFB] text-5xl font-bold leading-none tracking-tight"
            style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
          >
            {t.edit_plan_title}
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
          <label
            htmlFor="edit-plan-name"
            className="block text-[#9CA3AF] text-xs font-medium uppercase tracking-wide mb-2"
          >
            {t.plan_name_label}
          </label>
          <input
            id="edit-plan-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder={t.plan_name_placeholder}
            className={inputClass}
          />
          {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
        </div>

        {/* Shared exercises */}
        <div>
          <p className="block text-[#9CA3AF] text-xs font-medium uppercase tracking-wide mb-1">
            {t.shared_exercises_label}
          </p>
          <p className="text-[#6B7280] text-xs mb-3">{t.shared_exercises_subtitle}</p>
          <div className="space-y-2">
            {sharedExercises.map((ex) => (
              <div
                key={ex.id}
                className="flex items-center gap-2 bg-[#1F2937] border border-[#374151] rounded-xl px-3 py-2.5"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[#F9FAFB] text-sm font-medium truncate">{ex.name}</p>
                    {ex.category && <CategoryBadge category={ex.category} />}
                  </div>
                  <p className="text-[#F97316] text-xs mt-0.5">{sharedExerciseDetail(ex)}</p>
                  {ex.scalingNote && (
                    <p className="text-[#6B7280] text-xs mt-0.5 truncate">{ex.scalingNote}</p>
                  )}
                </div>
                <button
                  onClick={() => removeShared(ex.id)}
                  aria-label={`Remove ${ex.name}`}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[#374151] cursor-pointer flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5 text-[#9CA3AF]" />
                </button>
              </div>
            ))}
            {sharedExercises.length === 0 && (
              <p className="text-[#6B7280] text-sm">{t.no_shared_exercises}</p>
            )}
          </div>
          <button
            onClick={() => setIsSharedModalOpen(true)}
            className="flex items-center gap-2 text-[#F97316] text-sm font-semibold mt-3 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t.add_shared_exercise}
          </button>
        </div>

        {/* Training days */}
        <div>
          <p className="block text-[#9CA3AF] text-xs font-medium uppercase tracking-wide mb-3">
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
            className="flex items-center gap-2 text-[#F97316] text-sm font-semibold mt-4 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t.add_training_day}
          </button>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-6 pb-10 pt-6 bg-gradient-to-t from-[#111827] via-[#111827]/90 to-transparent">
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 py-4 rounded-2xl border border-[#374151] text-[#9CA3AF] font-semibold cursor-pointer active:scale-[0.98] transition-transform duration-150"
          >
            {t.discard}
          </button>
          <button
            onClick={handleSave}
            className="flex-[2] bg-[#F97316] text-white font-bold text-lg py-4 rounded-2xl cursor-pointer active:scale-[0.98] transition-transform duration-150"
            style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
          >
            {t.save_changes}
          </button>
        </div>
      </div>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end max-w-md mx-auto">
          <div className="w-full bg-[#1F2937] rounded-t-3xl px-6 pt-6 pb-10">
            <h3
              className="text-[#F9FAFB] text-2xl font-bold mb-2"
              style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
            >
              {t.delete_plan_title}
            </h3>
            <p className="text-[#9CA3AF] text-sm mb-6">
              &ldquo;{plan.name}&rdquo; will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3.5 rounded-2xl border border-[#374151] text-[#9CA3AF] font-semibold cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white font-semibold cursor-pointer active:scale-[0.98] transition-transform"
              >
                {t.delete}
              </button>
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
    </main>
  );
}
