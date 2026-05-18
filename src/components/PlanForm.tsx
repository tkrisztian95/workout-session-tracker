'use client';

import { useState } from 'react';
import { Plus, Trash2, X, Pencil } from 'lucide-react';
import type { PlanDay, PlanExercise, WorkoutPlan } from '@/lib/types';
import PlanDayEditor from '@/components/PlanDayEditor';
import AddPlanExerciseModal from '@/components/AddPlanExerciseModal';
import DeletePlanConfirmSheet from '@/components/DeletePlanConfirmSheet';
import CategoryBadge from '@/components/CategoryBadge';
import { useTranslations } from '@/lib/locale-context';
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

interface PlanFormProps {
  initialPlan?: WorkoutPlan;
  onSave: (plan: WorkoutPlan) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export default function PlanForm({ initialPlan, onSave, onCancel, onDelete }: PlanFormProps) {
  const t = useTranslations();
  const [name, setName] = useState(initialPlan?.name ?? '');
  const [days, setDays] = useState<PlanDay[]>(initialPlan?.days ?? [newDay()]);
  const [sharedExercises, setSharedExercises] = useState<PlanExercise[]>(
    initialPlan?.sharedExercises ?? [],
  );
  const [scheduledWeeks, setScheduledWeeks] = useState(String(initialPlan?.scheduledWeeks ?? ''));
  const [isSharedModalOpen, setIsSharedModalOpen] = useState(false);
  const [editingShared, setEditingShared] = useState<PlanExercise | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const [weeksError, setWeeksError] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setError(t.plan_name_required);
      return;
    }
    if (scheduledWeeks !== '') {
      const weeks = Number(scheduledWeeks);
      if (!Number.isInteger(weeks) || weeks < 1 || weeks > 52) {
        setWeeksError(t.plan_scheduled_duration_error);
        return;
      }
    }
    const parsedWeeks = scheduledWeeks !== '' ? Number(scheduledWeeks) : undefined;
    const now = new Date().toISOString();
    const plan: WorkoutPlan = {
      id: initialPlan?.id ?? crypto.randomUUID(),
      name: name.trim(),
      days,
      sharedExercises,
      createdAt: initialPlan?.createdAt ?? now,
      updatedAt: now,
      ...(initialPlan?.status !== undefined ? { status: initialPlan.status } : {}),
      ...(initialPlan?.aiGenerated !== undefined ? { aiGenerated: initialPlan.aiGenerated } : {}),
      ...(parsedWeeks !== undefined ? { scheduledWeeks: parsedWeeks } : {}),
    };
    onSave(plan);
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

  const handleEditShared = (updated: Omit<PlanExercise, 'id'>) => {
    if (!editingShared) return;
    const id = editingShared.id;
    setSharedExercises((prev) => prev.map((e) => (e.id === id ? { ...updated, id } : e)));
    setEditingShared(null);
  };

  const removeShared = (id: string) => {
    setSharedExercises((prev) => prev.filter((e) => e.id !== id));
  };

  const isEditing = !!initialPlan;

  return (
    <Page>
      <PageHeader>
        <div className="flex items-start justify-between gap-3">
          <HeadingXL>{isEditing ? t.edit_plan_title : t.new_plan}</HeadingXL>
          {onDelete && (
            <IconButton
              onClick={() => setShowDeleteConfirm(true)}
              aria-label="Delete plan"
              className="mt-1 border border-border hover:border-danger/50"
            >
              <Trash2 className="w-4 h-4 text-muted" />
            </IconButton>
          )}
        </div>
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-6 pb-36 space-y-6">
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
          <FieldLabel htmlFor="plan-weeks">{t.plan_scheduled_duration_label}</FieldLabel>
          <Input
            id="plan-weeks"
            type="number"
            inputMode="numeric"
            value={scheduledWeeks}
            onChange={(e) => {
              setScheduledWeeks(e.target.value);
              setWeeksError('');
            }}
            placeholder={t.plan_scheduled_duration_placeholder}
            min={1}
            max={52}
          />
          {weeksError && <p className="text-danger text-xs mt-1.5">{weeksError}</p>}
        </div>

        <div>
          <p className="block text-secondary text-xs font-medium uppercase tracking-wide mb-1">
            {t.shared_exercises_label} ({sharedExercises.length})
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
                    {ex.muscle && <CategoryBadge category={ex.muscle} />}
                  </div>
                  <p className="text-brand text-xs mt-0.5">{sharedExerciseDetail(ex)}</p>
                  {ex.scalingNote && (
                    <p className="text-muted text-xs mt-0.5 truncate">{ex.scalingNote}</p>
                  )}
                </div>
                <IconButton
                  size="sm"
                  onClick={() => setEditingShared(ex)}
                  aria-label={`Edit ${ex.name}`}
                  className="flex-shrink-0"
                >
                  <Pencil className="w-3.5 h-3.5 text-muted" />
                </IconButton>
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
            {t.training_days_label} ({days.length})
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

      <CtaBar slim>
        <div className="flex gap-3">
          <Button
            variant={isEditing ? 'secondary' : 'ghost'}
            size="sm"
            onClick={onCancel}
            className="flex-1 py-4"
          >
            {t.discard}
          </Button>
          <Button onClick={handleSave} className="flex-[2]">
            {isEditing ? t.save_changes : t.save_plan}
          </Button>
        </div>
      </CtaBar>

      {showDeleteConfirm && onDelete && (
        <DeletePlanConfirmSheet
          planName={name}
          onConfirm={onDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {isSharedModalOpen && (
        <AddPlanExerciseModal
          isOpen
          onClose={() => setIsSharedModalOpen(false)}
          onAdd={handleAddShared}
          showRole={false}
        />
      )}
      {editingShared !== null && (
        <AddPlanExerciseModal
          isOpen
          onClose={() => setEditingShared(null)}
          onAdd={handleAddShared}
          onEdit={handleEditShared}
          initialValues={editingShared}
          showRole={false}
        />
      )}
    </Page>
  );
}
