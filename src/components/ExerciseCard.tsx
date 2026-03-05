'use client';

import { X } from 'lucide-react';
import type { Exercise } from '@/app/page';

interface Props {
  exercise: Exercise;
  onRemove: () => void;
}

export default function ExerciseCard({ exercise, onRemove }: Props) {
  const detail =
    exercise.type === 'reps'
      ? `${exercise.sets} sets × ${exercise.reps} reps`
      : `${exercise.sets} sets · ${exercise.duration}s`;

  return (
    <div className="flex items-center justify-between rounded-2xl bg-[#1F2937] border border-[#374151] px-4 py-4 gap-3">
      <div className="min-w-0">
        <p className="text-[#F9FAFB] font-semibold text-base leading-tight truncate">{exercise.name}</p>
        <p className="text-[#F97316] text-sm mt-1 font-medium">{detail}</p>
      </div>
      <button
        onClick={onRemove}
        aria-label={`Remove ${exercise.name}`}
        className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full bg-[#374151] cursor-pointer active:bg-red-900/40 transition-colors duration-150"
      >
        <X className="w-4 h-4 text-[#9CA3AF]" />
      </button>
    </div>
  );
}
