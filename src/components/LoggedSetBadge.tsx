'use client';

import { X } from 'lucide-react';
import type { LoggedSet } from '@/lib/types';
import { formatLoggedSet, type SetStatus } from '@/lib/sessionUtils';

interface Props {
  set: LoggedSet;
  /**
   * Where this set sits against the exercise target. Drives the badge colour:
   * `working` (green) counts toward the goal, `partial` (dashed green) hit the
   * weight but fell short on reps, `warmup` (orange) is below the target
   * weight, and `neutral` is an exercise with no weight target. Defaults to
   * `neutral`.
   */
  status?: SetStatus;
  /** When provided the badge renders as an interactive delete button */
  onRemove?: () => void;
  isPendingDelete?: boolean;
  onBlur?: () => void;
  removeLabel?: string;
}

// Tailwind classes per status — `button` carries a border, `span` doesn't
// (except `partial`, whose dashed outline is the whole point).
const BUTTON_STYLE: Record<SetStatus, string> = {
  working: 'bg-success/15 border-success/45 text-success',
  partial: 'bg-success/5 border-dashed border-success/50 text-success/80',
  warmup: 'bg-brand/10 border-brand/40 text-brand',
  neutral: 'bg-brand/10 border-brand/40 text-brand',
};

const SPAN_STYLE: Record<SetStatus, string> = {
  working: 'bg-success/15 text-success',
  partial: 'bg-success/5 border border-dashed border-success/50 text-success/80',
  warmup: 'bg-brand/10 text-brand',
  neutral: 'bg-elevated text-secondary',
};

export default function LoggedSetBadge({
  set,
  status = 'neutral',
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
          isPendingDelete ? 'bg-danger/15 border-danger/50 text-danger' : BUTTON_STYLE[status]
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
    <span className={`text-xs rounded-md px-1.5 py-0.5 font-medium ${SPAN_STYLE[status]}`}>
      {formatLoggedSet(set)}
    </span>
  );
}
