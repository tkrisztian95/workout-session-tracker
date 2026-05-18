'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { dismissMuscleMigrationNotice, shouldShowMuscleMigrationNotice } from '@/lib/storage';
import { useTranslations } from '@/lib/locale-context';

/**
 * One-time dismissible notice that fires on first app load after a session or
 * plan with a legacy `Legs` category was rewritten to `quads`. Reads its
 * "should show" state from localStorage so it survives navigation; the flag
 * is cleared on dismissal.
 */
export default function MuscleMigrationToast() {
  const t = useTranslations();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Run after a microtask so the storage migration in getPlans/getSessions
    // (which set the pending flag) had a chance to fire from the routes that
    // mount before this toast.
    const id = window.requestAnimationFrame(() => {
      if (shouldShowMuscleMigrationNotice()) setVisible(true);
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  if (!visible) return null;

  const handleDismiss = () => {
    dismissMuscleMigrationNotice();
    setVisible(false);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] w-[min(92vw,420px)] rounded-2xl border border-border bg-surface px-4 py-3 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-foreground text-sm font-semibold mb-1">
            {t.muscle_migration_toast_title}
          </p>
          <p className="text-secondary text-xs leading-relaxed">{t.muscle_migration_toast_body}</p>
          <button
            type="button"
            onClick={handleDismiss}
            className="mt-2 text-brand text-xs font-medium active:opacity-70"
          >
            {t.muscle_migration_toast_dismiss}
          </button>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label={t.muscle_migration_toast_dismiss}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full active:bg-elevated"
        >
          <X className="w-4 h-4 text-muted" />
        </button>
      </div>
    </div>
  );
}
