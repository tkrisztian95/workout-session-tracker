'use client';

import { X } from 'lucide-react';
import type { LoggedSet } from '@/lib/types';
import { formatLoggedSet, type SetStatus } from '@/lib/sessionUtils';

interface Props {
  set: LoggedSet;
  /**
   * Where this set sits against the exercise target. Drives the badge colour:
   * `working`/`partial` (green) reached the target weight, `warmup` (orange) is
   * below it, and `neutral` is an exercise with no weight target. Defaults to
   * `neutral`.
   */
  status?: SetStatus;
  /**
   * Rep target for the set. On a `partial` set (weight met, reps short) the
   * reps render as achieved/target (e.g. "5/8") to show how far off it fell.
   */
  repTarget?: number;
  /** When provided the badge renders as an interactive delete button */
  onRemove?: () => void;
  isPendingDelete?: boolean;
  onBlur?: () => void;
  removeLabel?: string;
}

// Tailwind classes per status. A `partial` set hit the target weight (so it
// shares the green working style) but fell short on reps — flagged by showing
// the reps as achieved/target rather than with its own colour.
const BUTTON_STYLE: Record<SetStatus, string> = {
  working: 'bg-success/15 border-success/45 text-success',
  partial: 'bg-success/15 border-success/45 text-success',
  warmup: 'bg-brand/10 border-brand/40 text-brand',
  neutral: 'bg-brand/10 border-brand/40 text-brand',
};

const SPAN_STYLE: Record<SetStatus, string> = {
  working: 'bg-success/15 text-success',
  partial: 'bg-success/15 text-success',
  warmup: 'bg-brand/10 text-brand',
  neutral: 'bg-elevated text-secondary',
};

export default function LoggedSetBadge({
  set,
  status = 'neutral',
  repTarget,
  onRemove,
  isPendingDelete,
  onBlur,
  removeLabel,
}: Props) {
  // A partial set reached the target weight but fell short on reps — show the
  // reps as achieved/target (e.g. "5/8") so the shortfall is visible. The "/8"
  // is dimmed since it's the goal, not what was done.
  const label = (
    <span>
      {formatLoggedSet(set)}
      {status === 'partial' && repTarget != null && (
        <span className="opacity-60">/{repTarget}</span>
      )}
    </span>
  );

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
          label
        )}
      </button>
    );
  }

  return (
    <span className={`text-xs rounded-md px-1.5 py-0.5 font-medium ${SPAN_STYLE[status]}`}>
      {label}
    </span>
  );
}
