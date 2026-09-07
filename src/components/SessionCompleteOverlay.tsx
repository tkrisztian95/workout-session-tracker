'use client';

import { useEffect, useState } from 'react';
import { Dumbbell, Timer, Trophy } from 'lucide-react';
import type { Exercise, SessionDebrief, WorkoutSession } from '@/lib/types';
import { RATING_EMOJI, calcSessionStats, formatDuration } from '@/lib/sessionUtils';
import { getLlmConfig } from '@/lib/storage';
import { buildAiContext, generateSessionDebrief } from '@/lib/ai';
import { useTranslations } from '@/lib/locale-context';
import { Button, Card, HeadingXL } from '@/components/ui';
import SessionDebriefCard from '@/components/SessionDebriefCard';

interface Props {
  exercises: Exercise[];
  startedAt: string;
  totalPausedMs?: number;
  /** Persists the session with the chosen rating and returns the stored record. */
  onRated: (rating?: 1 | 2 | 3 | 4 | 5) => WorkoutSession | null;
  /** Persists a generated debrief onto the session. May be called after unmount. */
  onDebriefGenerated: (session: WorkoutSession, debrief: SessionDebrief) => void;
  /** Final teardown — achievement sync, navigation. */
  onClose: () => void;
  /** Whether to attempt debrief generation after rating (config present + toggle on). */
  debriefEnabled: boolean;
}

type DebriefState = { status: 'loading' } | { status: 'done'; text: string | null };

export default function SessionCompleteOverlay({
  exercises,
  startedAt,
  totalPausedMs = 0,
  onRated,
  onDebriefGenerated,
  onClose,
  debriefEnabled,
}: Props) {
  const t = useTranslations();
  const stats = calcSessionStats(exercises, startedAt, totalPausedMs);
  const [view, setView] = useState<'summary' | 'rating' | 'debrief'>('summary');
  const [debrief, setDebrief] = useState<DebriefState>({ status: 'loading' });

  // In the debrief view, Escape closes the celebration screen without waiting
  // for the (possibly still in-flight) debrief request.
  useEffect(() => {
    if (view !== 'debrief') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [view, onClose]);

  function handleRating(rating?: 1 | 2 | 3 | 4 | 5) {
    const saved = onRated(rating);
    if (!saved || !debriefEnabled) {
      onClose();
      return;
    }
    setView('debrief');
    void (async () => {
      try {
        const config = getLlmConfig();
        if (!config?.apiKey) {
          setDebrief({ status: 'done', text: null });
          return;
        }
        const result = await generateSessionDebrief(
          config,
          buildAiContext('session-debrief'),
          saved,
        );
        onDebriefGenerated(saved, {
          text: result.text,
          generatedAt: new Date().toISOString(),
          model: result.model,
        });
        setDebrief({ status: 'done', text: result.text });
      } catch {
        setDebrief({ status: 'done', text: null });
      }
    })();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center max-w-md mx-auto bg-base/95 backdrop-blur-sm">
      {view === 'debrief' && (
        <button
          type="button"
          aria-label={t.session_debrief_done}
          className="absolute inset-0 cursor-pointer"
          onClick={onClose}
        />
      )}
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

      {view === 'summary' && (
        /* ── View 1: Celebration + stats ──────────────────────────────── */
        <div className="flex flex-col items-center px-8 text-center w-full cursor-default">
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
                {formatDuration(stats.elapsedSeconds, {
                  h: t.duration_unit_hours_short,
                  m: t.duration_unit_minutes_short,
                  s: t.duration_unit_seconds_short,
                })}
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
      )}

      {view === 'rating' && (
        /* ── View 2: Optional rating ───────────────────────────────────── */
        <div className="session-rating-view flex flex-col items-center px-6 text-center w-full gap-8 cursor-default">
          <HeadingXL>{t.session_rate_prompt}</HeadingXL>

          {/* Emoji row — w-12 (48px) × 5 + gap-3 × 4 = 288px, fits 375px screen */}
          <div className="flex gap-3 justify-center">
            {RATING_EMOJI.map((emoji, i) => {
              const value = (i + 1) as 1 | 2 | 3 | 4 | 5;
              return (
                <button
                  key={value}
                  onClick={() => handleRating(value)}
                  aria-label={`Rate ${value} out of 5`}
                  className="text-3xl w-12 h-12 rounded-2xl bg-surface flex items-center justify-center transition-all duration-150 active:scale-90 active:bg-elevated cursor-pointer"
                >
                  {emoji}
                </button>
              );
            })}
          </div>

          {/* Skip — text style, but min-height 44px for easy tap */}
          <button
            onClick={() => handleRating(undefined)}
            className="min-h-[44px] px-6 flex items-center text-dim text-sm cursor-pointer active:opacity-60"
          >
            {t.session_rate_skip}
          </button>
        </div>
      )}

      {view === 'debrief' && (
        /* ── View 3: Inline AI debrief ─────────────────────────────────── */
        <div className="session-rating-view relative z-10 flex flex-col items-center px-6 text-center w-full gap-6 cursor-default">
          <div className="w-20 h-20 rounded-full bg-brand/15 border-2 border-brand/40 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-brand" />
          </div>
          <HeadingXL>{t.session_complete_title}</HeadingXL>

          {debrief.status === 'loading' && <SessionDebriefCard loading className="w-full" />}
          {debrief.status === 'done' && debrief.text && (
            <SessionDebriefCard text={debrief.text} className="w-full" />
          )}

          <Button onClick={onClose} className="w-full">
            {t.session_debrief_done}
          </Button>
        </div>
      )}
    </div>
  );
}
