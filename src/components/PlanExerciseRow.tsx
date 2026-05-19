import { X, Pencil, Sparkles } from 'lucide-react';
import { formatExerciseDetail } from '@/lib/sessionUtils';
import MuscleBadge from '@/components/MuscleBadge';
import { IconButton } from '@/components/ui';
import type { Muscle } from '@/lib/muscles';

interface ExerciseLike {
  name: string;
  type: 'sets-reps' | 'sets-duration' | 'duration';
  sets?: number;
  reps?: number;
  duration?: number;
  weightKg?: number;
  scalingNote?: string;
  muscle?: Muscle;
}

interface Props {
  ex: ExerciseLike;
  onRemove?: () => void;
  onEdit?: () => void;
  onAiSwap?: () => void;
  className?: string;
}

export default function PlanExerciseRow({
  ex,
  onRemove,
  onEdit,
  onAiSwap,
  className = 'bg-base',
}: Props) {
  return (
    <div
      className={`flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 ${className}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-foreground text-sm font-medium truncate">{ex.name}</p>
          {ex.muscle && <MuscleBadge muscle={ex.muscle} />}
        </div>
        <p className="text-brand text-xs mt-0.5">{formatExerciseDetail(ex)}</p>
        {ex.scalingNote && <p className="text-muted text-xs mt-0.5 truncate">{ex.scalingNote}</p>}
      </div>
      {onEdit && (
        <IconButton
          size="sm"
          onClick={onEdit}
          aria-label={`Edit ${ex.name}`}
          className="flex-shrink-0"
        >
          <Pencil className="w-3.5 h-3.5 text-muted" />
        </IconButton>
      )}
      {onAiSwap && (
        <IconButton
          size="sm"
          onClick={onAiSwap}
          aria-label={`Swap ${ex.name} with AI`}
          className="flex-shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand" />
        </IconButton>
      )}
      {onRemove && (
        <IconButton
          size="sm"
          onClick={onRemove}
          aria-label={`Remove ${ex.name}`}
          className="flex-shrink-0"
        >
          <X className="w-3.5 h-3.5 text-secondary" />
        </IconButton>
      )}
    </div>
  );
}
