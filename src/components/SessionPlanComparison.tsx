'use client';

import { ChevronDown, ChevronUp, Equal, Minus, Plus, Target } from 'lucide-react';
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

const STATUS_ORDER: Record<Status, number> = {
  overdone: 0,
  underperformed: 1,
  missed: 2,
  extra: 3,
  matched: 4,
};

interface SessionPlanComparisonProps {
  session: WorkoutSession;
  planDay: PlanDay | undefined;
  planName?: string;
}

export function SessionPlanComparison({ session, planDay, planName }: SessionPlanComparisonProps) {
  const t = useTranslations();

  const rows = useMemo(() => {
    const built = buildRows(session, planDay);
    return built.sort(
      (a, b) =>
        STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
        b.actualSets - b.plannedSets - (a.actualSets - a.plannedSets),
    );
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

      <div className="grid grid-cols-3 gap-2 mb-4">
        <SummaryStat
          label={t.comparison_overdone}
          value={counts.overdone}
          tone="success"
          icon={<ChevronUp className="w-3.5 h-3.5" />}
        />
        <SummaryStat
          label={t.comparison_underperformed}
          value={counts.underperformed + counts.missed}
          tone="warning"
          icon={<ChevronDown className="w-3.5 h-3.5" />}
        />
        <SummaryStat
          label={t.comparison_on_target}
          value={counts.matched}
          tone="neutral"
          icon={<Equal className="w-3.5 h-3.5" />}
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

interface SummaryStatProps {
  label: string;
  value: number;
  tone: 'success' | 'warning' | 'neutral';
  icon: React.ReactNode;
}

function SummaryStat({ label, value, tone, icon }: SummaryStatProps) {
  const toneClass =
    tone === 'success' ? 'text-success' : tone === 'warning' ? 'text-warning' : 'text-secondary';
  return (
    <div className="rounded-lg bg-base border border-border px-2 py-2 text-center">
      <div className={cn('flex items-center justify-center gap-0.5', toneClass)}>
        {icon}
        <span className="text-base font-bold tabular-nums">{value}</span>
      </div>
      <p className="text-[10px] uppercase tracking-wider text-muted mt-0.5">{label}</p>
    </div>
  );
}

function ComparisonRowItem({ row }: { row: ComparisonRow }) {
  const t = useTranslations();
  const delta = row.actualSets - row.plannedSets;
  const denominator = Math.max(row.plannedSets, row.actualSets, 1);
  const plannedPct = (Math.min(row.plannedSets, denominator) / denominator) * 100;
  const actualPct = (row.actualSets / denominator) * 100;

  const statusLabel =
    row.status === 'overdone'
      ? t.comparison_overdone
      : row.status === 'underperformed'
        ? t.comparison_underperformed
        : row.status === 'missed'
          ? t.comparison_missed
          : row.status === 'extra'
            ? t.comparison_extra
            : t.comparison_on_target;

  const pillClass =
    row.status === 'overdone'
      ? 'bg-success/10 text-success'
      : row.status === 'underperformed' || row.status === 'missed'
        ? 'bg-warning/10 text-warning'
        : row.status === 'extra'
          ? 'bg-brand/10 text-brand'
          : 'bg-elevated text-secondary';

  const actualBarClass =
    row.status === 'overdone'
      ? 'bg-success'
      : row.status === 'underperformed' || row.status === 'missed'
        ? 'bg-warning'
        : row.status === 'extra'
          ? 'bg-brand'
          : 'bg-secondary';

  const detail = row.planned ?? row.actual;

  return (
    <li className="rounded-lg bg-base border border-border px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
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
        <div className="flex-1 h-1.5 rounded-full bg-elevated relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-border-subtle"
            style={{ width: `${plannedPct}%` }}
            aria-hidden
          />
          <div
            className={cn('absolute inset-y-0 left-0', actualBarClass)}
            style={{ width: `${actualPct}%` }}
            aria-hidden
          />
        </div>
        <span className="text-[11px] text-muted tabular-nums whitespace-nowrap">
          {row.actualSets}
          <span className="text-dim">/</span>
          {row.plannedSets} <span className="text-dim">{t.comparison_sets_short}</span>
        </span>
      </div>

      {delta !== 0 && (
        <p className="mt-1 text-[11px] text-muted flex items-center gap-1 tabular-nums">
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
        </p>
      )}
    </li>
  );
}
