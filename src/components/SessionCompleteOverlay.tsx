'use client';

import { useState } from 'react';
import { Dumbbell, Timer, Trophy, Star } from 'lucide-react';
import type { Exercise } from '@/lib/types';
import { calcSessionStats, formatDuration } from '@/lib/sessionUtils';
import { useTranslations } from '@/lib/locale-context';
import { Button, Card, HeadingXL } from '@/components/ui';

interface Props {
  exercises: Exercise[];
  startedAt: string;
  totalPausedMs?: number;
  onDismiss: (rating?: 1 | 2 | 3 | 4 | 5) => void;
}

export default function SessionCompleteOverlay({
  exercises,
  startedAt,
  totalPausedMs = 0,
  onDismiss,
}: Props) {
  const t = useTranslations();
  const stats = calcSessionStats(exercises, startedAt, totalPausedMs);
  const [view, setView] = useState<'summary' | 'rating'>('summary');

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center max-w-md mx-auto bg-base/95 backdrop-blur-sm cursor-pointer"
      onClick={() => onDismiss(undefined)}
    >
      <style>{`
        @keyframes sessionScaleFadeIn {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes sessionSlideUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sessionSlideInFromRight {
          from { opacity: 0; transform: translateX(48px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .session-complete-icon  { animation: sessionScaleFadeIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .session-complete-title { animation: sessionSlideUp 0.35s ease-out 0.3s both; }
        .session-complete-stats { animation: sessionSlideUp 0.35s ease-out 0.45s both; }
        .session-complete-cta   { animation: sessionSlideUp 0.35s ease-out 0.6s both; }
        .session-rating-view    { animation: sessionSlideInFromRight 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }
      `}</style>

      {view === 'summary' ? (
        /* ── View 1: Celebration + stats ──────────────────────────────── */
        <div
          className="flex flex-col items-center px-8 text-center w-full cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="session-complete-icon w-28 h-28 rounded-full bg-brand/15 border-2 border-brand/40 flex items-center justify-center mb-6">
            <Trophy className="w-14 h-14 text-brand" />
          </div>

          <HeadingXL className="session-complete-title mb-2">{t.session_complete_title}</HeadingXL>
          <p className="session-complete-title text-muted text-base mb-8">
            {t.session_complete_subtitle}
          </p>

          <div className="session-complete-stats w-full grid grid-cols-3 gap-3 mb-10">
            <Card className="px-3 py-4 flex flex-col items-center gap-1">
              <Dumbbell className="w-5 h-5 text-brand mb-1" />
              <HeadingXL as="span" className="text-3xl">
                {stats.completedExercises}
              </HeadingXL>
              <span className="text-muted text-xs">{t.session_complete_exercises}</span>
            </Card>
            <Card className="px-3 py-4 flex flex-col items-center gap-1">
              <div className="w-5 h-5 mb-1 flex items-center justify-center">
                <span className="text-brand text-lg font-bold leading-none">×</span>
              </div>
              <HeadingXL as="span" className="text-3xl">
                {stats.completedSets}
              </HeadingXL>
              <span className="text-muted text-xs">{t.session_complete_sets}</span>
            </Card>
            <Card className="px-3 py-4 flex flex-col items-center gap-1">
              <Timer className="w-5 h-5 text-brand mb-1" />
              <HeadingXL as="span" className="text-2xl">
                {formatDuration(stats.elapsedSeconds)}
              </HeadingXL>
              <span className="text-muted text-xs">{t.session_complete_duration}</span>
            </Card>
          </div>

          {/* Single clear action — no premature choice */}
          <div className="session-complete-cta w-full">
            <Button onClick={() => setView('rating')} className="w-full">
              {t.session_rate_cta}
            </Button>
          </div>
        </div>
      ) : (
        /* ── View 2: Optional rating ───────────────────────────────────── */
        <div
          className="session-rating-view flex flex-col items-center px-6 text-center w-full gap-8 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <HeadingXL>{t.session_rate_prompt}</HeadingXL>

          {/* Star rating row — w-12 (48px) × 5 + gap-3 × 4 = 288px, fits 375px screen */}
          <div className="flex gap-3 justify-center">
            {([1, 2, 3, 4, 5] as const).map((value) => (
              <button
                key={value}
                onClick={() => onDismiss(value)}
                aria-label={`Rate ${value} out of 5`}
                className="flex flex-col items-center justify-center gap-0.5 w-12 py-2.5 rounded-2xl bg-surface transition-all duration-150 active:scale-90 active:bg-elevated cursor-pointer"
              >
                <Star className="w-6 h-6 text-brand" />
                <span className="text-[10px] text-muted font-medium">{value}</span>
              </button>
            ))}
          </div>

          {/* Skip — text style, but min-height 44px for easy tap */}
          <button
            onClick={() => onDismiss(undefined)}
            className="min-h-[44px] px-6 flex items-center text-dim text-sm cursor-pointer active:opacity-60"
          >
            {t.session_rate_skip}
          </button>
        </div>
      )}
    </div>
  );
}
