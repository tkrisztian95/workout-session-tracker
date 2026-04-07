'use client';

import { useEffect, useRef, useState } from 'react';
import { ModalSheet, Button } from '@/components/ui';
import type { WorkoutSession } from '@/lib/types';
import { useLocale, useTranslations } from '@/lib/locale-context';

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEM_H = 44;
const VISIBLE = 5; // items visible at once (center = selected)

// ─── DrumColumn ───────────────────────────────────────────────────────────────

interface DrumColumnProps {
  items: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

function DrumColumn({ items, selectedIndex, onChange }: DrumColumnProps) {
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track the last index we wrote to the scroll container so we don't loop
  const writtenIndexRef = useRef(selectedIndex);

  // Initialise scroll position on mount
  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.scrollTop = selectedIndex * ITEM_H;
      writtenIndexRef.current = selectedIndex;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync when selectedIndex changes externally (e.g. day clamping)
  useEffect(() => {
    if (writtenIndexRef.current === selectedIndex) return;
    const el = ref.current;
    if (!el) return;
    writtenIndexRef.current = selectedIndex;
    el.scrollTop = selectedIndex * ITEM_H;
  }, [selectedIndex]);

  function handleScroll() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const raw = Math.round(el.scrollTop / ITEM_H);
      const clamped = Math.min(Math.max(raw, 0), items.length - 1);
      writtenIndexRef.current = clamped;
      onChange(clamped);
    }, 80);
  }

  const padH = 2 * ITEM_H;
  const containerH = VISIBLE * ITEM_H;

  return (
    <div className="relative flex-1" style={{ height: containerH }}>
      {/* Centred highlight bar — brand tint + border for clear selection */}
      <div
        className="absolute left-px right-px rounded-xl bg-brand/20 ring-1 ring-brand/30 pointer-events-none z-10"
        style={{ top: padH, height: ITEM_H }}
      />
      {/* Top fade — masks items scrolling out of view */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-surface to-transparent pointer-events-none z-10" />
      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface to-transparent pointer-events-none z-10" />
      <div
        ref={ref}
        onScroll={handleScroll}
        className="absolute inset-0 overflow-y-scroll [&::-webkit-scrollbar]:hidden"
        style={{
          scrollSnapType: 'y mandatory',
          paddingTop: padH,
          paddingBottom: padH,
          scrollbarWidth: 'none',
          touchAction: 'pan-y',
          overscrollBehavior: 'contain',
        }}
      >
        {items.map((label, i) => (
          <div
            key={i}
            style={{ height: ITEM_H, scrollSnapAlign: 'center' }}
            className={[
              'flex items-center justify-center select-none transition-all duration-150',
              i === selectedIndex
                ? 'text-base font-bold text-foreground'
                : 'text-sm font-normal text-muted',
            ].join(' ')}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Date value helpers ───────────────────────────────────────────────────────

interface DateValue {
  year: number;
  month: number; // 0-indexed (0 = January)
  day: number; // 1-indexed
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function isoFromDateValue(v: DateValue): string {
  const m = String(v.month + 1).padStart(2, '0');
  const d = String(v.day).padStart(2, '0');
  return `${v.year}-${m}-${d}`;
}

function dateValueFromISO(iso: string): DateValue {
  const [y, m, d] = iso.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
}

function compareDateValues(a: DateValue, b: DateValue): number {
  return isoFromDateValue(a).localeCompare(isoFromDateValue(b));
}

function todayValue(): DateValue {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
}

function daysAgoValue(n: number): DateValue {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
}

// ─── DrumDatePicker ───────────────────────────────────────────────────────────

interface DrumDatePickerProps {
  value: DateValue;
  onChange: (v: DateValue) => void;
  minYear: number;
  maxYear: number;
  locale: string;
}

function DrumDatePicker({ value, onChange, minYear, maxYear, locale }: DrumDatePickerProps) {
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => String(minYear + i));
  const months = Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { month: 'short' }).format(new Date(2024, i, 1)),
  );
  const maxDays = daysInMonth(value.year, value.month);
  const days = Array.from({ length: maxDays }, (_, i) => String(i + 1));

  const yearIndex = Math.min(Math.max(value.year - minYear, 0), years.length - 1);
  const monthIndex = value.month;
  const dayIndex = Math.min(value.day - 1, maxDays - 1);

  function handleYearChange(index: number) {
    const newYear = minYear + index;
    const max = daysInMonth(newYear, value.month);
    onChange({ year: newYear, month: value.month, day: Math.min(value.day, max) });
  }

  function handleMonthChange(index: number) {
    const max = daysInMonth(value.year, index);
    onChange({ year: value.year, month: index, day: Math.min(value.day, max) });
  }

  function handleDayChange(index: number) {
    onChange({ year: value.year, month: value.month, day: index + 1 });
  }

  return (
    <div className="flex gap-0 rounded-2xl ring-1 ring-border overflow-hidden">
      <DrumColumn items={years} selectedIndex={yearIndex} onChange={handleYearChange} />
      <div className="w-px bg-border self-stretch" />
      <DrumColumn items={months} selectedIndex={monthIndex} onChange={handleMonthChange} />
      <div className="w-px bg-border self-stretch" />
      <DrumColumn items={days} selectedIndex={dayIndex} onChange={handleDayChange} />
    </div>
  );
}

// ─── DateRangePicker (public) ─────────────────────────────────────────────────

interface DateRangePickerProps {
  isOpen: boolean;
  onClose: () => void;
  value: { from: string | null; to: string | null };
  onApply: (from: string, to: string) => void;
  onClear: () => void;
  sessions: WorkoutSession[];
}

export default function DateRangePicker({
  isOpen,
  onClose,
  value,
  onApply,
  onClear,
  sessions,
}: DateRangePickerProps) {
  const { locale } = useLocale();
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  const minYear = sessions.length
    ? Math.min(
        currentYear - 5,
        ...sessions
          .filter((s) => s.completedAt)
          .map((s) => Number(s.completedAt.slice(0, 4)))
          .filter((y) => !isNaN(y) && y > 1970),
      )
    : currentYear - 5;

  const [tab, setTab] = useState<'from' | 'to'>('from');
  const [from, setFrom] = useState<DateValue>(daysAgoValue(30));
  const [to, setTo] = useState<DateValue>(todayValue());

  // Reset internal state each time the sheet opens
  useEffect(() => {
    if (!isOpen) return;
    setTab('from');
    setFrom(value.from ? dateValueFromISO(value.from) : daysAgoValue(30));
    setTo(value.to ? dateValueFromISO(value.to) : todayValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function handleFromChange(v: DateValue) {
    setFrom(v);
    // Auto-clamp To if From moves past it
    if (compareDateValues(v, to) > 0) setTo(v);
  }

  function handleToChange(v: DateValue) {
    // Prevent To from going before From
    setTo(compareDateValues(v, from) < 0 ? from : v);
  }

  const fmtShort = (v: DateValue) =>
    new Date(`${isoFromDateValue(v)}T12:00:00`).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
    });

  const fmtFull = (v: DateValue) =>
    new Date(`${isoFromDateValue(v)}T12:00:00`).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const applyLabel =
    isoFromDateValue(from) === isoFromDateValue(to)
      ? fmtFull(from)
      : `${fmtShort(from)} – ${fmtShort(to)}`;

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title={t.date_filter_title}>
      <div className="flex-1 min-h-0 overflow-y-auto pb-2">
        {/* From / To tab selector */}
        <div className="flex rounded-xl bg-elevated p-1 mb-5">
          {(['from', 'to'] as const).map((tab_key) => {
            const active = tab === tab_key;
            const dateVal = tab_key === 'from' ? from : to;
            return (
              <button
                key={tab_key}
                onClick={() => setTab(tab_key)}
                style={{ touchAction: 'manipulation' }}
                className={[
                  'flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-xl transition-colors min-h-[52px] justify-center cursor-pointer',
                  active ? 'bg-surface' : '',
                ].join(' ')}
              >
                <span
                  className={[
                    'text-[10px] font-bold uppercase tracking-widest',
                    active ? 'text-brand' : 'text-muted',
                  ].join(' ')}
                >
                  {tab_key === 'from' ? t.date_filter_from : t.date_filter_to}
                </span>
                <span
                  className={[
                    'text-sm font-semibold leading-tight',
                    active ? 'text-foreground' : 'text-secondary',
                  ].join(' ')}
                >
                  {fmtFull(dateVal)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Column headers sit outside the picker box, aligned to each column */}
        <div className="flex mb-1.5 px-px">
          {[t.date_filter_year, t.date_filter_month, t.date_filter_day].map((h, i) => (
            <span
              key={h}
              className={[
                'flex-1 text-center text-[10px] font-semibold text-muted uppercase tracking-wider',
                i < 2 ? 'border-r border-transparent' : '',
              ].join(' ')}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Drum picker — keyed so it fully remounts on tab switch */}
        {tab === 'from' ? (
          <DrumDatePicker
            key="from"
            value={from}
            onChange={handleFromChange}
            minYear={minYear}
            maxYear={currentYear}
            locale={locale}
          />
        ) : (
          <DrumDatePicker
            key="to"
            value={to}
            onChange={handleToChange}
            minYear={minYear}
            maxYear={currentYear}
            locale={locale}
          />
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" size="md" className="flex-1" onClick={onClear}>
            {t.date_filter_clear}
          </Button>
          <Button
            size="md"
            className="flex-2 min-w-0"
            style={{ flex: 2 }}
            onClick={() => onApply(isoFromDateValue(from), isoFromDateValue(to))}
          >
            <span className="truncate">
              {t.date_filter_apply} · {applyLabel}
            </span>
          </Button>
        </div>
      </div>
    </ModalSheet>
  );
}
