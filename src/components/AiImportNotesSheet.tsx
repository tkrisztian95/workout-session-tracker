'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { ModalSheet, Button, FieldLabel } from '@/components/ui';
import CategoryBadge from '@/components/CategoryBadge';
import { importSession, type AiImportResult } from '@/lib/ai';
import { getLlmConfig, getLocale, getRecentExerciseNames } from '@/lib/storage';
import type { WorkoutSession } from '@/lib/types';
import { useTranslations } from '@/lib/locale-context';
import { formatExerciseDetail } from '@/lib/sessionUtils';

const LOCALE_LANGUAGE: Record<string, string> = {
  en: 'English',
  hu: 'Hungarian',
  de: 'German',
};

type View = 'input' | 'confirm';

interface AiImportNotesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (session: WorkoutSession) => void;
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
  const [parsedSession, setParsedSession] = useState<WorkoutSession | null>(null);

  function handleClose() {
    setView('input');
    setNotes('');
    setError(null);
    setParsedSession(null);
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
      const result = await importSession(notes, language, existingNames, config);
      setParsedSession(buildSession(result));
      setView('confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    if (!parsedSession) return;
    onConfirm(parsedSession);
    setView('input');
    setNotes('');
    setParsedSession(null);
  }

  const title = view === 'confirm' ? t.ai_import_confirm_title : t.ai_import_title;

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

      {/* ── Confirm view ───────────────────────────────────────────────────── */}
      {view === 'confirm' && parsedSession && (
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex gap-3 mb-4 flex-shrink-0">
            <div className="flex-1 rounded-xl bg-surface border border-border px-3 py-2.5">
              <p className="text-xs text-secondary mb-0.5">{t.new_history_session_date_label}</p>
              <p className="text-sm font-medium text-foreground">
                {parsedSession.startedAt.slice(0, 10)}
              </p>
            </div>
            <div className="flex-1 rounded-xl bg-surface border border-border px-3 py-2.5">
              <p className="text-xs text-secondary mb-0.5">
                {t.new_history_session_duration_label}
              </p>
              <p className="text-sm font-medium text-foreground">
                {Math.round(
                  (new Date(parsedSession.completedAt).getTime() -
                    new Date(parsedSession.startedAt).getTime()) /
                    60000,
                )}{' '}
                min
              </p>
            </div>
          </div>

          <p className="text-xs font-medium text-secondary uppercase tracking-wide mb-2 flex-shrink-0">
            {t.new_history_exercises_label} ({parsedSession.exercises.length})
          </p>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pb-2">
            {parsedSession.exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center gap-3 rounded-xl bg-surface border border-border px-3 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm text-foreground">{exercise.name}</p>
                    {exercise.category && <CategoryBadge category={exercise.category} />}
                  </div>
                  <p className="text-muted text-xs mt-0.5">{formatExerciseDetail(exercise)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 flex-shrink-0">
            <Button variant="ghost" onClick={() => setView('input')} className="flex-1 py-3.5">
              {t.ai_import_discard}
            </Button>
            <Button onClick={handleSave} className="flex-1 py-3.5">
              {t.ai_import_save}
            </Button>
          </div>
        </div>
      )}
    </ModalSheet>
  );
}
