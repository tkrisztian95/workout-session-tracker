'use client';

import { X } from 'lucide-react';
import type { LoggedSet } from '@/lib/types';

interface Props {
  set: LoggedSet;
  /** When provided the badge renders as an interactive delete button */
  onRemove?: () => void;
  isPendingDelete?: boolean;
  onBlur?: () => void;
  removeLabel?: string;
}

function formatSet(set: LoggedSet): string {
  return set.weight > 0 ? `${set.weight} kg × ${set.reps}` : `× ${set.reps}`;
}

export default function LoggedSetBadge({
  set,
  onRemove,
  isPendingDelete,
  onBlur,
  removeLabel,
}: Props) {
  if (onRemove) {
    return (
      <button
        onClick={onRemove}
        onBlur={onBlur}
        className={`inline-flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5 font-medium border transition-all duration-200 cursor-pointer ${
          isPendingDelete
            ? 'bg-danger/15 border-danger/50 text-danger'
            : 'bg-brand/10 border-brand/40 text-brand'
        }`}
      >
        {isPendingDelete ? (
          <>
            <X className="w-3 h-3" strokeWidth={2.5} />
            {removeLabel}
          </>
        ) : (
          formatSet(set)
        )}
      </button>
    );
  }

  return (
    <span className="text-xs bg-elevated rounded-md px-1.5 py-0.5 text-secondary font-medium">
      {formatSet(set)}
    </span>
  );
}
