'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/locale-context';

interface Props {
  /** Maps ISO date string (YYYY-MM-DD) to list of session IDs for that day */
  sessionsByDate: Record<string, string[]>;
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function ActivityTiles({ sessionsByDate }: Props) {
  const router = useRouter();
  const t = useTranslations();
  const todayRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    todayRef.current?.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'center' });
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Last 10 days ending today
  const days: Date[] = [];
  for (let i = 9; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }

  const handleTileTap = (iso: string) => {
    const sessions = sessionsByDate[iso] ?? [];
    if (sessions.length === 0) return;
    if (sessions.length === 1) {
      router.push(`/history/${sessions[0]}`);
    } else {
      router.push('/history');
    }
  };

  return (
    <div
      className="overflow-x-auto -mx-1 [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: 'none' }}
    >
      <div className="flex gap-1.5 px-1 py-1" style={{ width: 'max-content' }}>
        {days.map((day) => {
          const iso = toISODate(day);
          const isToday = day.getTime() === today.getTime();
          const count = (sessionsByDate[iso] ?? []).length;
          const hasWorkout = count > 0;

          return (
            <button
              key={iso}
              ref={isToday ? todayRef : null}
              onClick={() => handleTileTap(iso)}
              disabled={!hasWorkout}
              aria-label={`${iso}${hasWorkout ? `, ${count} workout${count > 1 ? 's' : ''}` : ''}`}
              style={!isToday && hasWorkout ? { backgroundColor: '#16a34a' } : undefined}
              className={[
                'flex flex-col items-center gap-1 w-[52px] py-3 rounded-2xl transition-all duration-150',
                hasWorkout ? 'cursor-pointer active:scale-95' : 'cursor-default',
                isToday && hasWorkout
                  ? 'bg-brand'
                  : isToday
                    ? 'bg-surface ring-2 ring-brand/60'
                    : 'bg-surface',
              ].join(' ')}
            >
              <span
                className={[
                  'text-[10px] font-bold tracking-widest uppercase',
                  isToday && hasWorkout
                    ? 'text-white/80'
                    : isToday
                      ? 'text-brand'
                      : hasWorkout
                        ? 'text-white/80'
                        : 'text-muted',
                ].join(' ')}
              >
                {t.weekday_abbr[day.getDay()]}
              </span>
              <span
                className={[
                  'text-2xl font-bold leading-none',
                  isToday && hasWorkout
                    ? 'text-white'
                    : hasWorkout || isToday
                      ? 'text-foreground'
                      : 'text-border',
                ].join(' ')}
                style={{ fontFamily: 'var(--font-condensed)' }}
              >
                {day.getDate()}
              </span>
              <span className="h-3 flex items-center justify-center">
                {count > 1 ? (
                  <span className="text-[10px] font-bold text-white/70">{`×${count}`}</span>
                ) : hasWorkout ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-white/70 block" />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
