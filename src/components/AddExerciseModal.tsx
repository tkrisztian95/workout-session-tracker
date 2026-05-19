'use client';

import { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import type { Exercise } from '@/lib/types';
import ExerciseHistoryPicker from '@/components/ExerciseHistoryPicker';
import type { HistoryEntry } from '@/lib/exerciseHistory';
import { useTranslations } from '@/lib/locale-context';
import type { Muscle } from '@/lib/muscles';
import { ALL_MUSCLE_GROUPS, MUSCLES_BY_GROUP, migrateLegacyCategory } from '@/lib/muscles';
import { parseRepScheme } from '@/lib/sessionUtils';
import { ModalSheet, Button, FieldLabel, Input, Select } from '@/components/ui';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (exercise: Omit<Exercise, 'id'>) => void;
  onEdit?: (exercise: Omit<Exercise, 'id'>) => void;
  /** Pre-populate fields and switch to edit mode */
  initialValues?: Exercise;
}

export default function AddExerciseModal({ isOpen, onClose, onAdd, onEdit, initialValues }: Props) {
  const t = useTranslations();
  const typeLabels: Record<Exercise['type'], string> = {
    'sets-reps': t.exercise_type_sets_reps,
    'sets-duration': t.exercise_type_sets_duration,
    duration: t.exercise_type_duration,
  };
  const [name, setName] = useState('');
  const [type, setType] = useState<Exercise['type']>('sets-reps');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [repsMode, setRepsMode] = useState<'fixed' | 'variable'>('fixed');
  const [repsScheme, setRepsScheme] = useState('15, 12, 8, 4');
  const [durationMins, setDurationMins] = useState('1');
  const [durationSecs, setDurationSecs] = useState('0');
  const [weightKg, setWeightKg] = useState('');
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
      const hasScheme = (initialValues.repsPerSet?.length ?? 0) > 0;
      setRepsMode(hasScheme ? 'variable' : 'fixed');
      setRepsScheme(hasScheme ? initialValues.repsPerSet!.join(', ') : '15, 12, 8, 4');
      const totalSecs = initialValues.duration ?? 0;
      setDurationMins(String(Math.floor(totalSecs / 60)));
      setDurationSecs(String(totalSecs % 60));
      setWeightKg(initialValues.weightKg !== undefined ? String(initialValues.weightKg) : '');
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
    setRepsMode('fixed');
    setRepsScheme('15, 12, 8, 4');
    setDurationMins('1');
    setDurationSecs('0');
    setWeightKg('');
    setSelectedCategory(null);
    setManualCategory('');
  };

  const applyHistoryEntry = (entry: HistoryEntry) => {
    setName(entry.name);
    setType(entry.type);
    setSets(String(entry.sets ?? 3));
    setReps(String(entry.reps ?? 10));
    const hasScheme = (entry.repsPerSet?.length ?? 0) > 0;
    setRepsMode(hasScheme ? 'variable' : 'fixed');
    setRepsScheme(hasScheme ? entry.repsPerSet!.join(', ') : '15, 12, 8, 4');
    const totalSecs = entry.duration ?? 0;
    setDurationMins(String(Math.floor(totalSecs / 60)));
    setDurationSecs(String(totalSecs % 60));
    setWeightKg(entry.weightKg !== undefined ? String(entry.weightKg) : '');
    setManualCategory(entry.muscle ?? '');
    setSelectedCategory(entry.muscle ?? null);
    setPickerOpen(false);
  };

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const parsedWeight = weightKg !== '' ? Number(weightKg) : undefined;
    const parsedScheme =
      type === 'sets-reps' && repsMode === 'variable' ? parseRepScheme(repsScheme) : [];
    const useScheme = parsedScheme.length >= 2;
    const exercise: Omit<Exercise, 'id'> = {
      name: trimmed,
      type,
      sets:
        type === 'duration'
          ? undefined
          : useScheme
            ? parsedScheme.length
            : Math.max(1, Number(sets) || 1),
      reps:
        type === 'sets-reps' && !useScheme
          ? Math.max(1, Number(parsedScheme[0] ?? reps) || 10)
          : undefined,
      repsPerSet: useScheme ? parsedScheme : undefined,
      duration:
        type !== 'sets-reps'
          ? Math.max(1, Number(durationMins) * 60 + Number(durationSecs))
          : undefined,
      weightKg: parsedWeight && parsedWeight > 0 ? parsedWeight : undefined,
      muscle: migrateLegacyCategory(manualCategory),
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
      <ModalSheet
        isOpen={isOpen && !pickerOpen}
        onClose={handleClose}
        title={isEditMode ? 'Edit exercise' : t.add_exercise_title}
      >
        <div className="flex-1 min-h-0 overflow-y-auto space-y-5">
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
            <FieldLabel htmlFor="exercise-name">{t.exercise_name_label}</FieldLabel>
            <Input
              id="exercise-name"
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
                  <FieldLabel htmlFor="exercise-category">{t.exercise_category_label}</FieldLabel>
                  <Select
                    id="exercise-category"
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

          {/* Reps mode toggle (sets-reps only) */}
          {type === 'sets-reps' && (
            <div className="flex rounded-xl border border-border overflow-hidden">
              {(['fixed', 'variable'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setRepsMode(m)}
                  className={`flex-1 py-2.5 text-xs font-semibold cursor-pointer transition-colors duration-200 ${
                    repsMode === m
                      ? 'bg-brand text-white'
                      : 'bg-transparent text-muted hover:text-secondary'
                  }`}
                >
                  {m === 'fixed' ? t.exercise_reps_mode_fixed : t.exercise_reps_mode_variable}
                </button>
              ))}
            </div>
          )}

          {/* Sets + Reps/Duration */}
          <div className="flex gap-3">
            {type !== 'duration' && !(type === 'sets-reps' && repsMode === 'variable') && (
              <div className="flex-1">
                <FieldLabel htmlFor="sets">{t.exercise_sets_label}</FieldLabel>
                <Input
                  id="sets"
                  type="number"
                  inputMode="numeric"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  min={1}
                />
              </div>
            )}
            {type === 'sets-reps' && repsMode === 'fixed' && (
              <div className="flex-1">
                <FieldLabel htmlFor="reps">{t.exercise_reps_label}</FieldLabel>
                <Input
                  id="reps"
                  type="number"
                  inputMode="numeric"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  min={1}
                />
              </div>
            )}
            {type !== 'sets-reps' && (
              <>
                <div className="flex-1">
                  <FieldLabel htmlFor="duration-mins">{t.min_label}</FieldLabel>
                  <Input
                    id="duration-mins"
                    type="number"
                    inputMode="numeric"
                    value={durationMins}
                    onChange={(e) => setDurationMins(e.target.value)}
                    min={0}
                  />
                </div>
                <div className="flex-1">
                  <FieldLabel htmlFor="duration-secs">{t.exercise_duration_label}</FieldLabel>
                  <Input
                    id="duration-secs"
                    type="number"
                    inputMode="numeric"
                    value={durationSecs}
                    onChange={(e) => setDurationSecs(e.target.value)}
                    min={0}
                    max={59}
                  />
                </div>
              </>
            )}
          </div>

          {/* Per-set scheme input */}
          {type === 'sets-reps' && repsMode === 'variable' && (
            <div>
              <FieldLabel htmlFor="reps-scheme">{t.exercise_reps_scheme_label}</FieldLabel>
              <Input
                id="reps-scheme"
                type="text"
                inputMode="numeric"
                value={repsScheme}
                onChange={(e) => setRepsScheme(e.target.value)}
                placeholder={t.exercise_reps_scheme_placeholder}
                autoComplete="off"
              />
              <p className="mt-1 text-xs text-muted">{t.exercise_reps_scheme_hint}</p>
            </div>
          )}

          {/* Weight */}
          {(type === 'sets-reps' || type === 'sets-duration') && (
            <div>
              <FieldLabel htmlFor="exercise-weight">
                {t.exercise_weight_label}{' '}
                <span className="normal-case text-muted">{t.exercise_scaling_note_optional}</span>
              </FieldLabel>
              <Input
                id="exercise-weight"
                type="number"
                inputMode="decimal"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder={t.exercise_weight_placeholder}
                min={0}
              />
            </div>
          )}

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full mt-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isEditMode ? 'Save changes' : t.add_exercise_title}
          </Button>
        </div>
      </ModalSheet>
      <ExerciseHistoryPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={applyHistoryEntry}
      />
    </>
  );
}
