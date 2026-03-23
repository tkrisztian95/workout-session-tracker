'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { BottomSheet, Button, FieldLabel } from '@/components/ui';
import type { Exercise, LoggedSet } from '@/lib/types';
import { useTranslations } from '@/lib/locale-context';

interface HistoryExerciseEditorProps {
  isOpen: boolean;
  exercise: Exercise;
  onConfirm: (patch: Partial<Exercise>) => void;
  onCancel: () => void;
}

function formatTarget(exercise: Exercise): string | null {
  if (exercise.type === 'sets-reps' && exercise.sets && exercise.reps) {
    return `${exercise.sets}×${exercise.reps}`;
  }
  if (exercise.type === 'sets-duration' && exercise.sets && exercise.duration) {
    return `${exercise.sets} sets · ${exercise.duration}s`;
  }
  if (exercise.type === 'duration' && exercise.duration) {
    return `${exercise.duration}s`;
  }
  return null;
}

export default function HistoryExerciseEditor({
  isOpen,
  exercise,
  onConfirm,
  onCancel,
}: HistoryExerciseEditorProps) {
  const t = useTranslations();

  const [rows, setRows] = useState<{ weight: string; reps: string }[]>(() => {
    if (exercise.type === 'sets-reps') {
      const existing = exercise.loggedSets ?? [];
      return existing.length > 0
        ? existing.map((s) => ({ weight: String(s.weight), reps: String(s.reps) }))
        : [{ weight: '', reps: String(exercise.reps ?? '') }];
    }
    return [];
  });

  const [duration, setDuration] = useState(() =>
    exercise.type !== 'sets-reps' ? String(exercise.duration ?? '') : '',
  );

  function handleConfirm() {
    if (exercise.type === 'sets-reps') {
      const loggedSets: LoggedSet[] = rows
        .filter((r) => r.reps !== '')
        .map((r) => ({
          weight: parseFloat(r.weight) || 0,
          reps: parseInt(r.reps) || 0,
          loggedAt: new Date().toISOString(),
        }));
      onConfirm({ loggedSets });
    } else {
      const dur = parseFloat(duration);
      onConfirm({ duration: isNaN(dur) ? undefined : dur });
    }
  }

  function addRow() {
    setRows((prev) => [...prev, { weight: '', reps: '' }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRow(index: number, field: 'weight' | 'reps', value: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  const target = formatTarget(exercise);

  return (
    <BottomSheet isOpen={isOpen} onClose={onCancel}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p className="font-semibold text-foreground text-base leading-tight">{exercise.name}</p>
          {target && (
            <p className="text-xs text-secondary mt-0.5">
              {t.history_exercise_editor_target_label} {target}
            </p>
          )}
        </div>
      </div>

      {exercise.type === 'sets-reps' ? (
        <div className="space-y-1">
          {/* Column headers */}
          <div className="flex items-center gap-2 px-1 mb-1">
            <span className="w-6 flex-shrink-0" />
            <div className="flex-1 grid grid-cols-2 gap-2">
              <p className="text-xs text-secondary text-center font-medium">
                {t.history_exercise_editor_weight_label}
              </p>
              <p className="text-xs text-secondary text-center font-medium">
                {t.history_exercise_editor_reps_label}
              </p>
            </div>
            <span className="w-11 flex-shrink-0" />
          </div>

          {/* Set rows */}
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs font-medium text-dim w-6 text-center flex-shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.5}
                  placeholder="0"
                  value={row.weight}
                  onChange={(e) => updateRow(i, 'weight', e.target.value)}
                  aria-label={`Set ${i + 1} weight`}
                  className="w-full rounded-lg border border-border bg-base px-2 py-2.5 text-sm text-foreground text-center"
                />
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  placeholder="0"
                  value={row.reps}
                  onChange={(e) => updateRow(i, 'reps', e.target.value)}
                  aria-label={`Set ${i + 1} reps`}
                  className="w-full rounded-lg border border-border bg-base px-2 py-2.5 text-sm text-foreground text-center"
                />
              </div>
              <button
                onClick={() => removeRow(i)}
                aria-label={t.history_exercise_editor_remove_set}
                disabled={rows.length === 1}
                className="w-11 h-11 flex items-center justify-center rounded-full active:bg-elevated flex-shrink-0 cursor-pointer disabled:opacity-30 disabled:cursor-default transition-opacity duration-150"
              >
                <Minus className="w-3.5 h-3.5 text-dim" />
              </button>
            </div>
          ))}

          <button
            onClick={addRow}
            className="flex items-center gap-1.5 text-brand text-sm font-semibold pt-2 cursor-pointer active:opacity-70 transition-opacity duration-150"
          >
            <Plus className="w-4 h-4" />
            {t.history_exercise_editor_add_set}
          </button>
        </div>
      ) : (
        <div>
          <FieldLabel htmlFor="exec-duration">
            {t.history_exercise_editor_duration_label}
          </FieldLabel>
          <input
            id="exec-duration"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="0"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full rounded-lg border border-border bg-base px-3 py-2.5 text-sm text-foreground text-center"
          />
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <Button variant="ghost" onClick={onCancel} className="flex-1 py-3.5 cursor-pointer">
          {t.cancel}
        </Button>
        <Button onClick={handleConfirm} className="flex-1 py-3.5 cursor-pointer">
          {t.history_exercise_editor_confirm}
        </Button>
      </div>
    </BottomSheet>
  );
}
