'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { PlanExercise } from '@/lib/types';
import { useExerciseSuggestions } from '@/hooks/useExerciseSuggestions';
import ExerciseSuggestionList from '@/components/ExerciseSuggestionList';
import { useTranslations } from '@/lib/locale-context';
import { WGER_CATEGORIES } from '@/lib/wgerClient';
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
  /** When false, hides the role selector and defaults role to 'core' (for shared exercises). Default true. */
  showRole?: boolean;
}

export default function AddPlanExerciseModal({ isOpen, onClose, onAdd, showRole = true }: Props) {
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
  const [scalingNote, setScalingNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [manualCategory, setManualCategory] = useState('');

  const { suggestions, loading, clearSuggestions } = useExerciseSuggestions(name);

  const reset = () => {
    setName('');
    setType('sets-reps');
    setSets('3');
    setReps('10');
    setDuration('60');
    setRole('core');
    setScalingNote('');
    setSelectedCategory(null);
    setManualCategory('');
    clearSuggestions();
  };

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd({
      name: trimmed,
      type,
      sets: type !== 'duration' ? Math.max(1, Number(sets) || 1) : undefined,
      reps: type === 'sets-reps' ? Math.max(1, Number(reps) || 10) : undefined,
      duration: type !== 'sets-reps' ? Math.max(1, Number(duration) || 60) : undefined,
      role: showRole ? role : 'core',
      scalingNote: scalingNote.trim() || undefined,
      category: (selectedCategory ?? manualCategory) || undefined,
    });
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose}>
      <div className="flex items-center justify-between mb-6">
        <HeadingXL as="h2" className="text-2xl">
          {t.add_exercise_title}
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
        {/* Name */}
        <div className="relative">
          <FieldLabel htmlFor="plan-exercise-name">{t.exercise_name_label}</FieldLabel>
          <Input
            id="plan-exercise-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSelectedCategory(null);
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
              setManualCategory('');
              clearSuggestions();
            }}
          />
          {selectedCategory ? (
            <p className="mt-1.5 text-xs text-muted">
              {t.exercise_category_prefix}{' '}
              <span className="text-secondary font-medium">{selectedCategory}</span>
            </p>
          ) : (
            <div className="mt-2">
              <FieldLabel htmlFor="plan-exercise-category">{t.exercise_category_label}</FieldLabel>
              <Select
                id="plan-exercise-category"
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
          )}
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
          {t.add_exercise_title}
        </Button>
      </div>
    </BottomSheet>
  );
}
