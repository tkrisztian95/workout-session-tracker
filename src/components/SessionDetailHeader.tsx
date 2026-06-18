'use client';

import Link from 'next/link';
import { ChevronLeft, Clock, Trash2 } from 'lucide-react';
import SessionDateLabel from '@/components/SessionDateLabel';
import { HeadingXL, IconButton } from '@/components/ui';
import type { WorkoutSession } from '@/lib/types';
import { useTranslations } from '@/lib/locale-context';
import { useLocale } from '@/lib/locale-context';

interface SessionDetailHeaderProps {
  session: WorkoutSession;
  displaySession: WorkoutSession;
  planName?: string;
  dayName?: string;
  isEditing: boolean;
  draft: WorkoutSession | null;
  mins: number;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDeleteRequest: () => void;
  onDurationChange: (mins: number) => void;
}

function parseNum(value: string): number | undefined {
  const n = Number(value);
  return isNaN(n) || value === '' ? undefined : n;
}

export function SessionDetailHeader({
  session,
  displaySession,
  planName,
  dayName,
  isEditing,
  draft,
  mins,
  onEdit,
  onCancel,
  onSave,
  onDeleteRequest,
  onDurationChange,
}: SessionDetailHeaderProps) {
  const t = useTranslations();
  const { locale } = useLocale();

  return (
    <>
      <div className="flex items-center justify-between">
        <Link
          href="/history"
          className="flex items-center gap-2 w-fit mb-2"
          aria-label="Back to History"
        >
          <span className="w-9 h-9 rounded-full flex items-center justify-center bg-surface active:bg-elevated">
            <ChevronLeft className="w-5 h-5 text-secondary" />
          </span>
          <span className="text-sm font-medium text-secondary">{t.history_title}</span>
        </Link>
        {!isEditing ? (
          <button
            onClick={onEdit}
            className="text-sm font-medium text-brand px-3 py-1.5 rounded-lg active:bg-surface"
          >
            {t.edit_label}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="text-sm font-medium text-secondary px-3 py-1.5 rounded-lg active:bg-surface"
            >
              {t.cancel}
            </button>
            <button
              onClick={onSave}
              className="text-sm font-medium text-brand px-3 py-1.5 rounded-lg active:bg-surface"
            >
              {t.save_label}
            </button>
          </div>
        )}
      </div>
      <SessionDateLabel iso={session.completedAt} format="long" className="mt-3" />
      <div className="flex items-center gap-2 mt-1">
        <HeadingXL>{dayName ?? planName ?? t.free_session}</HeadingXL>
        {isEditing && (
          <IconButton
            onClick={onDeleteRequest}
            aria-label="Delete session"
            className="flex-shrink-0"
          >
            <Trash2 className="w-4 h-4 text-muted" />
          </IconButton>
        )}
      </div>
      {planName && <p className="text-brand text-sm mt-1 font-medium">{planName}</p>}
      <p className="text-muted text-sm mt-2 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
        {t.session_started_at}{' '}
        {new Date(displaySession.startedAt).toLocaleTimeString(locale, {
          hour: '2-digit',
          minute: '2-digit',
        })}
        {' · '}
        {isEditing && draft ? (
          <>
            <input
              type="number"
              min={1}
              value={mins}
              onChange={(e) => {
                const n = parseNum(e.target.value);
                if (n == null || n < 1) return;
                onDurationChange(n);
              }}
              className="w-14 rounded-md border border-border bg-base px-1.5 py-0.5 text-sm text-foreground text-center"
            />{' '}
            {t.min_label}
          </>
        ) : (
          <>
            {mins} {t.min_label}
          </>
        )}
        {' · '}
        {displaySession.exercises.length}{' '}
        {displaySession.exercises.length !== 1 ? t.exercise_plural : t.exercise_singular}
      </p>
    </>
  );
}
