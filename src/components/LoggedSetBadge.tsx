'use client';

import { X } from 'lucide-react';
import type { LoggedSet } from '@/lib/types';
import { formatLoggedSet } from '@/lib/sessionUtils';

interface Props {
  set: LoggedSet;
  /**
   * Target weight (kg) for the exercise. When set, the badge is colour-coded:
   * sets at or above the target read as working sets (green), while lighter
   * sets read as warmups (brand orange). Omit to keep the neutral styling.
   */
  targetWeight?: number;
  /** When provided the badge renders as an interactive delete button */
  onRemove?: () => void;
  isPendingDelete?: boolean;
  onBlur?: () => void;
  removeLabel?: string;
}

export default function LoggedSetBadge({
  set,
  targetWeight,
  onRemove,
  isPendingDelete,
  onBlur,
  removeLabel,
}: Props) {
  // A set "counts" toward the goal once it reaches the target weight; lighter
  // sets are warmups ramping up to it. Mirrors the qualifying-set logic that
  // drives the green target-weight checkmark on the exercise card.
  const isWorkingSet = targetWeight != null && set.weight >= targetWeight;

  if (onRemove) {
    return (
      <button
        onClick={onRemove}
        onBlur={onBlur}
        className={`inline-flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5 font-medium border transition-all duration-200 cursor-pointer ${
          isPendingDelete
            ? 'bg-danger/15 border-danger/50 text-danger'
            : isWorkingSet
              ? 'bg-success/15 border-success/45 text-success'
              : 'bg-brand/10 border-brand/40 text-brand'
        }`}
      >
        {isPendingDelete ? (
          <>
            <X className="w-3 h-3" strokeWidth={2.5} />
            {removeLabel}
          </>
        ) : (
          formatLoggedSet(set)
        )}
      </button>
    );
  }

  return (
    <span
      className={`text-xs rounded-md px-1.5 py-0.5 font-medium ${
        isWorkingSet
          ? 'bg-success/15 text-success'
          : targetWeight != null
            ? 'bg-brand/10 text-brand'
            : 'bg-elevated text-secondary'
      }`}
    >
      {formatLoggedSet(set)}
    </span>
  );
}
