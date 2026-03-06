'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Exercise } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (exercise: Omit<Exercise, 'id'>) => void;
}

const inputClass =
  'w-full bg-[#111827] text-[#F9FAFB] rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#F97316] border border-[#374151] placeholder-[#4B5563] transition-shadow duration-150';

const labelClass = 'block text-[#9CA3AF] text-xs font-medium uppercase tracking-wide mb-2';

const TYPE_LABELS: Record<Exercise['type'], string> = {
  'sets-reps': 'Sets & Reps',
  'sets-duration': 'Sets & Duration',
  duration: 'Duration',
};

export default function AddExerciseModal({ isOpen, onClose, onAdd }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<Exercise['type']>('sets-reps');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [duration, setDuration] = useState('60');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd({
      name: trimmed,
      type,
      sets: type !== 'duration' ? Math.max(1, Number(sets) || 1) : undefined,
      reps: type === 'sets-reps' ? Math.max(1, Number(reps) || 10) : undefined,
      duration: type !== 'sets-reps' ? Math.max(1, Number(duration) || 60) : undefined,
    });
    setName('');
    setType('sets-reps');
    setSets('3');
    setReps('10');
    setDuration('60');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Bottom sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 bg-[#1F2937] rounded-t-3xl px-6 pt-4 pb-10 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full bg-[#4B5563] mx-auto mb-5" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-[#F9FAFB] text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
          >
            Add Exercise
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#374151] cursor-pointer hover:bg-[#4B5563] transition-colors duration-150"
          >
            <X className="w-4 h-4 text-[#9CA3AF]" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="exercise-name" className={labelClass}>
              Exercise Name
            </label>
            <input
              id="exercise-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bench Press"
              autoComplete="off"
              className={inputClass}
            />
          </div>

          {/* Type toggle */}
          <div>
            <p className={labelClass}>Type</p>
            <div className="flex rounded-xl border border-[#374151] overflow-hidden">
              {(['sets-reps', 'sets-duration', 'duration'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 py-3 text-xs font-semibold cursor-pointer transition-colors duration-200 ${
                    type === t
                      ? 'bg-[#F97316] text-white'
                      : 'bg-transparent text-[#6B7280] hover:text-[#9CA3AF]'
                  }`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Sets + Reps/Duration */}
          <div className="flex gap-3">
            {type !== 'duration' && (
              <div className="flex-1">
                <label htmlFor="sets" className={labelClass}>
                  Sets
                </label>
                <input
                  id="sets"
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
                <label htmlFor="reps" className={labelClass}>
                  Reps
                </label>
                <input
                  id="reps"
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
                <label htmlFor="duration" className={labelClass}>
                  Seconds
                </label>
                <input
                  id="duration"
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

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full bg-[#F97316] text-white font-semibold text-base py-4 rounded-2xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform duration-150 mt-1"
          >
            Add Exercise
          </button>
        </div>
      </div>
    </>
  );
}
