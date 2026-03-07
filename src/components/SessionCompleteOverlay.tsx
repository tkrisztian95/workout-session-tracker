'use client';

import { Dumbbell, Timer, Trophy } from 'lucide-react';
import type { Exercise } from '@/lib/types';
import { calcSessionStats, formatDuration } from '@/lib/sessionUtils';
import { useTranslations } from '@/lib/locale-context';
import { Card, HeadingXL } from '@/components/ui';

interface Props {
  exercises: Exercise[];
  startedAt: string;
  onDismiss: () => void;
}

export default function SessionCompleteOverlay({ exercises, startedAt, onDismiss }: Props) {
  const t = useTranslations();
  const stats = calcSessionStats(exercises, startedAt);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center max-w-md mx-auto bg-base/95 backdrop-blur-sm session-complete-overlay"
      onClick={onDismiss}
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
        .session-complete-icon {
          animation: sessionScaleFadeIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .session-complete-title {
          animation: sessionSlideUp 0.35s ease-out 0.3s both;
        }
        .session-complete-stats {
          animation: sessionSlideUp 0.35s ease-out 0.45s both;
        }
        .session-complete-cta {
          animation: sessionSlideUp 0.35s ease-out 0.6s both;
        }
      `}</style>

      <div className="flex flex-col items-center px-8 text-center">
        {/* Icon */}
        <div className="session-complete-icon w-28 h-28 rounded-full bg-brand/15 border-2 border-brand/40 flex items-center justify-center mb-6">
          <Trophy className="w-14 h-14 text-brand" />
        </div>

        {/* Title */}
        <HeadingXL className="session-complete-title mb-2">{t.session_complete_title}</HeadingXL>
        <p className="session-complete-title text-muted text-base mb-8">
          {t.session_complete_subtitle}
        </p>

        {/* Stats */}
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

        {/* CTA */}
        <p className="session-complete-cta text-dim text-sm">{t.session_complete_cta}</p>
      </div>
    </div>
  );
}
