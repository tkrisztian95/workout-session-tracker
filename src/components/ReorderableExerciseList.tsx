'use client';

import { useRef, useState } from 'react';
import type { PlanExercise } from '@/lib/types';
import PlanExerciseRow from '@/components/PlanExerciseRow';

interface Props {
  exercises: PlanExercise[];
  onReorder: (next: PlanExercise[]) => void;
  onEdit?: (ex: PlanExercise) => void;
  onRemove?: (ex: PlanExercise) => void;
  onAiSwap?: (ex: PlanExercise) => void;
}

function arrayMove<T>(list: T[], from: number, to: number): T[] {
  const result = [...list];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

export default function ReorderableExerciseList({
  exercises,
  onReorder,
  onEdit,
  onRemove,
  onAiSwap,
}: Props) {
  const rowRefs = useRef(new Map<string, HTMLElement>());
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const move = (id: string, clientY: number) => {
    const from = exercises.findIndex((ex) => ex.id === id);
    if (from === -1) return;
    let insertBefore = exercises.length;
    for (let i = 0; i < exercises.length; i++) {
      const el = rowRefs.current.get(exercises[i].id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) {
        insertBefore = i;
        break;
      }
    }
    const to = from < insertBefore ? insertBefore - 1 : insertBefore;
    if (to !== from) onReorder(arrayMove(exercises, from, to));
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const from = exercises.findIndex((ex) => ex.id === id);
    const to = e.key === 'ArrowUp' ? from - 1 : from + 1;
    if (from === -1 || to < 0 || to >= exercises.length) return;
    onReorder(arrayMove(exercises, from, to));
  };

  return (
    <div className="space-y-2">
      {exercises.map((ex) => (
        <PlanExerciseRow
          key={ex.id}
          ref={(el) => {
            if (el) rowRefs.current.set(ex.id, el);
            else rowRefs.current.delete(ex.id);
          }}
          ex={ex}
          isDragging={draggingId === ex.id}
          dragHandleProps={{
            'aria-label': `Reorder ${ex.name}`,
            onPointerDown: (e) => {
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
              setDraggingId(ex.id);
            },
            onPointerMove: (e) => {
              if (draggingId === ex.id) move(ex.id, e.clientY);
            },
            onPointerUp: (e) => {
              if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                e.currentTarget.releasePointerCapture(e.pointerId);
              }
              setDraggingId(null);
            },
            onPointerCancel: () => setDraggingId(null),
            onKeyDown: (e) => handleKeyDown(e, ex.id),
          }}
          onEdit={onEdit ? () => onEdit(ex) : undefined}
          onRemove={onRemove ? () => onRemove(ex) : undefined}
          onAiSwap={onAiSwap ? () => onAiSwap(ex) : undefined}
        />
      ))}
    </div>
  );
}
