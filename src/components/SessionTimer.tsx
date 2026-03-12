'use client';

import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';

interface Props {
  startedAt: string;
  totalPausedMs: number;
  pausedAt?: string;
}

function calcElapsed(startedAt: string, totalPausedMs: number, pausedAt?: string): number {
  const activeMs =
    (pausedAt ? new Date(pausedAt).getTime() : Date.now()) -
    new Date(startedAt).getTime() -
    totalPausedMs;
  return Math.floor(Math.max(0, activeMs) / 1000);
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function SessionTimer({ startedAt, totalPausedMs, pausedAt }: Props) {
  const [, tick] = useState(0);

  useEffect(() => {
    if (pausedAt) return;
    const interval = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, [pausedAt, startedAt, totalPausedMs]);

  const elapsed = calcElapsed(startedAt, totalPausedMs, pausedAt);

  return (
    <div className="flex items-center gap-1.5 text-muted text-sm">
      <Timer className={`w-3.5 h-3.5 ${pausedAt ? 'text-warning' : ''}`} />
      <span className={`font-mono font-medium tabular-nums ${pausedAt ? 'text-warning' : ''}`}>
        {formatElapsed(elapsed)}
      </span>
    </div>
  );
}
