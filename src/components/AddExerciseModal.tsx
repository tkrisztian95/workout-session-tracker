'use client';

import { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import type { Exercise } from '@/lib/types';
import { useExerciseSuggestions } from '@/hooks/useExerciseSuggestions';
import ExerciseSuggestionList from '@/components/ExerciseSuggestionList';
import ExerciseHistoryPicker from '@/components/ExerciseHistoryPicker';
import type { HistoryEntry } from '@/lib/exerciseHistory';
import { useTranslations } from '@/lib/locale-context';
import { WGER_CATEGORIES } from '@/lib/wgerClient';
import { migrateLegacyCategory } from '@/lib/muscles';
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
  const [durationMins, setDurationMins] = useState('1');
  const [durationSecs, setDurationSecs] = useState('0');
  const [weightKg, setWeightKg] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [manualCategory, setManualCategory] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [skipWgerForCurrentName, setSkipWgerForCurrentName] = useState(false);

  const { suggestions, loading, clearSuggestions } = useExerciseSuggestions(
    skipWgerForCurrentName ? '' : name,
  );

  const isEditMode = !!initialValues;

  useEffect(() => {
    if (!isOpen) return;
    if (initialValues) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(initialValues.name);
      setType(initialValues.type);
      setSets(String(initialValues.sets ?? 3));
      setReps(String(initialValues.reps ?? 10));
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
    setDurationMins('1');
    setDurationSecs('0');
    setWeightKg('');
    setSelectedCategory(null);
    setManualCategory('');
    setSkipWgerForCurrentName(false);
    clearSuggestions();
  };

  const applyHistoryEntry = (entry: HistoryEntry) => {
    setName(entry.name);
    setType(entry.type);
    setSets(String(entry.sets ?? 3));
    setReps(String(entry.reps ?? 10));
    const totalSecs = entry.duration ?? 0;
    setDurationMins(String(Math.floor(totalSecs / 60)));
    setDurationSecs(String(totalSecs % 60));
    setWeightKg(entry.weightKg !== undefined ? String(entry.weightKg) : '');
    setManualCategory(entry.muscle ?? '');
    setSelectedCategory(entry.muscle ?? null);
    setSkipWgerForCurrentName(true);
    clearSuggestions();
    setPickerOpen(false);
  };

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const parsedWeight = weightKg !== '' ? Number(weightKg) : undefined;
    const exercise: Omit<Exercise, 'id'> = {
      name: trimmed,
      type,
      sets: type !== 'duration' ? Math.max(1, Number(sets) || 1) : undefined,
      reps: type === 'sets-reps' ? Math.max(1, Number(reps) || 10) : undefined,
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
            <div className="relative">
              <FieldLabel htmlFor="exercise-name">{t.exercise_name_label}</FieldLabel>
              <Input
                id="exercise-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSelectedCategory(null);
                  setSkipWgerForCurrentName(false);
                }}
                onBlur={() => setTimeout(clearSuggestions, 150)}
                placeholder={t.exercise_name_placeholder}
                autoComplete="off"
              />
              <ExerciseSuggestionList
                suggestions={suggestions}
                loading={loading}
                onSelect={(n, cat) => {
                  setName(n);
                  setSelectedCategory(cat);
                  setManualCategory(cat ?? '');
                  clearSuggestions();
                }}
              />
            </div>
            <div className="mt-2">
              {selectedCategory && (
                <p className="mb-1.5 text-xs text-muted">
                  {t.exercise_category_prefix}{' '}
                  <span className="text-secondary font-medium">{selectedCategory}</span>
                </p>
              )}
              <FieldLabel htmlFor="exercise-category">{t.exercise_category_label}</FieldLabel>
              <Select
                id="exercise-category"
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value)}
              >
                <option value="">{t.exercise_category_none}</option>
                {WGER_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {t.category_labels[cat] ?? cat}
                  </option>
                ))}
              </Select>
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

          {/* Sets + Reps/Duration */}
          <div className="flex gap-3">
            {type !== 'duration' && (
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
            {type === 'sets-reps' && (
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

          {/* Weight */}
          {(type === 'sets-reps' || type === 'sets-duration') && (
            <div>
              <FieldLabel htmlFor="exercise-weight">
                Weight (kg) <span className="normal-case text-muted">(optional)</span>
              </FieldLabel>
              <Input
                id="exercise-weight"
                type="number"
                inputMode="decimal"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="e.g. 80"
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
