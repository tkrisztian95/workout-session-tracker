'use client';

import { useRouter } from 'next/navigation';

interface Props {
  /** Maps ISO date string (YYYY-MM-DD) to list of session IDs for that day */
  sessionsByDate: Record<string, string[]>;
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function tileColor(count: number): string {
  if (count === 0) return '#1F2937';
  if (count === 1) return '#7C3AED';
  if (count === 2) return '#C05621'; // dimmed orange
  return '#F97316';
}

export default function ActivityTiles({ sessionsByDate }: Props) {
  const router = useRouter();

  // Build 16-week grid (112 days) ending today, Sunday-anchored columns
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find the Saturday that is >= today (end of current week)
  const dayOfWeek = today.getDay(); // 0=Sun, 6=Sat
  const daysUntilSat = (6 - dayOfWeek + 7) % 7;
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + daysUntilSat);

  // Start date is 111 days before end date (112 total)
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 111);

  // Build array of 112 days
  const days: Date[] = [];
  for (let i = 0; i < 112; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push(d);
  }

  // Group into 16 columns (weeks), each column = 7 days Sun→Sat
  const weeks: Date[][] = [];
  for (let w = 0; w < 16; w++) {
    weeks.push(days.slice(w * 7, w * 7 + 7));
  }

  const handleTileTap = (date: Date) => {
    const todayMs = new Date();
    todayMs.setHours(0, 0, 0, 0);
    if (date > todayMs) return; // future date — no-op

    const iso = toISODate(date);
    const sessions = sessionsByDate[iso] ?? [];
    if (sessions.length === 0) return; // rest day — no-op
    if (sessions.length === 1) {
      router.push(`/history/${sessions[0]}`);
    } else {
      router.push('/history');
    }
  };

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex gap-1" style={{ width: 'max-content' }}>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => {
              const todayMs = new Date();
              todayMs.setHours(0, 0, 0, 0);
              const isFuture = day > todayMs;
              const iso = toISODate(day);
              const count = (sessionsByDate[iso] ?? []).length;
              const color = isFuture ? '#1F2937' : tileColor(count);
              const isClickable = !isFuture && count > 0;

              return (
                <button
                  key={iso}
                  onClick={() => handleTileTap(day)}
                  disabled={!isClickable}
                  title={iso}
                  style={{ backgroundColor: color }}
                  className={`w-4 h-4 rounded-sm transition-opacity duration-150 ${
                    isClickable ? 'cursor-pointer active:opacity-70' : 'cursor-default'
                  }`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
