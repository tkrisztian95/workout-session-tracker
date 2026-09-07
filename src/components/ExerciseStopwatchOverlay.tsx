'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Square, X } from 'lucide-react';
import { useTranslations } from '@/lib/locale-context';
import { formatClock } from '@/lib/sessionUtils';

interface Props {
  exerciseName: string;
  /** Target hold time in seconds, when the exercise defines one. */
  targetSeconds?: number;
  /** Elapsed seconds carried over from a previous, paused session of this stopwatch. */
  initialSeconds?: number;
  onSave: (seconds: number) => void;
  /** Called when the overlay is dismissed without saving. Reports the elapsed
   *  seconds so the caller can resume from here next time it opens. */
  onCancel: (seconds: number) => void;
}

export default function ExerciseStopwatchOverlay({
  exerciseName,
  targetSeconds,
  initialSeconds = 0,
  onSave,
  onCancel,
}: Props) {
  const t = useTranslations();
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(initialSeconds * 1000);
  // Wall-clock instant that `elapsedMs === 0` maps to while running.
  const originRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - originRef.current);
    }, 100);
    return () => clearInterval(interval);
  }, [running]);

  const seconds = Math.floor(elapsedMs / 1000);
  const reachedTarget = targetSeconds != null && seconds >= targetSeconds;
  const resumable = !running && elapsedMs > 0;

  const handleStart = () => {
    originRef.current = Date.now() - elapsedMs;
    setRunning(true);
  };

  const handleStop = () => {
    setRunning(false);
    if (seconds < 1) {
      onCancel(0);
    } else {
      onSave(seconds);
    }
  };

  const startHint = resumable ? t.stopwatch_resume_hint : t.stopwatch_start_hint;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-base/95 backdrop-blur-sm px-8">
      <button
        onClick={() => onCancel(seconds)}
        aria-label={t.cancel}
        className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center bg-surface border border-border active:bg-elevated"
      >
        <X className="w-5 h-5 text-secondary" />
      </button>

      <div className="flex flex-col items-center gap-1.5 px-4 text-center">
        <h2 className="text-xl font-bold leading-snug text-foreground text-balance">
          {exerciseName}
        </h2>
        {targetSeconds != null && (
          <p className="text-secondary text-sm font-medium tabular-nums">
            {t.stopwatch_target.replace('{time}', formatClock(targetSeconds))}
          </p>
        )}
      </div>

      <div
        className={`font-mono font-bold tabular-nums my-10 text-7xl transition-colors duration-200 ${
          reachedTarget ? 'text-success' : 'text-foreground'
        }`}
      >
        {formatClock(seconds)}
      </div>

      {running ? (
        <button
          onClick={handleStop}
          aria-label={t.stopwatch_stop_hint}
          className="w-28 h-28 rounded-full bg-danger flex items-center justify-center shadow-lg active:scale-95 transition-transform duration-150 cursor-pointer"
        >
          <Square className="w-9 h-9 text-white" fill="currentColor" />
        </button>
      ) : (
        <button
          onClick={handleStart}
          aria-label={startHint}
          className="w-28 h-28 rounded-full bg-brand flex items-center justify-center shadow-lg active:scale-95 transition-transform duration-150 cursor-pointer"
        >
          <Play className="w-10 h-10 text-white ml-1" fill="currentColor" />
        </button>
      )}
      <p className="text-muted text-sm font-medium mt-4">
        {running ? t.stopwatch_stop_hint : startHint}
      </p>
    </div>
  );
}
