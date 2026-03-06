'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { PlanExercise } from '@/lib/types';
import { useExerciseSuggestions } from '@/hooks/useExerciseSuggestions';
import ExerciseSuggestionList from '@/components/ExerciseSuggestionList';
import { useTranslations } from '@/lib/locale-context';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (exercise: Omit<PlanExercise, 'id'>) => void;
  /** When false, hides the role selector and defaults role to 'core' (for shared exercises). Default true. */
  showRole?: boolean;
}

const inputClass =
  'w-full bg-[#111827] text-[#F9FAFB] rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#F97316] border border-[#374151] placeholder-[#4B5563] transition-shadow duration-150';

const labelClass = 'block text-[#9CA3AF] text-xs font-medium uppercase tracking-wide mb-2';

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
    });
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <>
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <div
        className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 bg-[#1F2937] rounded-t-3xl px-6 pt-4 pb-10 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="w-10 h-1 rounded-full bg-[#4B5563] mx-auto mb-5" />

        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-[#F9FAFB] text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
          >
            {t.add_exercise_title}
          </h2>
          <button
            onClick={handleClose}
            aria-label={t.close}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#374151] cursor-pointer hover:bg-[#4B5563] transition-colors duration-150"
          >
            <X className="w-4 h-4 text-[#9CA3AF]" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Name */}
          <div className="relative">
            <label htmlFor="plan-exercise-name" className={labelClass}>
              {t.exercise_name_label}
            </label>
            <input
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
              className={inputClass}
            />
            <ExerciseSuggestionList
              suggestions={suggestions}
              loading={loading}
              onSelect={(n, cat) => {
                setName(n);
                setSelectedCategory(cat);
                clearSuggestions();
              }}
            />
            {selectedCategory && (
              <p className="mt-1.5 text-xs text-[#6B7280]">
                {t.exercise_category_prefix}{' '}
                <span className="text-[#9CA3AF] font-medium">{selectedCategory}</span>
              </p>
            )}
          </div>

          {/* Role toggle */}
          {showRole && (
            <div>
              <p className={labelClass}>{t.exercise_role_label}</p>
              <div className="flex rounded-xl border border-[#374151] overflow-hidden">
                {(['core', 'optional'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`flex-1 py-3 text-sm font-semibold cursor-pointer transition-colors duration-200 capitalize ${
                      role === r
                        ? 'bg-[#F97316] text-white'
                        : 'bg-transparent text-[#6B7280] hover:text-[#9CA3AF]'
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
            <p className={labelClass}>{t.exercise_type_label}</p>
            <div className="flex rounded-xl border border-[#374151] overflow-hidden">
              {(['sets-reps', 'sets-duration', 'duration'] as const).map((typ) => (
                <button
                  key={typ}
                  onClick={() => setType(typ)}
                  className={`flex-1 py-3 text-xs font-semibold cursor-pointer transition-colors duration-200 ${
                    type === typ
                      ? 'bg-[#F97316] text-white'
                      : 'bg-transparent text-[#6B7280] hover:text-[#9CA3AF]'
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
                <label htmlFor="plan-sets" className={labelClass}>
                  {t.exercise_sets_label}
                </label>
                <input
                  id="plan-sets"
                  type="number"
                  inputMode="numeric"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  min={1}
                  className={inputClass}
                />
              </div>
            )}
            {type === 'sets-reps' && (
              <div className="flex-1">
                <label htmlFor="plan-reps" className={labelClass}>
                  {t.exercise_reps_label}
                </label>
                <input
                  id="plan-reps"
                  type="number"
                  inputMode="numeric"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  min={1}
                  className={inputClass}
                />
              </div>
            )}
            {type !== 'sets-reps' && (
              <div className="flex-1">
                <label htmlFor="plan-duration" className={labelClass}>
                  {t.exercise_duration_label}
                </label>
                <input
                  id="plan-duration"
                  type="number"
                  inputMode="numeric"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min={1}
                  className={inputClass}
                />
              </div>
            )}
          </div>

          {/* Scaling note */}
          <div>
            <label htmlFor="scaling-note" className={labelClass}>
              {t.exercise_scaling_note_label}{' '}
              <span className="normal-case text-[#6B7280]">{t.exercise_scaling_note_optional}</span>
            </label>
            <input
              id="scaling-note"
              type="text"
              value={scalingNote}
              onChange={(e) => setScalingNote(e.target.value)}
              placeholder={t.exercise_scaling_note_placeholder}
              className={inputClass}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full bg-[#F97316] text-white font-semibold text-base py-4 rounded-2xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform duration-150 mt-1"
          >
            {t.add_exercise_title}
          </button>
        </div>
      </div>
    </>
  );
}
