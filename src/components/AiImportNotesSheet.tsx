'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { ModalSheet, Button, FieldLabel } from '@/components/ui';
import SessionDraftCard from '@/components/SessionDraftCard';
import { importSessions, type AiImportResult } from '@/lib/ai';
import { getLlmConfig, getLocale, getRecentExerciseNames } from '@/lib/storage';
import type { Exercise, WorkoutSession } from '@/lib/types';
import { useTranslations } from '@/lib/locale-context';

const LOCALE_LANGUAGE: Record<string, string> = {
  en: 'English',
  hu: 'Hungarian',
  de: 'German',
};

type View = 'input' | 'review';

interface AiImportNotesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sessions: WorkoutSession[]) => void;
}

function buildSession(result: AiImportResult): WorkoutSession {
  const mins = result.durationMins;
  const startedAt = new Date(`${result.date}T09:00:00`).toISOString();
  const completedAt = new Date(new Date(startedAt).getTime() + mins * 60000).toISOString();
  return {
    id: crypto.randomUUID(),
    startedAt,
    completedAt,
    exercises: result.exercises.map((ex) => ({
      ...ex,
      id: crypto.randomUUID(),
      completed: true,
    })),
  };
}

export default function AiImportNotesSheet({
  isOpen,
  onClose,
  onConfirm,
}: AiImportNotesSheetProps) {
  const t = useTranslations();
  const [view, setView] = useState<View>('input');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftSessions, setDraftSessions] = useState<WorkoutSession[]>([]);

  function handleClose() {
    setView('input');
    setNotes('');
    setError(null);
    setDraftSessions([]);
    onClose();
  }

  async function handleSubmit() {
    const config = getLlmConfig();
    if (!config) return;
    setLoading(true);
    setError(null);
    try {
      const locale = getLocale() ?? 'en';
      const language = LOCALE_LANGUAGE[locale] ?? 'English';
      const existingNames = getRecentExerciseNames();
      const results = await importSessions(notes, language, existingNames, config);
      setDraftSessions(results.map(buildSession));
      setView('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    if (draftSessions.length === 0) return;
    onConfirm(draftSessions);
    setView('input');
    setNotes('');
    setDraftSessions([]);
  }

  // ── Draft mutation helpers ────────────────────────────────────────────────

  function updateDraftDate(idx: number, date: string) {
    setDraftSessions((prev) =>
      prev.map((s, i) => {
        if (i !== idx) return s;
        const durationMs = new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime();
        const startedAt = new Date(`${date}T09:00:00`).toISOString();
        const completedAt = new Date(new Date(startedAt).getTime() + durationMs).toISOString();
        return { ...s, startedAt, completedAt };
      }),
    );
  }

  function updateDraftDuration(idx: number, mins: number) {
    setDraftSessions((prev) =>
      prev.map((s, i) => {
        if (i !== idx) return s;
        const completedAt = new Date(new Date(s.startedAt).getTime() + mins * 60000).toISOString();
        return { ...s, completedAt };
      }),
    );
  }

  function updateDraftExercise(sessionIdx: number, exIdx: number, patch: Partial<Exercise>) {
    setDraftSessions((prev) =>
      prev.map((s, i) => {
        if (i !== sessionIdx) return s;
        const exercises = s.exercises.map((ex, j) => (j === exIdx ? { ...ex, ...patch } : ex));
        return { ...s, exercises };
      }),
    );
  }

  function removeDraftExercise(sessionIdx: number, exIdx: number) {
    setDraftSessions((prev) =>
      prev.map((s, i) => {
        if (i !== sessionIdx) return s;
        return { ...s, exercises: s.exercises.filter((_, j) => j !== exIdx) };
      }),
    );
  }

  function addDraftExercise(sessionIdx: number) {
    setDraftSessions((prev) =>
      prev.map((s, i) => {
        if (i !== sessionIdx) return s;
        const newEx: Exercise = {
          id: crypto.randomUUID(),
          name: '',
          type: 'sets-reps',
          sets: 3,
          reps: 10,
          completed: true,
        };
        return { ...s, exercises: [...s.exercises, newEx] };
      }),
    );
  }

  function removeDraftSession(idx: number) {
    setDraftSessions((prev) => prev.filter((_, i) => i !== idx));
  }

  // ── Derived state ─────────────────────────────────────────────────────────

  const hasInvalidDraft = draftSessions.some((s) => s.exercises.length === 0);
  const canSave = draftSessions.length > 0 && !hasInvalidDraft;
  const saveLabel =
    draftSessions.length === 1
      ? t.ai_import_save
      : t.ai_import_save_n.replace('{{count}}', String(draftSessions.length));

  const title = view === 'review' ? t.ai_import_review_title : t.ai_import_title;

  return (
    <ModalSheet isOpen={isOpen} onClose={handleClose} title={title}>
      {/* ── Input view ─────────────────────────────────────────────────────── */}
      {view === 'input' && (
        <div className="flex-1 min-h-0 flex flex-col">
          <p className="text-secondary text-sm mb-4">{t.ai_import_subtitle}</p>

          <div className="flex-1 min-h-0 flex flex-col mb-4">
            <FieldLabel htmlFor="ai-import-notes">{t.ai_import_notes_label}</FieldLabel>
            <textarea
              id="ai-import-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.ai_import_placeholder}
              rows={8}
              className="w-full rounded-lg border border-border bg-base px-3 py-2.5 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </div>

          {error && (
            <p className="text-danger text-sm mb-4 rounded-lg bg-danger/8 px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 flex-shrink-0">
            <Button variant="ghost" onClick={handleClose} className="flex-1 py-3.5">
              {t.cancel}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={notes.trim().length === 0 || loading}
              className="flex-1 py-3.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.ai_import_loading}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {t.ai_import_submit}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ── Review view ────────────────────────────────────────────────────── */}
      {view === 'review' && (
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pb-2">
            {draftSessions.map((session, idx) => (
              <SessionDraftCard
                key={session.id}
                session={session}
                index={idx}
                onUpdateDate={(date) => updateDraftDate(idx, date)}
                onUpdateDuration={(mins) => updateDraftDuration(idx, mins)}
                onUpdateExercise={(exIdx, patch) => updateDraftExercise(idx, exIdx, patch)}
                onRemoveExercise={(exIdx) => removeDraftExercise(idx, exIdx)}
                onAddExercise={() => addDraftExercise(idx)}
                onRemoveSession={() => removeDraftSession(idx)}
              />
            ))}
            {draftSessions.length === 0 && (
              <p className="text-secondary text-sm text-center py-8">{t.ai_import_discard}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4 flex-shrink-0">
            <Button variant="ghost" onClick={() => setView('input')} className="flex-1 py-3.5">
              {t.ai_import_discard}
            </Button>
            <Button onClick={handleSave} disabled={!canSave} className="flex-1 py-3.5">
              {saveLabel}
            </Button>
          </div>
        </div>
      )}
    </ModalSheet>
  );
}
