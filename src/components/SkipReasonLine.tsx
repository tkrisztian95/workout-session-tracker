'use client';

import { useTranslations } from '@/lib/locale-context';
import { skipReasonLabel } from '@/lib/skipReasons';
import type { Exercise } from '@/lib/types';

/** Reason label and note under a skipped exercise; renders nothing when neither is set. */
export default function SkipReasonLine({
  exercise,
  className = '',
}: {
  exercise: Pick<Exercise, 'dismissed' | 'skipReason' | 'skipNote'>;
  className?: string;
}) {
  const t = useTranslations();
  if (!exercise.dismissed || (!exercise.skipReason && !exercise.skipNote)) return null;

  return (
    <span className={`block text-xs leading-snug text-secondary ${className}`}>
      {exercise.skipReason && (
        <span className="font-semibold">{skipReasonLabel(exercise.skipReason, t)}</span>
      )}
      {exercise.skipReason && exercise.skipNote && <span className="text-muted"> · </span>}
      {exercise.skipNote && <span className="italic break-words">{exercise.skipNote}</span>}
    </span>
  );
}
