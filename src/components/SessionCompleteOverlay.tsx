'use client';

import { Dumbbell, Timer, Trophy } from 'lucide-react';
import type { Exercise } from '@/lib/types';
import { calcSessionStats, formatDuration } from '@/lib/sessionUtils';

interface Props {
  exercises: Exercise[];
  startedAt: string;
  onDismiss: () => void;
}

export default function SessionCompleteOverlay({ exercises, startedAt, onDismiss }: Props) {
  const stats = calcSessionStats(exercises, startedAt);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center max-w-md mx-auto bg-[#111827]/95 backdrop-blur-sm session-complete-overlay"
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
        <div className="session-complete-icon w-28 h-28 rounded-full bg-[#F97316]/15 border-2 border-[#F97316]/40 flex items-center justify-center mb-6">
          <Trophy className="w-14 h-14 text-[#F97316]" />
        </div>

        {/* Title */}
        <h1
          className="session-complete-title text-[#F9FAFB] text-5xl font-bold leading-tight tracking-tight mb-2"
          style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
        >
          Session Complete!
        </h1>
        <p className="session-complete-title text-[#6B7280] text-base mb-8">
          Great work. Here&apos;s what you accomplished.
        </p>

        {/* Stats */}
        <div className="session-complete-stats w-full grid grid-cols-3 gap-3 mb-10">
          <div className="bg-[#1F2937] border border-[#374151] rounded-2xl px-3 py-4 flex flex-col items-center gap-1">
            <Dumbbell className="w-5 h-5 text-[#F97316] mb-1" />
            <span
              className="text-[#F9FAFB] text-3xl font-bold leading-none"
              style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
            >
              {stats.completedExercises}
            </span>
            <span className="text-[#6B7280] text-xs">exercises</span>
          </div>

          <div className="bg-[#1F2937] border border-[#374151] rounded-2xl px-3 py-4 flex flex-col items-center gap-1">
            <div className="w-5 h-5 mb-1 flex items-center justify-center">
              <span className="text-[#F97316] text-lg font-bold leading-none">×</span>
            </div>
            <span
              className="text-[#F9FAFB] text-3xl font-bold leading-none"
              style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
            >
              {stats.completedSets}
            </span>
            <span className="text-[#6B7280] text-xs">sets</span>
          </div>

          <div className="bg-[#1F2937] border border-[#374151] rounded-2xl px-3 py-4 flex flex-col items-center gap-1">
            <Timer className="w-5 h-5 text-[#F97316] mb-1" />
            <span
              className="text-[#F9FAFB] text-2xl font-bold leading-none"
              style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
            >
              {formatDuration(stats.elapsedSeconds)}
            </span>
            <span className="text-[#6B7280] text-xs">duration</span>
          </div>
        </div>

        {/* CTA */}
        <p className="session-complete-cta text-[#4B5563] text-sm">
          Tap anywhere to save your session
        </p>
      </div>
    </div>
  );
}
