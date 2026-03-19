'use client';

import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';
import { BarChart2, TrendingUp, TrendingDown, Minus, ChevronDown } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { getSessions } from '@/lib/storage';
import {
  computeStats,
  getWeeklyVolumeChartData,
  getExerciseWeightProgression,
  getCategoryDistribution,
  filterSessionsByRange,
  type TimeRange,
} from '@/lib/statsUtils';
import type { WorkoutSession } from '@/lib/types';
import { useTranslations } from '@/lib/locale-context';
import { EmptyState, HeadingXL, Page, PageHeader } from '@/components/ui';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-2xl bg-surface border border-border px-4 py-4 flex flex-col gap-1">
      <p className="text-muted text-xs font-medium uppercase tracking-wide">{label}</p>
      <p className="text-foreground text-2xl font-bold font-condensed leading-none">
        {value}
        {unit && <span className="text-sm text-secondary font-normal ml-1">{unit}</span>}
      </p>
    </div>
  );
}

// ─── Progression Table ────────────────────────────────────────────────────────

const progressionChartConfig = {
  weight: {
    label: 'Weight (kg)',
    theme: { light: '#f97316', dark: '#f97316' },
  },
} satisfies ChartConfig;

function ProgressionTable({ sessions }: { sessions: WorkoutSession[] }) {
  const t = useTranslations();
  const rows = useMemo(() => getExerciseWeightProgression(sessions), [sessions]);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (rows.length === 0) return null;

  return (
    <section>
      <h2 className="text-foreground font-semibold text-base mb-3">
        {t.stats_progression_table_title}
      </h2>
      <div className="rounded-2xl bg-surface border border-border overflow-hidden">
        {rows.map((row, i) => {
          const isExpanded = expanded === row.exerciseName;
          const chartData = row.sessionWeights.map((w, idx) => ({
            date: row.sessionDates[idx],
            weight: w,
          }));
          return (
            <div key={row.exerciseName} className={i > 0 ? 'border-t border-border' : ''}>
              {/* Row header — tappable */}
              <button
                type="button"
                onClick={() => setExpanded(isExpanded ? null : row.exerciseName)}
                className="w-full flex items-center justify-between px-4 py-3 gap-3 text-left"
              >
                {/* Exercise name */}
                <p className="text-foreground text-sm font-medium truncate flex-1 min-w-0">
                  {row.exerciseName}
                </p>

                {/* Weight history pills */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {row.sessionWeights.map((w, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-1.5 py-0.5 rounded-md font-mono ${
                        idx === row.sessionWeights.length - 1
                          ? 'bg-brand/20 text-brand font-semibold'
                          : 'bg-elevated text-secondary'
                      }`}
                    >
                      {w}
                    </span>
                  ))}
                </div>

                {/* Trend icon */}
                <div className="flex-shrink-0">
                  {row.trend === 'up' && <TrendingUp className="w-4 h-4 text-success" />}
                  {row.trend === 'down' && <TrendingDown className="w-4 h-4 text-danger" />}
                  {row.trend === 'flat' && <Minus className="w-4 h-4 text-muted" />}
                </div>

                {/* Expand chevron */}
                <ChevronDown
                  className={`w-4 h-4 text-muted flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Collapsible chart */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-border">
                  <ChartContainer config={progressionChartConfig} className="h-[120px] w-full">
                    <LineChart data={chartData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeOpacity={0.3} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel indicator="dot" />}
                      />
                      <Line
                        dataKey="weight"
                        type="monotone"
                        stroke="var(--color-weight)"
                        strokeWidth={2}
                        dot={{ r: 3, fill: 'var(--color-weight)' }}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Category Radar Chart ─────────────────────────────────────────────────────

const radarChartConfig = {
  count: {
    label: 'Sessions',
    theme: { light: '#f97316', dark: '#f97316' },
  },
} satisfies ChartConfig;

function CategoryRadarChart({ sessions }: { sessions: WorkoutSession[] }) {
  const t = useTranslations();
  const data = useMemo(() => getCategoryDistribution(sessions), [sessions]);

  const uniqueCategories = data.length;
  if (sessions.filter((s) => s.completedAt).length < 2 || uniqueCategories <= 1) return null;

  return (
    <section>
      <h2 className="text-foreground font-semibold text-base mb-3">
        {t.stats_category_radar_title}
      </h2>
      <div className="rounded-2xl bg-surface border border-border p-4">
        <ChartContainer config={radarChartConfig} className="h-[220px] w-full">
          <RadarChart data={data}>
            <PolarGrid strokeOpacity={0.3} />
            <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel indicator="dot" />}
            />
            <Radar
              dataKey="count"
              fill="var(--color-count)"
              fillOpacity={0.25}
              stroke="var(--color-count)"
              strokeWidth={2}
            />
          </RadarChart>
        </ChartContainer>
      </div>
    </section>
  );
}

// ─── Range Selector ───────────────────────────────────────────────────────────

const TIME_RANGES: { value: TimeRange; labelKey: keyof ReturnType<typeof useTranslations> }[] = [
  { value: '1day', labelKey: 'stats_range_1day' },
  { value: 'week', labelKey: 'stats_range_this_week' },
  { value: 'month', labelKey: 'stats_range_this_month' },
  { value: '90days', labelKey: 'stats_range_90days' },
  { value: 'all', labelKey: 'stats_range_all' },
];

function RangeSelector({
  selected,
  onChange,
}: {
  selected: TimeRange;
  onChange: (r: TimeRange) => void;
}) {
  const t = useTranslations();
  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted text-xs font-medium uppercase tracking-wide">
        {t.stats_range_label}
      </p>
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {TIME_RANGES.map(({ value, labelKey }) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selected === value ? 'bg-brand text-white' : 'bg-elevated text-secondary'
            }`}
          >
            {t[labelKey] as string}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const chartConfig = {
  volume: {
    label: 'Volume (kg)',
    theme: {
      light: '#f97316',
      dark: '#f97316',
    },
  },
} satisfies ChartConfig;

export default function StatsPage() {
  const t = useTranslations();

  const [sessions] = useState<WorkoutSession[]>(() => getSessions());
  const [range, setRange] = useState<TimeRange>('month');

  const filteredSessions = useMemo(() => filterSessionsByRange(sessions, range), [sessions, range]);

  const stats = useMemo(() => computeStats(filteredSessions), [filteredSessions]);
  const chartData = useMemo(() => getWeeklyVolumeChartData(filteredSessions), [filteredSessions]);
  const hasVolume = chartData.some((d) => d.volume > 0);

  const isEmpty = sessions.filter((s) => s.completedAt).length === 0;

  return (
    <Page className="pb-20">
      <PageHeader>
        <HeadingXL>{t.stats_title}</HeadingXL>
      </PageHeader>

      <div className="flex-1 px-6 overflow-y-auto space-y-6">
        {isEmpty ? (
          <EmptyState
            icon={<BarChart2 className="w-9 h-9 text-border" />}
            title={t.stats_empty_title}
            subtitle={t.stats_empty_subtitle}
          />
        ) : (
          <>
            {/* Time Range Selector */}
            <RangeSelector selected={range} onChange={setRange} />

            {/* Summary Cards */}
            <section>
              <h2 className="text-foreground font-semibold text-base mb-3">
                {t.stats_summary_title}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label={t.stats_total_sessions} value={String(stats.totalSessions)} />
                <StatCard
                  label={t.stats_total_volume}
                  value={stats.totalVolumeKg.toLocaleString()}
                  unit="kg"
                />
                <StatCard
                  label={t.stats_avg_duration}
                  value={String(stats.avgDurationMin)}
                  unit="min"
                />
                <StatCard
                  label={t.stats_avg_weight}
                  value={stats.avgWeightKg > 0 ? String(stats.avgWeightKg) : '—'}
                  unit={stats.avgWeightKg > 0 ? 'kg' : undefined}
                />
                <StatCard
                  label={t.stats_weekly_frequency}
                  value={stats.weeklyFrequency > 0 ? String(stats.weeklyFrequency) : '—'}
                />
              </div>
            </section>

            {/* Exercise Progression Table */}
            <ProgressionTable sessions={filteredSessions} />

            {/* Category Radar Chart */}
            <CategoryRadarChart sessions={filteredSessions} />

            {/* Weekly Volume Chart */}
            <section>
              <h2 className="text-foreground font-semibold text-base mb-3">
                {t.stats_volume_chart_title}
              </h2>
              {hasVolume ? (
                <div className="rounded-2xl bg-surface border border-border p-4">
                  <ChartContainer config={chartConfig} className="h-[180px] w-full">
                    <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeOpacity={0.3} />
                      <XAxis
                        dataKey="weekLabel"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 10 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 10 }}
                        tickFormatter={(v) => `${v}`}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel indicator="dot" />}
                      />
                      <Bar dataKey="volume" fill="var(--color-volume)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </div>
              ) : (
                <div className="rounded-2xl bg-surface border border-border px-4 py-8 text-center">
                  <p className="text-muted text-sm">{t.stats_no_volume_data}</p>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <BottomNav active="stats" />
    </Page>
  );
}
