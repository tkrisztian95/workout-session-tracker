'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Square, X } from 'lucide-react';
import { useTranslations } from '@/lib/locale-context';

interface Props {
  exerciseName: string;
  /** Target hold time in seconds, when the exercise defines one. */
  targetSeconds?: number;
  onSave: (seconds: number) => void;
  onCancel: () => void;
}

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function ExerciseStopwatchOverlay({
  exerciseName,
  targetSeconds,
  onSave,
  onCancel,
}: Props) {
  const t = useTranslations();
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startRef.current);
    }, 100);
    return () => clearInterval(interval);
  }, [running]);

  const seconds = Math.floor(elapsedMs / 1000);
  const reachedTarget = targetSeconds != null && seconds >= targetSeconds;

  const handleStart = () => {
    startRef.current = Date.now();
    setRunning(true);
  };

  const handleStop = () => {
    setRunning(false);
    if (seconds < 1) {
      onCancel();
    } else {
      onSave(seconds);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-base/95 backdrop-blur-sm px-8">
      <button
        onClick={onCancel}
        aria-label={t.cancel}
        className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center bg-surface border border-border active:bg-elevated"
      >
        <X className="w-5 h-5 text-secondary" />
      </button>

      <p className="text-secondary text-sm font-medium text-center">{exerciseName}</p>
      {targetSeconds != null && (
        <p className="text-muted text-xs mt-1">
          {t.stopwatch_target.replace('{seconds}', String(targetSeconds))}
        </p>
      )}

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
          aria-label={t.stopwatch_start_hint}
          className="w-28 h-28 rounded-full bg-brand flex items-center justify-center shadow-lg active:scale-95 transition-transform duration-150 cursor-pointer"
        >
          <Play className="w-10 h-10 text-white ml-1" fill="currentColor" />
        </button>
      )}
      <p className="text-muted text-sm font-medium mt-4">
        {running ? t.stopwatch_stop_hint : t.stopwatch_start_hint}
      </p>
    </div>
  );
}
