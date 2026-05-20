'use client';

import { Clock } from 'lucide-react';
import MuscleBadge from '@/components/MuscleBadge';
import { useLocale, useTranslations } from '@/lib/locale-context';
import { buildSessionTimeline, formatDuration } from '@/lib/sessionUtils';
import type { WorkoutSession } from '@/lib/types';

interface SessionTimelineProps {
  session: WorkoutSession;
}

export function SessionTimeline({ session }: SessionTimelineProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const entries = buildSessionTimeline(session);

  if (entries.length === 0) return null;

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

  return (
    <section
      aria-label={t.timeline_title}
      className="rounded-xl bg-surface border border-border px-4 py-4"
    >
      <div className="flex items-center gap-1.5 mb-3">
        <Clock className="w-3.5 h-3.5 text-muted flex-shrink-0" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
          {t.timeline_title}
        </h2>
      </div>

      <ol className="relative">
        <li className="flex items-start gap-3 pb-3">
          <div className="flex flex-col items-center flex-shrink-0 self-stretch">
            <span className="w-2 h-2 rounded-full bg-border-subtle mt-1.5" />
            <span className="w-px flex-1 bg-border mt-1" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted tabular-nums">{formatTime(session.startedAt)}</p>
            <p className="text-sm text-secondary">{t.timeline_session_started}</p>
          </div>
        </li>

        {entries.map((e, i) => {
          const isLast = i === entries.length - 1;
          return (
            <li key={e.exerciseId} className="flex items-start gap-3 pb-3 last:pb-0">
              <div className="flex flex-col items-center flex-shrink-0 self-stretch">
                <span className="w-2 h-2 rounded-full bg-brand mt-1.5" />
                {!isLast && <span className="w-px flex-1 bg-border mt-1" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted tabular-nums">{formatTime(e.endedAt)}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-foreground">{e.name}</p>
                  {e.muscle && <MuscleBadge muscle={e.muscle} />}
                </div>
                {e.durationSec > 0 && (
                  <p className="text-xs text-muted mt-0.5 tabular-nums">
                    {formatDuration(e.durationSec)}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
