'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  Check,
  ClipboardList,
  Pause,
  Play as PlayIcon,
} from 'lucide-react';
import ExerciseCard from '@/components/ExerciseCard';
import AddExerciseModal from '@/components/AddExerciseModal';
import SessionTimer from '@/components/SessionTimer';
import SessionProgressBar from '@/components/SessionProgressBar';
import SessionCompleteOverlay from '@/components/SessionCompleteOverlay';
import BottomNav from '@/components/BottomNav';
import {
  getActiveSession,
  setActiveSession,
  clearActiveSession,
  getPlans,
  getSessions,
  saveSession,
  getUserName,
} from '@/lib/storage';
import UserNameModal from '@/components/UserNameModal';
import { useLocale, useTranslations } from '@/lib/locale-context';
import type { ActiveSession, Exercise, PlanDay, WorkoutPlan, WorkoutSession } from '@/lib/types';
import {
  BackButton,
  Badge,
  Button,
  CardRow,
  CtaBar,
  EmptyState,
  HeadingXL,
  LabelOverline,
  ListLabel,
  Page,
  PageHeader,
} from '@/components/ui';

// ─── Steps ───────────────────────────────────────────────────────────────────

type Step = 'start' | 'pick-plan' | 'pick-day' | 'pick-optionals' | 'session';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayWeekday(): number {
  return new Date().getDay();
}

function formatDate(locale: string): string {
  return new Date().toLocaleDateString(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function calendarDaysAgo(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Sub-views ───────────────────────────────────────────────────────────────

function StartScreen({
  hasPlans,
  onFollowPlan,
  onFreeSession,
  onCreatePlan,
  greeting,
  lastSessionInfo,
}: {
  hasPlans: boolean;
  onFollowPlan: () => void;
  onFreeSession: () => void;
  onCreatePlan: () => void;
  greeting?: string;
  lastSessionInfo: { relativeLabel: string; sessionName: string } | null;
}) {
  const t = useTranslations();
  const { locale } = useLocale();
  return (
    <Page className="pb-20">
      <PageHeader>
        <LabelOverline>{formatDate(locale)}</LabelOverline>
        {greeting && (
          <p
            className="text-brand text-lg font-semibold mt-1"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            {greeting}
          </p>
        )}
        {lastSessionInfo && (
          <p className="text-muted text-sm mt-1.5">
            <span className="text-dim">{t.last_workout_label}: </span>
            <span className="text-secondary">{lastSessionInfo.relativeLabel}</span>
            <span className="mx-1.5 text-border">·</span>
            <span className="text-secondary">{lastSessionInfo.sessionName}</span>
          </p>
        )}
      </PageHeader>

      <div className="flex-1 flex flex-col justify-center px-6 gap-4">
        <HeadingXL className="mb-2">{t.home_title}</HeadingXL>
        {hasPlans ? (
          <>
            <Button size="lg" onClick={onFollowPlan}>
              <span className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" /> {t.home_follow_plan}
              </span>
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <ChevronRight className="w-5 h-5" />
              </span>
            </Button>

            <Button variant="secondary" size="lg" onClick={onFreeSession}>
              <span className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5" /> {t.home_free_session}
              </span>
              <span className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center">
                <ChevronRight className="w-5 h-5" />
              </span>
            </Button>
          </>
        ) : (
          <>
            <Button size="lg" onClick={onFreeSession}>
              <span className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5" /> {t.home_start_free_session}
              </span>
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <ChevronRight className="w-5 h-5" />
              </span>
            </Button>

            <Button variant="secondary" size="lg" onClick={onCreatePlan}>
              {t.home_create_plan}
              <span className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center">
                <ChevronRight className="w-5 h-5" />
              </span>
            </Button>
          </>
        )}
      </div>

      <BottomNav active="home" />
    </Page>
  );
}

function PlanPickerScreen({
  plans,
  onSelect,
  onBack,
}: {
  plans: WorkoutPlan[];
  onSelect: (plan: WorkoutPlan) => void;
  onBack: () => void;
}) {
  const t = useTranslations();
  return (
    <Page className="pb-20">
      <PageHeader>
        <BackButton onClick={onBack} aria-label="Go back">
          <span className="w-9 h-9 rounded-full flex items-center justify-center bg-surface active:bg-elevated">
            <ChevronLeft className="w-5 h-5 text-secondary" />
          </span>
          <span className="text-sm font-medium text-secondary">{t.back}</span>
        </BackButton>
        <HeadingXL>{t.choose_plan_title}</HeadingXL>
      </PageHeader>

      <div className="flex-1 px-6 space-y-3 overflow-y-auto">
        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 text-center select-none">
            <p className="text-secondary text-base font-medium">{t.no_plans_title}</p>
            <p className="text-muted text-sm mt-1">{t.no_plans_go_to_plans}</p>
          </div>
        ) : (
          plans.map((plan) => (
            <CardRow key={plan.id} onClick={() => onSelect(plan)}>
              <div className="text-left">
                <p className="text-foreground font-semibold text-base">{plan.name}</p>
                <p className="text-muted text-sm mt-0.5">
                  {plan.days.length} day{plan.days.length !== 1 ? 's' : ''}
                </p>
              </div>
              <span className="w-7 h-7 rounded-full bg-elevated/50 flex items-center justify-center flex-shrink-0">
                <ChevronRight className="w-4 h-4 text-muted" />
              </span>
            </CardRow>
          ))
        )}
      </div>

      <BottomNav active="home" />
    </Page>
  );
}

function getNextDayIndex(plan: WorkoutPlan, sessions: WorkoutSession[]): number {
  const planSessions = sessions
    .filter((s) => s.planId === plan.id && s.planDayId)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  if (planSessions.length === 0) return 0;
  const lastDayIndex = plan.days.findIndex((d) => d.id === planSessions[0].planDayId);
  if (lastDayIndex === -1) return 0;
  return (lastDayIndex + 1) % plan.days.length;
}

function DayPickerScreen({
  plan,
  sessions,
  onSelect,
  onBack,
}: {
  plan: WorkoutPlan;
  sessions: WorkoutSession[];
  onSelect: (day: PlanDay) => void;
  onBack: () => void;
}) {
  const t = useTranslations();
  const today = todayWeekday();
  const nextDayIndex = getNextDayIndex(plan, sessions);
  const nextDayRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    nextDayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  return (
    <Page className="pb-20">
      <PageHeader>
        <BackButton onClick={onBack} aria-label="Go back">
          <span className="w-9 h-9 rounded-full flex items-center justify-center bg-surface active:bg-elevated">
            <ChevronLeft className="w-5 h-5 text-secondary" />
          </span>
          <span className="text-sm font-medium text-secondary">{t.back}</span>
        </BackButton>
        <LabelOverline className="mb-1">{plan.name}</LabelOverline>
        <HeadingXL>{t.choose_day_title}</HeadingXL>
      </PageHeader>

      <div className="flex-1 px-6 space-y-3 overflow-y-auto">
        {plan.days.map((day, index) => {
          const isSuggested = day.weekdays.includes(today);
          const isNext = index === nextDayIndex;
          const coreCount = day.coreExercises.length;
          const optionalCount = day.optionalExercises.length;
          return (
            <button
              key={day.id}
              ref={isNext ? nextDayRef : null}
              onClick={() => onSelect(day)}
              className={`w-full flex items-center justify-between rounded-2xl border px-4 py-4 gap-3 cursor-pointer active:scale-[0.98] transition-all duration-150 ${
                isNext ? 'bg-brand/10 border-brand/40' : 'bg-surface border-border'
              }`}
            >
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <p className="text-foreground font-semibold text-base">
                    {day.name || t.free_session}
                  </p>
                  {isNext && <Badge variant="brand">{t.next_badge}</Badge>}
                  {isSuggested && !isNext && <Badge variant="subtle">{t.today_badge}</Badge>}
                </div>
                <p className="text-muted text-sm mt-0.5">
                  {coreCount} core{optionalCount > 0 ? ` · ${optionalCount} optional` : ''}
                </p>
                {day.weekdays.length > 0 && (
                  <p className="text-dim text-xs mt-1">
                    {day.weekdays.map((w) => t.weekday_abbr[w]).join(', ')}
                  </p>
                )}
              </div>
              <span className="w-7 h-7 rounded-full bg-elevated/50 flex items-center justify-center flex-shrink-0">
                <ChevronRight className="w-4 h-4 text-muted" />
              </span>
            </button>
          );
        })}
      </div>

      <BottomNav active="home" />
    </Page>
  );
}

function OptionalPickerScreen({
  plan,
  day,
  onStart,
  onBack,
}: {
  plan: WorkoutPlan;
  day: PlanDay;
  onStart: (selectedOptionalIds: Set<string>) => void;
  onBack: () => void;
}) {
  const t = useTranslations();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Page className="pb-32">
      <PageHeader>
        <BackButton onClick={onBack} aria-label="Go back">
          <span className="w-9 h-9 rounded-full flex items-center justify-center bg-surface active:bg-elevated">
            <ChevronLeft className="w-5 h-5 text-secondary" />
          </span>
          <span className="text-sm font-medium text-secondary">{t.back}</span>
        </BackButton>
        <LabelOverline className="mb-1">
          {plan.name} · {day.name}
        </LabelOverline>
        <HeadingXL>{t.optional_exercises_title}</HeadingXL>
        <p className="text-muted text-sm mt-2">{t.optional_exercises_subtitle}</p>
      </PageHeader>

      <div className="flex-1 px-6 space-y-4 overflow-y-auto pb-4">
        {day.coreExercises.length > 0 && (
          <div>
            <p className="text-secondary text-xs font-medium uppercase tracking-wide mb-2">
              {t.core_always_included}
            </p>
            <div className="space-y-2">
              {day.coreExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center gap-3 bg-surface border border-border rounded-xl px-3 py-2.5"
                >
                  <div className="w-5 h-5 rounded-md bg-brand flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-medium">{ex.name}</p>
                    <p className="text-brand text-xs">
                      {ex.type === 'sets-reps'
                        ? `${ex.sets}×${ex.reps}`
                        : ex.type === 'sets-duration'
                          ? `${ex.sets}×${ex.duration}s`
                          : (ex.duration ?? 0) >= 60
                            ? `${Math.round((ex.duration ?? 0) / 60)} min`
                            : `${ex.duration}s`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {day.optionalExercises.length > 0 ? (
          <div>
            <p className="text-secondary text-xs font-medium uppercase tracking-wide mb-2">
              {t.optional_label}
            </p>
            <div className="space-y-2">
              {day.optionalExercises.map((ex) => {
                const checked = selected.has(ex.id);
                return (
                  <button
                    key={ex.id}
                    onClick={() => toggle(ex.id)}
                    className={`w-full flex items-center gap-3 rounded-xl border px-3 py-3 cursor-pointer transition-colors duration-150 text-left ${
                      checked ? 'bg-surface border-brand/50' : 'bg-base border-border'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        checked ? 'bg-brand border-brand' : 'border-border-subtle'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-medium">{ex.name}</p>
                      <p className="text-muted text-xs">
                        {ex.type === 'sets-reps'
                          ? `${ex.sets}×${ex.reps}`
                          : ex.type === 'sets-duration'
                            ? `${ex.sets}×${ex.duration}s`
                            : (ex.duration ?? 0) >= 60
                              ? `${Math.round((ex.duration ?? 0) / 60)} min`
                              : `${ex.duration}s`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-muted text-sm">{t.no_optional_in_day}</p>
        )}
      </div>

      <CtaBar>
        <Button onClick={() => onStart(selected)} className="w-full py-4">
          {t.start_session}
        </Button>
      </CtaBar>
    </Page>
  );
}

function SessionView({
  session,
  onUpdate,
  onFinish,
  onDiscard,
}: {
  session: ActiveSession;
  onUpdate: (session: ActiveSession) => void;
  onFinish: (rating?: 1 | 2 | 3 | 4 | 5) => void;
  onDiscard: () => void;
}) {
  const t = useTranslations();
  const { locale } = useLocale();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showCompleteOverlay, setShowCompleteOverlay] = useState(false);

  const handleAdd = (exercise: Omit<Exercise, 'id'>) => {
    const updated: ActiveSession = {
      ...session,
      exercises: [...session.exercises, { ...exercise, id: crypto.randomUUID() }],
    };
    onUpdate(updated);
    setIsModalOpen(false);
  };

  const isPaused = session.pausedAt !== undefined;

  const handlePause = () => {
    const updated: ActiveSession = { ...session, pausedAt: new Date().toISOString() };
    onUpdate(updated);
  };

  const handleResume = () => {
    const pausedMs = session.pausedAt ? Date.now() - new Date(session.pausedAt).getTime() : 0;
    const updated: ActiveSession = {
      ...session,
      pausedAt: undefined,
      totalPausedMs: (session.totalPausedMs ?? 0) + pausedMs,
    };
    onUpdate(updated);
  };

  const handleComplete = (id: string) => {
    const updated: ActiveSession = {
      ...session,
      exercises: session.exercises.map((e) => {
        if (e.id !== id) return e;
        const nowCompleted = !e.completed;
        return {
          ...e,
          completed: nowCompleted,
          completedAt: nowCompleted ? new Date().toISOString() : undefined,
        };
      }),
    };
    onUpdate(updated);
  };

  const handleDismiss = (id: string) => {
    const updated: ActiveSession = {
      ...session,
      exercises: session.exercises.map((e) => (e.id === id ? { ...e, dismissed: true } : e)),
    };
    onUpdate(updated);
  };

  const handleUndoDismiss = (id: string) => {
    const updated: ActiveSession = {
      ...session,
      exercises: session.exercises.map((e) => (e.id === id ? { ...e, dismissed: false } : e)),
    };
    onUpdate(updated);
  };

  const handleLogSet = (id: string, weight: number, reps: number) => {
    const updated: ActiveSession = {
      ...session,
      exercises: session.exercises.map((e) =>
        e.id === id
          ? {
              ...e,
              loggedSets: [
                ...(e.loggedSets ?? []),
                { weight, reps, loggedAt: new Date().toISOString() },
              ],
            }
          : e,
      ),
    };
    onUpdate(updated);
  };

  const handleRemoveSet = (id: string, index: number) => {
    const updated: ActiveSession = {
      ...session,
      exercises: session.exercises.map((e) =>
        e.id === id ? { ...e, loggedSets: (e.loggedSets ?? []).filter((_, i) => i !== index) } : e,
      ),
    };
    onUpdate(updated);
  };

  const handleSetActive = (id: string) => {
    const exercises = session.exercises;
    const targetIndex = exercises.findIndex((e) => e.id === id);
    const activeIndex = exercises.findIndex((e) => !e.completed && !e.dismissed);
    if (targetIndex === -1 || activeIndex === -1 || targetIndex === activeIndex) return;
    const reordered = [...exercises];
    const [target] = reordered.splice(targetIndex, 1);
    const insertAt = targetIndex < activeIndex ? activeIndex - 1 : activeIndex;
    reordered.splice(insertAt, 0, target);
    onUpdate({ ...session, exercises: reordered });
  };

  const remaining = session.exercises.filter((e) => !e.completed && !e.dismissed);
  const completed = session.exercises.filter((e) => e.completed && !e.dismissed);
  const dismissed = session.exercises.filter((e) => e.dismissed);
  const totalCount = session.exercises.length;
  const activeExercise = remaining[0] ?? null;
  const queue = remaining.slice(1);

  return (
    <Page className="pb-20">
      <PageHeader>
        <div className="flex items-center justify-between mb-1">
          <LabelOverline>{formatDate(locale)}</LabelOverline>
          <div className="flex items-center gap-2">
            <SessionTimer
              startedAt={session.startedAt}
              totalPausedMs={session.totalPausedMs ?? 0}
              pausedAt={session.pausedAt}
            />
            <button
              onClick={isPaused ? handleResume : handlePause}
              aria-label={isPaused ? 'Resume session' : 'Pause session'}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-surface border border-border active:bg-elevated"
            >
              {isPaused ? (
                <PlayIcon className="w-3.5 h-3.5 text-brand" />
              ) : (
                <Pause className="w-3.5 h-3.5 text-secondary" />
              )}
            </button>
          </div>
        </div>
        <HeadingXL className="mt-1">{session.planDayName ?? t.free_session}</HeadingXL>
        {session.planName && (
          <p className="text-brand text-sm mt-1 font-medium">{session.planName}</p>
        )}
        <SessionProgressBar
          completed={completed.length}
          remaining={remaining.length}
          dismissed={dismissed.length}
        />
      </PageHeader>

      <div className="flex-1 px-6 pb-52 space-y-3 overflow-y-auto">
        {totalCount === 0 ? (
          <EmptyState
            icon={<Dumbbell className="w-9 h-9 text-border" />}
            title={t.no_exercises_title}
            subtitle={t.no_exercises_subtitle}
          />
        ) : (
          <>
            {activeExercise && (
              <>
                <ListLabel>{t.active_exercise_section}</ListLabel>
                <ExerciseCard
                  key={activeExercise.id}
                  exercise={activeExercise}
                  isActive
                  targetWeightLabel={t.target_weight}
                  onComplete={() => handleComplete(activeExercise.id)}
                  onDismiss={() => handleDismiss(activeExercise.id)}
                  onLogSet={(s) => handleLogSet(activeExercise.id, s.weight, s.reps)}
                  onRemoveSet={(i) => handleRemoveSet(activeExercise.id, i)}
                />
              </>
            )}

            {queue.length > 0 && (
              <>
                <ListLabel>{t.upcoming_section}</ListLabel>
                {queue.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onComplete={() => handleComplete(exercise.id)}
                    onDismiss={() => handleDismiss(exercise.id)}
                    onSetActive={() => handleSetActive(exercise.id)}
                    onLogSet={(s) => handleLogSet(exercise.id, s.weight, s.reps)}
                  />
                ))}
              </>
            )}

            {completed.length > 0 && (
              <>
                <ListLabel>{t.completed_section}</ListLabel>
                {completed.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onComplete={() => handleComplete(exercise.id)}
                    onDismiss={() => handleDismiss(exercise.id)}
                  />
                ))}
              </>
            )}

            {dismissed.length > 0 && (
              <>
                <ListLabel className="text-dim">{t.skipped_section}</ListLabel>
                {dismissed.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onComplete={() => handleComplete(exercise.id)}
                    onDismiss={() => handleDismiss(exercise.id)}
                    onUndoDismiss={() => handleUndoDismiss(exercise.id)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>

      <CtaBar slim className="space-y-2">
        <Button variant="secondary" onClick={() => setIsModalOpen(true)} className="w-full gap-2">
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          {t.add_exercise_button}
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setShowDiscardConfirm(true)}
            className="flex-1 py-3.5 text-sm"
          >
            {t.discard}
          </Button>
          <Button onClick={() => setShowCompleteOverlay(true)} className="flex-[2]">
            {t.finish_session}
          </Button>
        </div>
      </CtaBar>

      <AddExerciseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAdd}
      />

      {showCompleteOverlay && (
        <SessionCompleteOverlay
          exercises={session.exercises}
          startedAt={session.startedAt}
          totalPausedMs={session.totalPausedMs ?? 0}
          onDismiss={(rating) => {
            setShowCompleteOverlay(false);
            onFinish(rating);
          }}
        />
      )}

      {showDiscardConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end max-w-md mx-auto">
          <div className="w-full bg-surface rounded-t-3xl px-6 pt-6 pb-10">
            <HeadingXL as="h3" className="text-2xl mb-2">
              {t.discard_session_title}
            </HeadingXL>
            <p className="text-secondary text-sm mb-6">{t.discard_session_subtitle}</p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowDiscardConfirm(false)}
                className="flex-1 py-3.5"
              >
                {t.keep_going}
              </Button>
              <Button variant="danger" onClick={onDiscard} className="flex-1">
                {t.discard}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const t = useTranslations();
  const [activeSession, setActive] = useState<ActiveSession | null>(() => getActiveSession());
  const [step, setStep] = useState<Step>(() => (getActiveSession() ? 'session' : 'start'));
  const [plans, setPlans] = useState<WorkoutPlan[]>(() =>
    getPlans().filter((p) => (p.status ?? 'active') === 'active'),
  );
  const [sessions] = useState<WorkoutSession[]>(() => getSessions());

  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState<PlanDay | null>(null);
  const [userName, setUserName] = useState<string | null>(() => getUserName());
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  const handleNameComplete = (name: string) => {
    setUserName(name);
    setIsFirstVisit(true);
  };

  const startFreeSession = () => {
    const session: ActiveSession = {
      id: crypto.randomUUID(),
      startedAt: new Date().toISOString(),
      exercises: [],
      totalPausedMs: 0,
    };
    setActiveSession(session);
    setActive(session);
    setStep('session');
  };

  const startPlanSession = (selectedOptionalIds: Set<string>) => {
    if (!selectedPlan || !selectedDay) return;
    const toExercise = (ex: {
      name: string;
      type: Exercise['type'];
      sets?: number;
      reps?: number;
      duration?: number;
      weightKg?: number;
      scalingNote?: string;
      category?: string;
    }): Exercise => ({
      id: crypto.randomUUID(),
      name: ex.name,
      type: ex.type,
      sets: ex.sets,
      reps: ex.reps,
      duration: ex.duration,
      weightKg: ex.weightKg,
      scalingNote: ex.scalingNote,
      category: ex.category,
    });
    const sharedExercises: Exercise[] = (selectedPlan.sharedExercises ?? []).map(toExercise);
    const coreExercises: Exercise[] = selectedDay.coreExercises.map(toExercise);
    const optionalExercises: Exercise[] = selectedDay.optionalExercises
      .filter((ex) => selectedOptionalIds.has(ex.id))
      .map(toExercise);
    const session: ActiveSession = {
      id: crypto.randomUUID(),
      startedAt: new Date().toISOString(),
      exercises: [...sharedExercises, ...coreExercises, ...optionalExercises],
      planId: selectedPlan.id,
      planDayId: selectedDay.id,
      planName: selectedPlan.name,
      planDayName: selectedDay.name,
      totalPausedMs: 0,
    };
    setActiveSession(session);
    setActive(session);
    setStep('session');
  };

  const handleSessionUpdate = (session: ActiveSession) => {
    setActiveSession(session);
    setActive(session);
  };

  const handleFinish = (rating?: 1 | 2 | 3 | 4 | 5) => {
    if (!activeSession) return;
    saveSession({
      id: activeSession.id,
      startedAt: activeSession.startedAt,
      completedAt: new Date().toISOString(),
      exercises: activeSession.exercises,
      planId: activeSession.planId,
      planDayId: activeSession.planDayId,
      rating,
    });
    clearActiveSession();
    setActive(null);
    setSelectedPlan(null);
    setSelectedDay(null);
    setStep('start');
  };

  const handleDiscard = () => {
    clearActiveSession();
    setActive(null);
    setSelectedPlan(null);
    setSelectedDay(null);
    setStep('start');
  };

  if (step === 'session' && activeSession) {
    return (
      <SessionView
        session={activeSession}
        onUpdate={handleSessionUpdate}
        onFinish={handleFinish}
        onDiscard={handleDiscard}
      />
    );
  }

  if (step === 'pick-plan') {
    return (
      <PlanPickerScreen
        plans={plans}
        onSelect={(plan) => {
          setSelectedPlan(plan);
          setStep('pick-day');
        }}
        onBack={() => setStep('start')}
      />
    );
  }

  if (step === 'pick-day' && selectedPlan) {
    return (
      <DayPickerScreen
        plan={selectedPlan}
        sessions={sessions}
        onSelect={(day) => {
          setSelectedDay(day);
          setStep('pick-optionals');
        }}
        onBack={() => setStep('pick-plan')}
      />
    );
  }

  if (step === 'pick-optionals' && selectedPlan && selectedDay) {
    return (
      <OptionalPickerScreen
        plan={selectedPlan}
        day={selectedDay}
        onStart={startPlanSession}
        onBack={() => setStep('pick-day')}
      />
    );
  }

  if (!userName) {
    return <UserNameModal onComplete={handleNameComplete} />;
  }

  const greeting = isFirstVisit
    ? t.greeting_first.replace('{name}', userName)
    : t.greeting_returning.replace('{name}', userName);

  const lastSession =
    sessions.length > 0
      ? [...sessions].sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0]
      : null;

  const lastSessionInfo = (() => {
    if (!lastSession) return null;
    const dayDiff = calendarDaysAgo(lastSession.completedAt);
    const relativeLabel =
      dayDiff === 0
        ? t.last_session_today
        : dayDiff === 1
          ? t.last_session_yesterday
          : t.last_session_days_ago.replace('{n}', String(dayDiff));
    let sessionName = t.free_session;
    if (lastSession.planId) {
      const allPlans = getPlans();
      const plan = allPlans.find((p) => p.id === lastSession.planId);
      if (plan) {
        sessionName = plan.name;
        if (lastSession.planDayId) {
          const day = plan.days.find((d) => d.id === lastSession.planDayId);
          if (day?.name) sessionName = `${plan.name} · ${day.name}`;
        }
      }
    }
    return { relativeLabel, sessionName };
  })();

  return (
    <StartScreen
      hasPlans={plans.length > 0}
      onFollowPlan={() => {
        setPlans(getPlans().filter((p) => (p.status ?? 'active') === 'active'));
        setStep('pick-plan');
      }}
      onFreeSession={startFreeSession}
      onCreatePlan={() => router.push('/plans/new')}
      greeting={greeting}
      lastSessionInfo={lastSessionInfo}
    />
  );
}
