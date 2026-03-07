import { X } from 'lucide-react';
import { formatExerciseDetail } from '@/lib/sessionUtils';
import CategoryBadge from '@/components/CategoryBadge';
import { IconButton } from '@/components/ui';

interface ExerciseLike {
  name: string;
  type: 'sets-reps' | 'sets-duration' | 'duration';
  sets?: number;
  reps?: number;
  duration?: number;
  scalingNote?: string;
  category?: string;
}

interface Props {
  ex: ExerciseLike;
  onRemove?: () => void;
  className?: string;
}

export default function PlanExerciseRow({ ex, onRemove, className = 'bg-base' }: Props) {
  return (
    <div
      className={`flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 ${className}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-foreground text-sm font-medium truncate">{ex.name}</p>
          {ex.category && <CategoryBadge category={ex.category} />}
        </div>
        <p className="text-brand text-xs mt-0.5">{formatExerciseDetail(ex)}</p>
        {ex.scalingNote && <p className="text-muted text-xs mt-0.5 truncate">{ex.scalingNote}</p>}
      </div>
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
