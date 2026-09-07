'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Pause, Play, RotateCcw, X } from 'lucide-react';
import { useTranslations } from '@/lib/locale-context';
import { formatClock } from '@/lib/sessionUtils';

interface Props {
  exerciseName: string;
  /** Target hold time in seconds, when the exercise defines one. */
  targetSeconds?: number;
  /** Elapsed seconds carried over from a previous, paused session of this stopwatch. */
  initialSeconds?: number;
  /** Start the timer immediately on open (used by the card's "Resume" affordance). */
  autoStart?: boolean;
  onSave: (seconds: number) => void;
  /** Called when the overlay is dismissed without saving. Reports the elapsed
   *  seconds so the caller can resume from here next time it opens. */
  onCancel: (seconds: number) => void;
}

export default function ExerciseStopwatchOverlay({
  exerciseName,
  targetSeconds,
  initialSeconds = 0,
  autoStart = false,
  onSave,
  onCancel,
}: Props) {
  const t = useTranslations();
  // `autoStart` opens the overlay already running (used by the card's "Resume"),
  // so the user doesn't have to tap play again.
  const [running, setRunning] = useState(autoStart);
  const [elapsedMs, setElapsedMs] = useState(initialSeconds * 1000);
  // Wall-clock instant that `elapsedMs === 0` maps to while running. Anchored in
  // the effect (once per run) rather than at render so the clock stays pure.
  const originRef = useRef(0);
  const originAnchored = useRef(false);

  useEffect(() => {
    if (!running) {
      originAnchored.current = false;
      return;
    }
    if (!originAnchored.current) {
      originRef.current = Date.now() - elapsedMs;
      originAnchored.current = true;
    }
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - originRef.current);
    }, 100);
    return () => clearInterval(interval);
    // `elapsedMs` is intentionally read only when a run (re)starts, not every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const seconds = Math.floor(elapsedMs / 1000);
  const reachedTarget = targetSeconds != null && seconds >= targetSeconds;
  const resumable = !running && elapsedMs > 0;
  const canSave = seconds >= 1;

  const handleToggle = () => setRunning((r) => !r);

  const handleSave = () => {
    setRunning(false);
    if (canSave) onSave(seconds);
    else onCancel(0);
  };

  const handleReset = () => {
    setRunning(false);
    setElapsedMs(0);
    originRef.current = 0;
  };

  const toggleHint = running
    ? t.stopwatch_pause_hint
    : resumable
      ? t.stopwatch_resume_hint
      : t.stopwatch_start_hint;

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

      <button
        onClick={handleToggle}
        aria-label={toggleHint}
        className={`w-28 h-28 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform duration-150 cursor-pointer ${
          running ? 'bg-elevated border border-border' : 'bg-brand'
        }`}
      >
        {running ? (
          <Pause className="w-10 h-10 text-secondary" fill="currentColor" />
        ) : (
          <Play className="w-10 h-10 text-white ml-1" fill="currentColor" />
        )}
      </button>
      <p className="text-muted text-sm font-medium mt-4">{toggleHint}</p>

      <div className="mt-6 flex items-center gap-2">
        {canSave && (
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-4 py-2 text-sm font-semibold text-success active:bg-success/25 cursor-pointer"
          >
            <Check className="w-4 h-4" strokeWidth={2.5} />
            {t.stopwatch_save}
          </button>
        )}
        {elapsedMs > 0 && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-secondary active:bg-elevated cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
            {t.stopwatch_reset}
          </button>
        )}
      </div>
    </div>
  );
}
