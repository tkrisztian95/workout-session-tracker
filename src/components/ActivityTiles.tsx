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
              className={[
                'flex flex-col items-center gap-1 w-[52px] py-3 rounded-2xl transition-all duration-150',
                hasWorkout ? 'cursor-pointer active:scale-95' : 'cursor-default',
                isToday && hasWorkout
                  ? 'bg-[#F97316]'
                  : isToday
                    ? 'bg-[#1F2937] ring-2 ring-[#F97316]/60'
                    : hasWorkout
                      ? 'bg-[#1F2937] ring-1 ring-[#7C3AED]/50'
                      : 'bg-[#1F2937]',
              ].join(' ')}
            >
              <span
                className={[
                  'text-[10px] font-bold tracking-widest uppercase',
                  isToday && hasWorkout
                    ? 'text-white/80'
                    : isToday
                      ? 'text-[#F97316]'
                      : 'text-[#6B7280]',
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
                      ? 'text-[#F9FAFB]'
                      : 'text-[#374151]',
                ].join(' ')}
                style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
              >
                {day.getDate()}
              </span>
              {hasWorkout ? (
                <span
                  className={[
                    'text-[10px] font-bold',
                    isToday && hasWorkout ? 'text-white/70' : 'text-[#F97316]',
                  ].join(' ')}
                >
                  {count > 1 ? `×${count}` : '●'}
                </span>
              ) : (
                <span className="text-[10px] text-transparent select-none">·</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
