'use client';

import { useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Dumbbell,
  Pencil,
  Plus,
  Sparkles,
  X,
} from 'lucide-react';
import { ModalSheet, Button, FieldLabel } from '@/components/ui';
import AddExerciseModal from '@/components/AddExerciseModal';
import AiImportNotesSheet from '@/components/AiImportNotesSheet';
import { HistoryExerciseEditorContent, formatTarget } from '@/components/HistoryExerciseEditor';
import CategoryBadge from '@/components/CategoryBadge';
import { getPlans, getLlmConfig, saveSession } from '@/lib/storage';
import type { Exercise, LlmConfig, PlanExercise, WorkoutPlan, WorkoutSession } from '@/lib/types';
import { useTranslations } from '@/lib/locale-context';
import { formatExerciseDetail } from '@/lib/sessionUtils';

type Step = 'type-select' | 'plan-pick' | 'day-pick' | 'form';

const STEPS: Step[] = ['type-select', 'plan-pick', 'day-pick', 'form'];
const FREE_STEPS: Step[] = ['type-select', 'form'];

interface NewHistorySessionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (sessionId: string) => void;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function planExerciseToExercise(pe: PlanExercise): Exercise {
  return {
    id: crypto.randomUUID(),
    name: pe.name,
    type: pe.type,
    sets: pe.sets,
    reps: pe.reps,
    duration: pe.duration,
    weightKg: pe.weightKg,
    category: pe.category,
    scalingNote: pe.scalingNote,
    completed: false,
  };
}

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`rounded-full transition-all duration-200 ${
            i < current
              ? 'w-1.5 h-1.5 bg-brand/40'
              : i === current
                ? 'w-4 h-1.5 bg-brand'
                : 'w-1.5 h-1.5 bg-border'
          }`}
        />
      ))}
    </div>
  );
}

function StepHeader({
  onBack,
  stepIndex,
  totalSteps,
}: {
  onBack: () => void;
  stepIndex: number;
  totalSteps: number;
}) {
  return (
    <div className="flex items-center mb-5">
      <button
        onClick={onBack}
        aria-label="Back"
        className="w-9 h-9 rounded-full flex items-center justify-center bg-elevated active:bg-border transition-colors duration-150 flex-shrink-0 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4 text-secondary" />
      </button>
      <div className="flex-1 flex justify-center">
        <StepDots current={stepIndex} total={totalSteps} />
      </div>
      {/* Spacer matches back button width so dots are truly centered */}
      <div className="w-9 flex-shrink-0" />
    </div>
  );
}

export default function NewHistorySessionSheet({
  isOpen,
  onClose,
  onSaved,
}: NewHistorySessionSheetProps) {
  const t = useTranslations();

  const [step, setStep] = useState<Step>('type-select');
  const [isPlanFlow, setIsPlanFlow] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  const [date, setDate] = useState(todayIso);
  const [durationMins, setDurationMins] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportSheetOpen, setIsImportSheetOpen] = useState(false);
  const [pendingExercise, setPendingExercise] = useState<Exercise | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [llmConfig] = useState<LlmConfig | null>(() => getLlmConfig());

  function reset() {
    setStep('type-select');
    setIsPlanFlow(false);
    setSelectedPlan(null);
    setSelectedDayId(null);
    setDate(todayIso());
    setDurationMins('');
    setExercises([]);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleAddExercise(ex: Omit<Exercise, 'id'>) {
    const newEx: Exercise = { ...ex, id: crypto.randomUUID(), completed: true };
    setPendingExercise(newEx);
    setIsAddModalOpen(false);
  }

  function handleExecutionConfirm(patch: Partial<Exercise>) {
    if (pendingExercise) {
      setExercises((prev) => [...prev, { ...pendingExercise, ...patch }]);
      setPendingExercise(null);
    } else if (editingExercise) {
      const exId = editingExercise.id;
      setExercises((prev) => prev.map((ex) => (ex.id === exId ? { ...ex, ...patch } : ex)));
      setEditingExercise(null);
    }
  }

  function handleExecutionCancel() {
    setPendingExercise(null);
    setEditingExercise(null);
  }

  function removeExercise(id: string) {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
  }

  function handleSave() {
    const mins = parseInt(durationMins) || 60;
    const startedAt = new Date(`${date}T09:00:00`).toISOString();
    const completedAt = new Date(new Date(startedAt).getTime() + mins * 60000).toISOString();

    const session: WorkoutSession = {
      id: crypto.randomUUID(),
      startedAt,
      completedAt,
      exercises,
      ...(selectedPlan && selectedDayId
        ? { planId: selectedPlan.id, planDayId: selectedDayId }
        : {}),
    };

    saveSession(session);
    reset();
    onSaved(session.id);
  }

  function handleDaySelect(dayId: string) {
    if (!selectedPlan) return;
    const day = selectedPlan.days.find((d) => d.id === dayId);
    if (!day) return;

    const prefilled: Exercise[] = [
      ...selectedPlan.sharedExercises.map(planExerciseToExercise),
      ...day.coreExercises.map(planExerciseToExercise),
    ];

    setSelectedDayId(dayId);
    setExercises(prefilled);
    setStep('form');
  }

  // Step indices for dots
  const planSteps = STEPS;
  const freeSteps = FREE_STEPS;
  const activeSteps = isPlanFlow ? planSteps : freeSteps;
  const stepIndex = activeSteps.indexOf(step);
  const totalSteps = activeSteps.length;

  const editorExercise = pendingExercise ?? editingExercise;
  const selectedDay = selectedPlan?.days.find((d) => d.id === selectedDayId);

  const stepTitle = editorExercise
    ? editorExercise.name
    : step === 'plan-pick'
      ? t.new_history_plan_pick_title
      : step === 'day-pick'
        ? t.new_history_day_pick_title
        : step === 'form'
          ? t.new_history_session_title
          : t.new_history_session_type_title;

  const stepSubtitle = editorExercise ? (formatTarget(editorExercise) ?? undefined) : undefined;

  return (
    <>
      <ModalSheet
        isOpen={isOpen}
        onClose={editorExercise ? handleExecutionCancel : handleClose}
        title={stepTitle}
        subtitle={stepSubtitle}
      >
        {/* ── Step: type-select ─────────────────────────────────────────────── */}
        {step === 'type-select' && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <p className="text-secondary text-sm mb-5">{t.new_history_session_type_subtitle}</p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsPlanFlow(true);
                  setStep('plan-pick');
                }}
                className="w-full flex items-center gap-4 rounded-2xl bg-surface border border-border px-4 py-4 active:scale-[0.98] transition-transform duration-150 cursor-pointer text-left"
              >
                <span className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="w-5 h-5 text-brand" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground text-sm">
                    {t.new_history_session_from_plan}
                  </p>
                  <p className="text-secondary text-xs mt-0.5">
                    {t.new_history_session_from_plan_desc}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
              </button>

              <button
                onClick={() => {
                  setIsPlanFlow(false);
                  setStep('form');
                }}
                className="w-full flex items-center gap-4 rounded-2xl bg-surface border border-border px-4 py-4 active:scale-[0.98] transition-transform duration-150 cursor-pointer text-left"
              >
                <span className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="w-5 h-5 text-secondary" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground text-sm">
                    {t.new_history_session_free}
                  </p>
                  <p className="text-secondary text-xs mt-0.5">{t.new_history_session_free_desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
              </button>

              {llmConfig && (
                <button
                  onClick={() => setIsImportSheetOpen(true)}
                  className="w-full flex items-center gap-4 rounded-2xl bg-surface border border-border px-4 py-4 active:scale-[0.98] transition-transform duration-150 cursor-pointer text-left"
                >
                  <span className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-brand" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-sm">
                      {t.new_history_session_ai_import}
                    </p>
                    <p className="text-secondary text-xs mt-0.5">
                      {t.new_history_session_ai_import_desc}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Step: plan-pick ───────────────────────────────────────────────── */}
        {step === 'plan-pick' && (
          <PlanPickStep
            onBack={() => {
              setIsPlanFlow(false);
              setStep('type-select');
            }}
            onSelect={(plan) => {
              setSelectedPlan(plan);
              setStep('day-pick');
            }}
            stepIndex={stepIndex}
            totalSteps={totalSteps}
            t={t}
          />
        )}

        {/* ── Step: day-pick ────────────────────────────────────────────────── */}
        {step === 'day-pick' && selectedPlan && (
          <DayPickStep
            plan={selectedPlan}
            onBack={() => setStep('plan-pick')}
            onSelect={handleDaySelect}
            stepIndex={stepIndex}
            totalSteps={totalSteps}
            t={t}
          />
        )}

        {/* ── Step: form ────────────────────────────────────────────────────── */}
        {step === 'form' && (
          <div className="flex-1 min-h-0 flex flex-col">
            {editorExercise ? (
              /* Inline editor — no second modal stacking on top */
              <HistoryExerciseEditorContent
                key={editorExercise.id}
                exercise={editorExercise}
                onConfirm={handleExecutionConfirm}
                onCancel={handleExecutionCancel}
              />
            ) : (
              <>
                <StepHeader
                  onBack={() => {
                    setExercises([]);
                    setStep(isPlanFlow ? 'day-pick' : 'type-select');
                  }}
                  stepIndex={stepIndex}
                  totalSteps={totalSteps}
                />

                {/* Plan context pill */}
                {selectedPlan && selectedDay && (
                  <div className="flex items-center gap-2 bg-brand/8 rounded-xl px-3 py-2 mb-4">
                    <Dumbbell className="w-3.5 h-3.5 text-brand flex-shrink-0" />
                    <p className="text-brand text-xs font-medium truncate">
                      {selectedPlan.name} · {selectedDay.name}
                    </p>
                  </div>
                )}

                <div className="space-y-3 mb-5 flex-shrink-0">
                  <div>
                    <FieldLabel htmlFor="session-date">
                      {t.new_history_session_date_label}
                    </FieldLabel>
                    <input
                      id="session-date"
                      type="date"
                      value={date}
                      max={todayIso()}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-lg border border-border bg-base px-3 py-2.5 text-sm text-foreground"
                    />
                  </div>

                  <div>
                    <FieldLabel htmlFor="session-duration">
                      {t.new_history_session_duration_label}
                    </FieldLabel>
                    <input
                      id="session-duration"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      placeholder="60"
                      value={durationMins}
                      onChange={(e) => setDurationMins(e.target.value)}
                      className="w-full rounded-lg border border-border bg-base px-3 py-2.5 text-sm text-foreground"
                    />
                  </div>
                </div>

                {/* Exercise list — only this section scrolls */}
                <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pb-2">
                  {exercises.length > 0 && (
                    <p className="text-xs font-medium text-secondary uppercase tracking-wide mb-1">
                      {t.new_history_exercises_label} ({exercises.length})
                    </p>
                  )}
                  {exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="flex items-center gap-3 rounded-xl bg-surface border border-border px-3 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm text-foreground">{exercise.name}</p>
                          {exercise.category && <CategoryBadge category={exercise.category} />}
                        </div>
                        <p className="text-muted text-xs mt-0.5">
                          {formatExerciseDetail(exercise)}
                        </p>
                        {exercise.loggedSets && exercise.loggedSets.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {exercise.loggedSets.map((s, i) => (
                              <span
                                key={i}
                                className="text-xs bg-elevated rounded-md px-1.5 py-0.5 text-secondary font-medium"
                              >
                                {s.weight}kg×{s.reps}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button
                          onClick={() => setEditingExercise(exercise)}
                          aria-label={`Edit ${exercise.name}`}
                          className="w-10 h-10 flex items-center justify-center rounded-full active:bg-elevated cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5 text-muted" />
                        </button>
                        <button
                          onClick={() => removeExercise(exercise.id)}
                          aria-label={`Remove ${exercise.name}`}
                          className="w-10 h-10 flex items-center justify-center rounded-full active:bg-elevated cursor-pointer"
                        >
                          <X className="w-4 h-4 text-dim" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 text-brand text-sm font-semibold cursor-pointer pt-1 active:opacity-70 transition-opacity duration-150"
                  >
                    <Plus className="w-4 h-4" />
                    {t.add_exercise_title}
                  </button>
                </div>

                {/* CTA buttons — always visible at the bottom */}
                <div className="flex gap-3 pt-4 flex-shrink-0">
                  <Button variant="ghost" onClick={handleClose} className="flex-1 py-3.5">
                    {t.cancel}
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={exercises.length === 0}
                    className="flex-1 py-3.5"
                  >
                    {t.save_label}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </ModalSheet>

      <AddExerciseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddExercise}
      />

      <AiImportNotesSheet
        isOpen={isImportSheetOpen}
        onClose={() => setIsImportSheetOpen(false)}
        onConfirm={(sessions) => {
          sessions.forEach((s) => saveSession(s));
          setIsImportSheetOpen(false);
          reset();
          onSaved(sessions[sessions.length - 1].id);
        }}
      />
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

type TranslationProxy = ReturnType<typeof useTranslations>;

function PlanPickStep({
  onBack,
  onSelect,
  stepIndex,
  totalSteps,
  t,
}: {
  onBack: () => void;
  onSelect: (plan: WorkoutPlan) => void;
  stepIndex: number;
  totalSteps: number;
  t: TranslationProxy;
}) {
  const [plans] = useState<WorkoutPlan[]>(() => getPlans());

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <StepHeader onBack={onBack} stepIndex={stepIndex} totalSteps={totalSteps} />

      {plans.length === 0 ? (
        <div className="py-6 text-center">
          <CalendarDays className="w-8 h-8 text-border mx-auto mb-2" />
          <p className="text-secondary text-sm">{t.new_history_no_plans}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {plans.map((plan) => {
            const dayCount = plan.days.length;
            const exerciseCount =
              plan.days.reduce(
                (sum, d) => sum + d.coreExercises.length + d.optionalExercises.length,
                0,
              ) + plan.sharedExercises.length;
            return (
              <button
                key={plan.id}
                onClick={() => onSelect(plan)}
                className="w-full flex items-center gap-3 rounded-2xl bg-surface border border-border px-4 py-3.5 active:scale-[0.98] transition-transform duration-150 cursor-pointer text-left"
              >
                <span className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="w-4 h-4 text-brand" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground text-sm truncate">{plan.name}</p>
                  <p className="text-secondary text-xs mt-0.5">
                    {dayCount} {dayCount !== 1 ? t.training_days : t.training_day}
                    {exerciseCount > 0 && ` · ${exerciseCount} ${t.exercise_plural}`}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DayPickStep({
  plan,
  onBack,
  onSelect,
  stepIndex,
  totalSteps,
  t,
}: {
  plan: WorkoutPlan;
  onBack: () => void;
  onSelect: (dayId: string) => void;
  stepIndex: number;
  totalSteps: number;
  t: TranslationProxy;
}) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <StepHeader onBack={onBack} stepIndex={stepIndex} totalSteps={totalSteps} />

      <div className="flex items-center gap-2 bg-brand/8 rounded-xl px-3 py-2 mb-4">
        <Dumbbell className="w-3.5 h-3.5 text-brand flex-shrink-0" />
        <p className="text-brand text-xs font-medium truncate">{plan.name}</p>
      </div>

      {plan.days.length === 0 ? (
        <div className="py-6 text-center">
          <CalendarDays className="w-8 h-8 text-border mx-auto mb-2" />
          <p className="text-secondary text-sm">{t.new_history_no_days}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {plan.days.map((day) => {
            const coreCount = day.coreExercises.length + plan.sharedExercises.length;
            const optCount = day.optionalExercises.length;
            return (
              <button
                key={day.id}
                onClick={() => onSelect(day.id)}
                className="w-full flex items-center gap-3 rounded-2xl bg-surface border border-border px-4 py-3.5 active:scale-[0.98] transition-transform duration-150 cursor-pointer text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground text-sm">{day.name}</p>
                  <p className="text-secondary text-xs mt-0.5">
                    {coreCount} {t.exercise_plural}
                    {optCount > 0 && ` · +${optCount} ${t.new_history_optional_label}`}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
