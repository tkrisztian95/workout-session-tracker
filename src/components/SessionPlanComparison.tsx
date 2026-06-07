'use client';

import { Check, ChevronDown, ChevronUp, Equal, Minus, Plus, Sparkles, Target } from 'lucide-react';
import { useMemo } from 'react';
import MuscleBadge from '@/components/MuscleBadge';
import { useTranslations } from '@/lib/locale-context';
import { cn } from '@/lib/utils';
import { formatExerciseDetail } from '@/lib/sessionUtils';
import type { Exercise, PlanDay, PlanExercise, WorkoutSession } from '@/lib/types';

type Status = 'overdone' | 'matched' | 'underperformed' | 'missed' | 'extra';

interface ComparisonRow {
  key: string;
  name: string;
  muscle?: PlanExercise['muscle'];
  plannedSets: number;
  actualSets: number;
  status: Status;
  planned?: PlanExercise;
  actual?: Exercise;
}

function normName(s: string): string {
  return s.toLowerCase().trim();
}

function actualSetsFor(ex: Exercise): number {
  if (ex.dismissed) return 0;
  if (ex.loggedSets && ex.loggedSets.length > 0) return ex.loggedSets.length;
  if (ex.completed && typeof ex.sets === 'number') return ex.sets;
  return 0;
}

function plannedSetsFor(ex: PlanExercise): number {
  if (typeof ex.sets === 'number') return ex.sets;
  if (ex.repsPerSet && ex.repsPerSet.length > 0) return ex.repsPerSet.length;
  return 0;
}

function statusFor(
  plannedSets: number,
  actualSets: number,
  hasPlan: boolean,
  hasActual: boolean,
): Status {
  if (!hasPlan && hasActual) return 'extra';
  if (hasPlan && actualSets === 0) return 'missed';
  if (actualSets > plannedSets) return 'overdone';
  if (actualSets < plannedSets) return 'underperformed';
  return 'matched';
}

function buildRows(session: WorkoutSession, planDay: PlanDay | undefined): ComparisonRow[] {
  const planned: PlanExercise[] = planDay
    ? [...planDay.coreExercises, ...planDay.optionalExercises]
    : [];

  const actualByName = new Map<string, Exercise>();
  for (const ex of session.exercises) {
    actualByName.set(normName(ex.name), ex);
  }
  const plannedByName = new Map<string, PlanExercise>();
  for (const p of planned) {
    plannedByName.set(normName(p.name), p);
  }

  const rows: ComparisonRow[] = [];
  const seen = new Set<string>();

  for (const p of planned) {
    const key = normName(p.name);
    if (seen.has(key)) continue;
    seen.add(key);
    const a = actualByName.get(key);
    const plannedSets = plannedSetsFor(p);
    const actualSets = a ? actualSetsFor(a) : 0;
    rows.push({
      key: `planned-${p.id}`,
      name: p.name,
      muscle: p.muscle,
      plannedSets,
      actualSets,
      status: statusFor(plannedSets, actualSets, true, Boolean(a) && actualSets > 0),
      planned: p,
      actual: a,
    });
  }

  for (const a of session.exercises) {
    const key = normName(a.name);
    if (seen.has(key)) continue;
    if (a.dismissed) continue;
    const actualSets = actualSetsFor(a);
    if (actualSets === 0) continue;
    seen.add(key);
    rows.push({
      key: `extra-${a.id}`,
      name: a.name,
      muscle: a.muscle,
      plannedSets: 0,
      actualSets,
      status: 'extra',
      actual: a,
    });
  }

  return rows;
}

interface SessionPlanComparisonProps {
  session: WorkoutSession;
  planDay: PlanDay | undefined;
  planName?: string;
}

export function SessionPlanComparison({ session, planDay, planName }: SessionPlanComparisonProps) {
  const t = useTranslations();

  const rows = useMemo(() => {
    const built = buildRows(session, planDay);
    return built.sort((a, b) => {
      const deltaA = a.actualSets - a.plannedSets;
      const deltaB = b.actualSets - b.plannedSets;
      if (deltaA !== deltaB) return deltaB - deltaA;
      return b.actualSets - a.actualSets;
    });
  }, [session, planDay]);

  if (!planDay) {
    return (
      <section
        aria-label={t.comparison_title}
        className="rounded-xl bg-surface border border-border px-4 py-6 text-center"
      >
        <Target className="w-6 h-6 text-muted mx-auto mb-2" />
        <p className="text-sm text-secondary">{t.comparison_no_plan}</p>
      </section>
    );
  }

  const counts = rows.reduce<Record<Status, number>>(
    (acc, r) => {
      acc[r.status] += 1;
      return acc;
    },
    { overdone: 0, matched: 0, underperformed: 0, missed: 0, extra: 0 },
  );

  return (
    <section
      aria-label={t.comparison_title}
      className="rounded-xl bg-surface border border-border px-4 py-4"
    >
      <div className="flex items-center gap-1.5 mb-3">
        <Target className="w-3.5 h-3.5 text-muted flex-shrink-0" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
          {t.comparison_title}
        </h2>
      </div>

      {planName && (
        <p className="text-xs text-muted mb-3">
          {t.comparison_against_plan} <span className="text-secondary font-medium">{planName}</span>
          {planDay.name ? <> · {planDay.name}</> : null}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] mb-3">
        <LegendChip
          icon={<ChevronUp className="w-3 h-3" />}
          value={counts.overdone}
          label={t.comparison_overdone}
          tone="success"
        />
        <span className="text-dim" aria-hidden>
          ·
        </span>
        <LegendChip
          icon={<Equal className="w-3 h-3" />}
          value={counts.matched}
          label={t.comparison_on_target}
          tone="neutral"
        />
        <span className="text-dim" aria-hidden>
          ·
        </span>
        <LegendChip
          icon={<ChevronDown className="w-3 h-3" />}
          value={counts.underperformed + counts.missed}
          label={t.comparison_underperformed}
          tone="warning"
        />
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted text-center py-4">{t.comparison_empty}</p>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((row) => (
            <ComparisonRowItem key={row.key} row={row} />
          ))}
        </ul>
      )}
    </section>
  );
}

interface LegendChipProps {
  label: string;
  value: number;
  tone: 'success' | 'warning' | 'neutral';
  icon: React.ReactNode;
}

function LegendChip({ label, value, tone, icon }: LegendChipProps) {
  const toneClass =
    tone === 'success' ? 'text-success' : tone === 'warning' ? 'text-warning' : 'text-secondary';
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn('inline-flex items-center', toneClass)}>{icon}</span>
      <span className="font-semibold tabular-nums text-foreground">{value}</span>
      <span className="text-muted">{label}</span>
    </span>
  );
}

function maxLoggedWeight(ex: Exercise | undefined): number {
  if (!ex) return 0;
  const sets = ex.loggedSets;
  if (sets && sets.length > 0) {
    let max = 0;
    for (const s of sets) if (s.weight > max) max = s.weight;
    return max;
  }
  return ex.weightKg ?? 0;
}

function ComparisonRowItem({ row }: { row: ComparisonRow }) {
  const t = useTranslations();
  const delta = row.actualSets - row.plannedSets;
  const isExtra = row.status === 'extra';
  const denominator = Math.max(row.plannedSets, row.actualSets, 1);
  const plannedPct = (row.plannedSets / denominator) * 100;
  const actualPct = (row.actualSets / denominator) * 100;
  const achievedPct = (Math.min(row.plannedSets, row.actualSets) / denominator) * 100;
  const overPct = Math.max(0, actualPct - plannedPct);

  const statusLabel =
    row.status === 'overdone'
      ? t.comparison_overdone
      : row.status === 'underperformed'
        ? t.comparison_underperformed
        : row.status === 'missed'
          ? t.comparison_missed
          : isExtra
            ? t.comparison_extra
            : t.comparison_on_target;

  const pillClass =
    row.status === 'overdone'
      ? 'bg-success/15 text-success'
      : row.status === 'underperformed' || row.status === 'missed'
        ? 'bg-warning/15 text-warning'
        : isExtra
          ? 'bg-brand/15 text-brand'
          : 'bg-elevated text-secondary';

  const achievedBarClass =
    row.status === 'overdone'
      ? 'bg-success/45'
      : row.status === 'underperformed' || row.status === 'missed'
        ? 'bg-warning'
        : isExtra
          ? 'bg-brand'
          : 'bg-success';

  const overBarClass = 'bg-success';

  const plannedWeight = row.planned?.weightKg;
  // A skipped/missed exercise performs no sets, so it lifted no weight — even
  // though its actual record may still carry a weightKg copied from the plan
  // target. Reporting 0 prevents the weight target from rendering as achieved.
  const actualWeight = row.actualSets > 0 ? maxLoggedWeight(row.actual) : 0;
  const showWeight = (plannedWeight ?? 0) > 0 || (isExtra && actualWeight > 0);
  const weightAchieved = plannedWeight ? actualWeight >= plannedWeight : null;

  const detail = row.planned ?? row.actual;

  return (
    <li
      className={cn(
        'rounded-lg bg-base border border-border px-3 py-2.5 relative',
        isExtra && 'border-l-2 border-l-brand bg-brand/[0.03]',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {isExtra && <Sparkles className="w-3.5 h-3.5 text-brand flex-shrink-0" aria-hidden />}
            <span className="text-sm font-medium text-foreground truncate">{row.name}</span>
            {row.muscle && <MuscleBadge muscle={row.muscle} />}
          </div>
          {detail && (
            <p className="text-[11px] text-muted mt-0.5 tabular-nums">
              {formatExerciseDetail(detail)}
            </p>
          )}
        </div>
        <span
          className={cn(
            'text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap',
            pillClass,
          )}
        >
          {statusLabel}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full bg-elevated relative overflow-hidden">
          {achievedPct > 0 && (
            <div
              className={cn('absolute inset-y-0 left-0', achievedBarClass)}
              style={{ width: `${achievedPct}%` }}
              aria-hidden
            />
          )}
          {overPct > 0 && (
            <div
              className={cn('absolute inset-y-0', overBarClass)}
              style={{ left: `${plannedPct}%`, width: `${overPct}%` }}
              aria-hidden
            />
          )}
          {!isExtra && row.plannedSets > 0 && plannedPct < 100 && (
            <div
              className="absolute top-0 bottom-0 w-px bg-foreground/60"
              style={{ left: `calc(${plannedPct}% - 0.5px)` }}
              aria-hidden
            />
          )}
        </div>
        <span className="text-[11px] text-muted tabular-nums whitespace-nowrap">
          {row.actualSets}
          <span className="text-dim">/</span>
          {isExtra ? '—' : row.plannedSets}{' '}
          <span className="text-dim">{t.comparison_sets_short}</span>
        </span>
      </div>

      {(delta !== 0 || showWeight) && (
        <div className="mt-1.5 flex items-center gap-x-3 gap-y-1 flex-wrap text-[11px] tabular-nums">
          {delta !== 0 && (
            <span className="flex items-center gap-1 text-muted">
              {delta > 0 ? (
                <>
                  <Plus className="w-3 h-3 text-success" />
                  <span className="text-success font-medium">{delta}</span>
                </>
              ) : (
                <>
                  <Minus className="w-3 h-3 text-warning" />
                  <span className="text-warning font-medium">{Math.abs(delta)}</span>
                </>
              )}
              <span>
                {Math.abs(delta) === 1 ? t.comparison_set_singular : t.comparison_set_plural}{' '}
                {delta > 0 ? t.comparison_delta_more : t.comparison_delta_less}
              </span>
            </span>
          )}
          {showWeight && (
            <WeightIndicator
              actualWeight={actualWeight}
              plannedWeight={plannedWeight}
              achieved={weightAchieved}
              isExtra={isExtra}
            />
          )}
        </div>
      )}
    </li>
  );
}

interface WeightIndicatorProps {
  actualWeight: number;
  plannedWeight?: number;
  achieved: boolean | null;
  isExtra: boolean;
}

function WeightIndicator({ actualWeight, plannedWeight, achieved, isExtra }: WeightIndicatorProps) {
  if (isExtra || plannedWeight == null) {
    return (
      <span className="inline-flex items-center gap-1 text-muted">
        <Target className="w-3 h-3" aria-hidden />
        <span className="font-medium text-foreground">{actualWeight}</span>
        <span className="text-dim">kg</span>
      </span>
    );
  }
  const toneClass = achieved ? 'text-success' : 'text-warning';
  return (
    <span className={cn('inline-flex items-center gap-1', toneClass)}>
      {achieved ? (
        <Check className="w-3 h-3" aria-hidden />
      ) : (
        <Target className="w-3 h-3" aria-hidden />
      )}
      <span className="font-medium tabular-nums">
        {actualWeight}
        <span className="text-dim">/</span>
        {plannedWeight}
      </span>
      <span className="text-dim">kg</span>
    </span>
  );
}
