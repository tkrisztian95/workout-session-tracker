'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Exercise } from '@/lib/types';
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
  onAdd: (exercise: Omit<Exercise, 'id'>) => void;
}

export default function AddExerciseModal({ isOpen, onClose, onAdd }: Props) {
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

  const { suggestions, loading, clearSuggestions } = useExerciseSuggestions(name);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const parsedWeight = weightKg !== '' ? Number(weightKg) : undefined;
    onAdd({
      name: trimmed,
      type,
      sets: type !== 'duration' ? Math.max(1, Number(sets) || 1) : undefined,
      reps: type === 'sets-reps' ? Math.max(1, Number(reps) || 10) : undefined,
      duration:
        type !== 'sets-reps'
          ? Math.max(1, Number(durationMins) * 60 + Number(durationSecs))
          : undefined,
      weightKg: parsedWeight && parsedWeight > 0 ? parsedWeight : undefined,
      category: manualCategory || undefined,
    });
    setName('');
    setType('sets-reps');
    setSets('3');
    setReps('10');
    setDurationMins('1');
    setDurationSecs('0');
    setWeightKg('');
    setSelectedCategory(null);
    setManualCategory('');
    clearSuggestions();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <HeadingXL as="h2" className="text-2xl">
          {t.add_exercise_title}
        </HeadingXL>
        <IconButton
          size="sm"
          onClick={onClose}
          aria-label={t.close}
          className="bg-elevated hover:bg-border-subtle"
        >
          <X className="w-4 h-4 text-secondary" />
        </IconButton>
      </div>

      <div className="space-y-5">
        {/* Name */}
        <div className="relative">
          <FieldLabel htmlFor="exercise-name">{t.exercise_name_label}</FieldLabel>
          <Input
            id="exercise-name"
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
              setManualCategory(cat ?? '');
              clearSuggestions();
            }}
          />
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
          {t.add_exercise_title}
        </Button>
      </div>
    </BottomSheet>
  );
}
