'use client';

import React from 'react';
import { useTranslations } from '@/lib/locale-context';

interface Props {
  completed: number;
  remaining: number;
  dismissed: number;
  rightSlot?: React.ReactNode;
}

export default function SessionProgressBar({ completed, remaining, dismissed, rightSlot }: Props) {
  const t = useTranslations();
  const total = completed + remaining + dismissed;
  if (total === 0) return null;

  const completedPct = (completed / total) * 100;
  const skippedPct = (dismissed / total) * 100;

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-muted text-sm">
          {t.session_progress
            .replace('{remaining}', String(remaining))
            .replace('{done}', String(completed))}
          {dismissed > 0 && (
            <span className="text-dim">
              {' '}
              {t.session_progress_skipped.replace('{skipped}', String(dismissed))}
            </span>
          )}
        </p>
        {rightSlot}
      </div>
      <div className="mt-2 h-1 rounded-full bg-border overflow-hidden flex">
        <div
          className="h-full bg-brand transition-all duration-500"
          style={{ width: `${completedPct}%` }}
        />
        <div
          className="h-full bg-secondary/40 transition-all duration-500"
          style={{ width: `${skippedPct}%` }}
        />
      </div>
    </>
  );
}
