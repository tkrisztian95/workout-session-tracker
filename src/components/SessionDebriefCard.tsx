'use client';

import { Sparkles } from 'lucide-react';
import { useTranslations } from '@/lib/locale-context';

interface Props {
  /** The debrief paragraph. Omit while `loading`. */
  text?: string;
  /** Show the loading state instead of text. */
  loading?: boolean;
  className?: string;
}

/**
 * Presentational card for the AI session debrief (#64). Shared by the
 * session-complete celebration screen and the history detail page.
 */
export default function SessionDebriefCard({ text, loading = false, className }: Props) {
  const t = useTranslations();

  return (
    <div
      className={`rounded-xl border border-border bg-surface px-4 py-3.5 text-left ${className ?? ''}`}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-brand flex-shrink-0" aria-hidden />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          {t.session_debrief_label}
        </span>
      </div>
      {loading ? (
        <p className="text-sm text-muted animate-pulse">{t.session_debrief_loading}</p>
      ) : (
        <p className="text-sm text-secondary leading-relaxed">{text}</p>
      )}
    </div>
  );
}
