'use client';

import { useState, useEffect } from 'react';
import { History, X } from 'lucide-react';
import type { PlanExercise } from '@/lib/types';
import ExerciseHistoryPicker from '@/components/ExerciseHistoryPicker';
import type { HistoryEntry } from '@/lib/exerciseHistory';
import { useTranslations } from '@/lib/locale-context';
import type { Muscle } from '@/lib/muscles';
import { ALL_MUSCLE_GROUPS, MUSCLES_BY_GROUP, migrateLegacyCategory } from '@/lib/muscles';
import {
  BottomSheet,
  Button,
  FieldLabel,
  HeadingXL,
  IconButton,
  Input,
  Select,
} from '@/components/ui';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (exercise: Omit<PlanExercise, 'id'>) => void;
  onEdit?: (exercise: Omit<PlanExercise, 'id'>) => void;
  /** Pre-populate fields and switch to edit mode */
  initialValues?: PlanExercise;
  /** When false, hides the role selector and defaults role to 'core' (for shared exercises). Default true. */
  showRole?: boolean;
}

export default function AddPlanExerciseModal({
  isOpen,
  onClose,
  onAdd,
  onEdit,
  initialValues,
  showRole = true,
}: Props) {
  const t = useTranslations();
  const typeLabels: Record<PlanExercise['type'], string> = {
    'sets-reps': t.exercise_type_sets_reps,
    'sets-duration': t.exercise_type_sets_duration,
    duration: t.exercise_type_duration,
  };
  const [name, setName] = useState('');
  const [type, setType] = useState<PlanExercise['type']>('sets-reps');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [duration, setDuration] = useState('60');
  const [role, setRole] = useState<PlanExercise['role']>('core');
  const [weightKg, setWeightKg] = useState('');
  const [scalingNote, setScalingNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Muscle | null>(null);
  const [manualCategory, setManualCategory] = useState<Muscle | ''>('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const isEditMode = !!initialValues;

  useEffect(() => {
    if (!isOpen) return;
    if (initialValues) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(initialValues.name);
      setType(initialValues.type);
      setSets(String(initialValues.sets ?? 3));
      setReps(String(initialValues.reps ?? 10));
      setDuration(String(initialValues.duration ?? 60));
      setRole(initialValues.role);
      setWeightKg(initialValues.weightKg !== undefined ? String(initialValues.weightKg) : '');
      setScalingNote(initialValues.scalingNote ?? '');
      setSelectedCategory(null);
      setManualCategory(initialValues.muscle ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const reset = () => {
    setName('');
    setType('sets-reps');
    setSets('3');
    setReps('10');
    setDuration('60');
    setRole('core');
    setWeightKg('');
    setScalingNote('');
    setSelectedCategory(null);
    setManualCategory('');
  };

  const applyHistoryEntry = (entry: HistoryEntry) => {
    setName(entry.name);
    setType(entry.type);
    setSets(String(entry.sets ?? 3));
    setReps(String(entry.reps ?? 10));
    setDuration(String(entry.duration ?? 60));
    setWeightKg(entry.weightKg !== undefined ? String(entry.weightKg) : '');
    setManualCategory(entry.muscle ?? '');
    setSelectedCategory(entry.muscle ?? null);
    setPickerOpen(false);
  };

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const parsedWeight = weightKg !== '' ? Number(weightKg) : undefined;
    const exercise: Omit<PlanExercise, 'id'> = {
      name: trimmed,
      type,
      sets: type !== 'duration' ? Math.max(1, Number(sets) || 1) : undefined,
      reps: type === 'sets-reps' ? Math.max(1, Number(reps) || 10) : undefined,
      duration: type !== 'sets-reps' ? Math.max(1, Number(duration) || 60) : undefined,
      weightKg: parsedWeight && parsedWeight > 0 ? parsedWeight : undefined,
      role: showRole ? role : 'core',
      scalingNote: scalingNote.trim() || undefined,
      muscle: migrateLegacyCategory(selectedCategory ?? manualCategory),
    };
    if (isEditMode && onEdit) {
      onEdit(exercise);
    } else {
      onAdd(exercise);
    }
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <>
      <BottomSheet isOpen={isOpen && !pickerOpen} onClose={handleClose}>
        <div className="flex items-center justify-between mb-6">
          <HeadingXL as="h2" className="text-2xl">
            {isEditMode ? 'Edit exercise' : t.add_exercise_title}
          </HeadingXL>
          <IconButton
            size="sm"
            onClick={handleClose}
            aria-label={t.close}
            className="bg-elevated hover:bg-border-subtle"
          >
            <X className="w-4 h-4 text-secondary" />
          </IconButton>
        </div>

        <div className="space-y-5">
          {/* Pick from history */}
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border bg-elevated text-secondary text-sm font-semibold cursor-pointer active:bg-border-subtle transition-colors duration-150"
          >
            <History className="w-4 h-4" />
            {t.history_picker_open_button}
          </button>

          {/* Name */}
          <div>
            <FieldLabel htmlFor="plan-exercise-name">{t.exercise_name_label}</FieldLabel>
            <Input
              id="plan-exercise-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSelectedCategory(null);
              }}
              placeholder={t.exercise_name_placeholder}
              autoComplete="off"
            />
            <div className="mt-2">
              {selectedCategory ? (
                <p className="mb-1.5 text-xs text-muted">
                  {t.exercise_category_prefix}{' '}
                  <span className="text-secondary font-medium">
                    {t.muscle_labels[selectedCategory] ?? selectedCategory}
                  </span>
                </p>
              ) : (
                <>
                  <FieldLabel htmlFor="plan-exercise-category">
                    {t.exercise_category_label}
                  </FieldLabel>
                  <Select
                    id="plan-exercise-category"
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value as Muscle | '')}
                  >
                    <option value="">{t.exercise_category_none}</option>
                    {ALL_MUSCLE_GROUPS.map((group) => (
                      <optgroup key={group} label={t.muscle_group_labels[group]}>
                        {MUSCLES_BY_GROUP[group].map((m) => (
                          <option key={m} value={m}>
                            {t.muscle_labels[m] ?? m}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </Select>
                </>
              )}
            </div>
          </div>

          {/* Role toggle */}
          {showRole && (
            <div>
              <p className="text-secondary text-xs font-medium uppercase tracking-wide mb-2">
                {t.exercise_role_label}
              </p>
              <div className="flex rounded-xl border border-border overflow-hidden">
                {(['core', 'optional'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`flex-1 py-3 text-sm font-semibold cursor-pointer transition-colors duration-200 capitalize ${
                      role === r
                        ? 'bg-brand text-white'
                        : 'bg-transparent text-muted hover:text-secondary'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Type toggle */}
          <div>
            <p className="text-secondary text-xs font-medium uppercase tracking-wide mb-2">
              {t.exercise_type_label}
            </p>
            <div className="flex rounded-xl border border-border overflow-hidden">
              {(['sets-reps', 'sets-duration', 'duration'] as const).map((typ) => (
                <button
                  key={typ}
                  onClick={() => setType(typ)}
                  className={`flex-1 py-3 text-xs font-semibold cursor-pointer transition-colors duration-200 ${
                    type === typ
                      ? 'bg-brand text-white'
                      : 'bg-transparent text-muted hover:text-secondary'
                  }`}
                >
                  {typeLabels[typ]}
                </button>
              ))}
            </div>
          </div>

          {/* Sets + Reps/Duration */}
          <div className="flex gap-3">
            {type !== 'duration' && (
              <div className="flex-1">
                <FieldLabel htmlFor="plan-sets">{t.exercise_sets_label}</FieldLabel>
                <Input
                  id="plan-sets"
                  type="number"
                  inputMode="numeric"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  min={1}
                />
              </div>
            )}
            {type === 'sets-reps' && (
              <div className="flex-1">
                <FieldLabel htmlFor="plan-reps">{t.exercise_reps_label}</FieldLabel>
                <Input
                  id="plan-reps"
                  type="number"
                  inputMode="numeric"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  min={1}
                />
              </div>
            )}
            {type !== 'sets-reps' && (
              <div className="flex-1">
                <FieldLabel htmlFor="plan-duration">{t.exercise_duration_label}</FieldLabel>
                <Input
                  id="plan-duration"
                  type="number"
                  inputMode="numeric"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min={1}
                />
              </div>
            )}
          </div>

          {/* Weight */}
          {(type === 'sets-reps' || type === 'sets-duration') && (
            <div>
              <FieldLabel htmlFor="plan-weight">
                {t.exercise_weight_label}{' '}
                <span className="normal-case text-muted">{t.exercise_scaling_note_optional}</span>
              </FieldLabel>
              <Input
                id="plan-weight"
                type="number"
                inputMode="decimal"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder={t.exercise_weight_placeholder}
                min={0}
              />
            </div>
          )}

          {/* Scaling note */}
          <div>
            <FieldLabel htmlFor="scaling-note">
              {t.exercise_scaling_note_label}{' '}
              <span className="normal-case text-muted">{t.exercise_scaling_note_optional}</span>
            </FieldLabel>
            <Input
              id="scaling-note"
              type="text"
              value={scalingNote}
              onChange={(e) => setScalingNote(e.target.value)}
              placeholder={t.exercise_scaling_note_placeholder}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full mt-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isEditMode ? 'Save changes' : t.add_exercise_title}
          </Button>
        </div>
      </BottomSheet>
      <ExerciseHistoryPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={applyHistoryEntry}
      />
    </>
  );
}
