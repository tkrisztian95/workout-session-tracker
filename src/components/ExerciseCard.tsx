'use client';

import { Check, X } from 'lucide-react';
import type { Exercise } from '@/lib/types';

interface Props {
  exercise: Exercise;
  onComplete: () => void;
  onDismiss: () => void;
}

function exerciseDetail(ex: Exercise): string {
  if (ex.type === 'sets-reps') return `${ex.sets} sets × ${ex.reps} reps`;
  if (ex.type === 'sets-duration') return `${ex.sets} sets · ${ex.duration}s`;
  const d = ex.duration ?? 0;
  return d >= 60 ? `${Math.round(d / 60)} min` : `${d}s`;
}

export default function ExerciseCard({ exercise, onComplete, onDismiss }: Props) {
  const detail = exerciseDetail(exercise);
  const isDismissed = exercise.dismissed === true;
  const isCompleted = exercise.completed === true;

  return (
    <div
      className={`flex items-center justify-between rounded-2xl border px-4 py-4 gap-3 transition-all duration-200 ${
        isDismissed
          ? 'bg-[#111827] border-[#1F2937] opacity-40'
          : isCompleted
            ? 'bg-[#1F2937] border-[#374151] opacity-70'
            : 'bg-[#1F2937] border-[#374151]'
      }`}
    >
      <div className="min-w-0 flex-1">
        <p
          className={`font-semibold text-base leading-tight truncate ${
            isCompleted || isDismissed ? 'line-through text-[#6B7280]' : 'text-[#F9FAFB]'
          }`}
        >
          {exercise.name}
        </p>
        <p
          className={`text-sm mt-1 font-medium ${isCompleted || isDismissed ? 'text-[#4B5563]' : 'text-[#F97316]'}`}
        >
          {detail}
        </p>
        {exercise.scalingNote && (
          <p className="text-[#6B7280] text-xs mt-1.5 leading-snug">{exercise.scalingNote}</p>
        )}
      </div>

      {!isDismissed && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Tick / complete button */}
          <button
            onClick={onComplete}
            aria-label={
              isCompleted
                ? `Unmark ${exercise.name} as complete`
                : `Mark ${exercise.name} as complete`
            }
            className={`w-11 h-11 flex items-center justify-center rounded-full transition-colors duration-150 cursor-pointer ${
              isCompleted
                ? 'bg-green-500/20 border border-green-500/50 active:bg-green-500/40'
                : 'bg-[#374151] active:bg-green-900/40'
            }`}
          >
            <Check
              className={`w-4 h-4 ${isCompleted ? 'text-green-400' : 'text-[#9CA3AF]'}`}
              strokeWidth={isCompleted ? 3 : 2}
            />
          </button>

          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            aria-label={`Dismiss ${exercise.name}`}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-[#374151] cursor-pointer active:bg-red-900/40 transition-colors duration-150"
          >
            <X className="w-4 h-4 text-[#9CA3AF]" />
          </button>
        </div>
      )}
    </div>
  );
}
