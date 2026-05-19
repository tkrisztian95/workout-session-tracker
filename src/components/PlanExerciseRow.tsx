import type { Ref } from 'react';
import { X, Pencil, Sparkles, GripVertical } from 'lucide-react';
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
  ref?: Ref<HTMLDivElement>;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
}

export default function PlanExerciseRow({
  ex,
  onRemove,
  onEdit,
  onAiSwap,
  className = 'bg-base',
  ref,
  dragHandleProps,
  isDragging = false,
}: Props) {
  return (
    <div
      ref={ref}
      className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 transition-shadow ${className} ${
        isDragging
          ? 'border-brand shadow-lg scale-[1.02] relative z-10 opacity-95'
          : 'border-border'
      }`}
    >
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          role="button"
          tabIndex={0}
          className="flex-shrink-0 -ml-1 flex items-center text-muted hover:text-secondary touch-none cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-brand rounded"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}
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
