'use client';

import { useEffect, useState } from 'react';
import { SkipForward } from 'lucide-react';
import { useTranslations } from '@/lib/locale-context';
import { Button, FieldLabel, ModalSheet } from '@/components/ui';
import {
  SKIP_NOTE_MAX,
  SKIP_REASONS,
  normalizeSkipNote,
  skipReasonLabel,
  type SkipDetails,
} from '@/lib/skipReasons';
import type { SkipReason } from '@/lib/types';

interface SkipExerciseSheetProps {
  exerciseName: string;
  /** 'skip' — live session (Skip / Skip without reason); 'edit' — history (Save / Cancel). */
  mode: 'skip' | 'edit';
  initialReason?: SkipReason;
  initialNote?: string;
  onConfirm: (details: SkipDetails) => void;
  /** Required in 'skip' mode: skips with no reason and no note. */
  onSkipWithoutReason?: () => void;
  onCancel: () => void;
}

/** Counter appears once the note is this close to the limit. */
const COUNTER_THRESHOLD = 40;

export default function SkipExerciseSheet({
  exerciseName,
  mode,
  initialReason,
  initialNote,
  onConfirm,
  onSkipWithoutReason,
  onCancel,
}: SkipExerciseSheetProps) {
  const t = useTranslations();
  const [reason, setReason] = useState<SkipReason | undefined>(initialReason);
  const [note, setNote] = useState(initialNote ?? '');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const toggleReason = (r: SkipReason) => setReason((current) => (current === r ? undefined : r));
  const confirm = () => onConfirm({ reason, note: normalizeSkipNote(note) });

  const title = (mode === 'skip' ? t.skip_sheet_title : t.skip_sheet_edit_title).replace(
    '{name}',
    exerciseName,
  );
  const remaining = SKIP_NOTE_MAX - note.length;

  return (
    <ModalSheet
      icon={<SkipForward className="w-5 h-5 text-brand" />}
      title={title}
      onClose={onCancel}
    >
      <div className="flex-1 min-h-0 overflow-y-auto space-y-5 pt-1">
        <div>
          <FieldLabel id="skip-reason-label">{t.skip_sheet_reason_label}</FieldLabel>
          <div role="group" aria-labelledby="skip-reason-label" className="flex flex-wrap gap-2">
            {SKIP_REASONS.map((r) => {
              const selected = reason === r;
              return (
                <button
                  key={r}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleReason(r)}
                  className={`min-h-11 px-4 rounded-full border text-sm font-medium whitespace-nowrap cursor-pointer transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    selected
                      ? 'bg-brand/15 border-brand text-foreground'
                      : 'bg-elevated border-border text-secondary active:bg-border'
                  }`}
                >
                  {skipReasonLabel(r, t)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="skip-note">{t.skip_sheet_note_label}</FieldLabel>
          <textarea
            id="skip-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={SKIP_NOTE_MAX}
            placeholder={t.skip_sheet_note_placeholder}
            rows={2}
            aria-describedby={remaining <= COUNTER_THRESHOLD ? 'skip-note-counter' : undefined}
            className="w-full rounded-2xl bg-elevated border border-border px-4 py-3 text-base text-foreground placeholder:text-dim resize-none focus:outline-none focus:border-brand"
          />
          {remaining <= COUNTER_THRESHOLD && (
            <p id="skip-note-counter" className="text-xs text-muted text-right mt-1 tabular-nums">
              {remaining}
            </p>
          )}
        </div>

        {mode === 'skip' ? (
          <div className="flex flex-col gap-3 pt-1">
            <Button onClick={confirm} className="w-full">
              {t.skip_sheet_confirm}
            </Button>
            <Button variant="ghost" onClick={onSkipWithoutReason} className="w-full">
              {t.skip_sheet_without_reason}
            </Button>
          </div>
        ) : (
          <div className="flex gap-3 pt-1">
            <Button variant="ghost" onClick={onCancel} className="flex-1">
              {t.cancel}
            </Button>
            <Button onClick={confirm} className="flex-1">
              {t.skip_sheet_save}
            </Button>
          </div>
        )}
      </div>
    </ModalSheet>
  );
}
