'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Dumbbell, ChevronRight, Check } from 'lucide-react';
import ExerciseCard from '@/components/ExerciseCard';
import AddExerciseModal from '@/components/AddExerciseModal';
import SessionTimer from '@/components/SessionTimer';
import SessionCompleteOverlay from '@/components/SessionCompleteOverlay';
import BottomNav from '@/components/BottomNav';
import ActivityTiles from '@/components/ActivityTiles';
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
import type { ActiveSession, Exercise, PlanDay, WorkoutPlan, WorkoutSession } from '@/lib/types';

// ─── Steps ───────────────────────────────────────────────────────────────────

type Step = 'start' | 'pick-plan' | 'pick-day' | 'pick-optionals' | 'session';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayWeekday(): number {
  return new Date().getDay();
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

// ─── Sub-views ───────────────────────────────────────────────────────────────

function StartScreen({
  hasPlans,
  onFollowPlan,
  onFreeSession,
  onCreatePlan,
  greeting,
  sessionsByDate,
}: {
  hasPlans: boolean;
  onFollowPlan: () => void;
  onFreeSession: () => void;
  onCreatePlan: () => void;
  greeting?: string;
  sessionsByDate: Record<string, string[]>;
}) {
  return (
    <main className="min-h-screen bg-[#111827] flex flex-col max-w-md mx-auto pb-20">
      <div className="px-6 pt-14 pb-6">
        <p className="text-[#6B7280] text-xs font-medium tracking-widest uppercase">
          {formatDate()}
        </p>
        {greeting && (
          <p
            className="text-[#F97316] text-lg font-semibold mt-1"
            style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
          >
            {greeting}
          </p>
        )}
        <h1
          className="text-[#F9FAFB] text-5xl font-bold mt-1 leading-none tracking-tight"
          style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
        >
          Start Workout
        </h1>
      </div>

      <div className="px-6 pb-4">
        <ActivityTiles sessionsByDate={sessionsByDate} />
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 gap-4">
        {hasPlans ? (
          <>
            <button
              onClick={onFollowPlan}
              className="w-full bg-[#F97316] text-white font-bold text-xl py-5 rounded-2xl flex items-center justify-between px-6 cursor-pointer active:scale-[0.98] transition-transform duration-150"
              style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
            >
              Follow a Plan
              <ChevronRight className="w-6 h-6" />
            </button>

            <button
              onClick={onFreeSession}
              className="w-full bg-[#1F2937] border border-[#374151] text-[#F9FAFB] font-bold text-xl py-5 rounded-2xl flex items-center justify-between px-6 cursor-pointer active:scale-[0.98] transition-transform duration-150"
              style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
            >
              Free Session
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onFreeSession}
              className="w-full bg-[#F97316] text-white font-bold text-xl py-5 rounded-2xl flex items-center justify-between px-6 cursor-pointer active:scale-[0.98] transition-transform duration-150"
              style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
            >
              Start Free Session
              <ChevronRight className="w-6 h-6" />
            </button>

            <button
              onClick={onCreatePlan}
              className="w-full bg-[#1F2937] border border-[#374151] text-[#F9FAFB] font-bold text-xl py-5 rounded-2xl flex items-center justify-between px-6 cursor-pointer active:scale-[0.98] transition-transform duration-150"
              style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
            >
              Create a plan
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      <BottomNav active="home" />
    </main>
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
  return (
    <main className="min-h-screen bg-[#111827] flex flex-col max-w-md mx-auto pb-20">
      <div className="px-6 pt-14 pb-6">
        <button onClick={onBack} className="text-[#6B7280] text-sm mb-5 cursor-pointer">
          ← Back
        </button>
        <h1
          className="text-[#F9FAFB] text-5xl font-bold leading-none tracking-tight"
          style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
        >
          Choose Plan
        </h1>
      </div>

      <div className="flex-1 px-6 space-y-3 overflow-y-auto">
        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 text-center">
            <p className="text-[#9CA3AF] text-base font-medium">No plans yet</p>
            <p className="text-[#6B7280] text-sm mt-1">Go to Plans to create one first</p>
          </div>
        ) : (
          plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => onSelect(plan)}
              className="w-full flex items-center justify-between rounded-2xl bg-[#1F2937] border border-[#374151] px-4 py-4 gap-3 cursor-pointer active:scale-[0.98] transition-transform duration-150"
            >
              <div className="text-left">
                <p className="text-[#F9FAFB] font-semibold text-base">{plan.name}</p>
                <p className="text-[#6B7280] text-sm mt-0.5">
                  {plan.days.length} day{plan.days.length !== 1 ? 's' : ''}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#4B5563] flex-shrink-0" />
            </button>
          ))
        )}
      </div>

      <BottomNav active="home" />
    </main>
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
  const today = todayWeekday();
  const nextDayIndex = getNextDayIndex(plan, sessions);
  const nextDayRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    nextDayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  return (
    <main className="min-h-screen bg-[#111827] flex flex-col max-w-md mx-auto pb-20">
      <div className="px-6 pt-14 pb-6">
        <button onClick={onBack} className="text-[#6B7280] text-sm mb-5 cursor-pointer">
          ← Back
        </button>
        <p className="text-[#6B7280] text-xs font-medium tracking-widest uppercase mb-1">
          {plan.name}
        </p>
        <h1
          className="text-[#F9FAFB] text-5xl font-bold leading-none tracking-tight"
          style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
        >
          Choose Day
        </h1>
      </div>

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
                isNext ? 'bg-[#F97316]/10 border-[#F97316]/40' : 'bg-[#1F2937] border-[#374151]'
              }`}
            >
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <p className="text-[#F9FAFB] font-semibold text-base">
                    {day.name || 'Unnamed Day'}
                  </p>
                  {isNext && (
                    <span className="text-[#F97316] text-xs font-semibold bg-[#F97316]/10 px-2 py-0.5 rounded-full">
                      Next
                    </span>
                  )}
                  {isSuggested && !isNext && (
                    <span className="text-[#6B7280] text-xs bg-[#1F2937] border border-[#374151] px-2 py-0.5 rounded-full">
                      Today
                    </span>
                  )}
                </div>
                <p className="text-[#6B7280] text-sm mt-0.5">
                  {coreCount} core{optionalCount > 0 ? ` · ${optionalCount} optional` : ''}
                </p>
                {day.weekdays.length > 0 && (
                  <p className="text-[#4B5563] text-xs mt-1">
                    {day.weekdays.map((w) => WEEKDAYS[w]).join(', ')}
                  </p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-[#4B5563] flex-shrink-0" />
            </button>
          );
        })}
      </div>

      <BottomNav active="home" />
    </main>
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
    <main className="min-h-screen bg-[#111827] flex flex-col max-w-md mx-auto pb-32">
      <div className="px-6 pt-14 pb-6">
        <button onClick={onBack} className="text-[#6B7280] text-sm mb-5 cursor-pointer">
          ← Back
        </button>
        <p className="text-[#6B7280] text-xs font-medium tracking-widest uppercase mb-1">
          {plan.name} · {day.name}
        </p>
        <h1
          className="text-[#F9FAFB] text-5xl font-bold leading-none tracking-tight"
          style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
        >
          Optional Exercises
        </h1>
        <p className="text-[#6B7280] text-sm mt-2">
          Core exercises are pre-selected. Add optional ones below.
        </p>
      </div>

      <div className="flex-1 px-6 space-y-4 overflow-y-auto pb-4">
        {/* Core exercises (read-only) */}
        {day.coreExercises.length > 0 && (
          <div>
            <p className="text-[#9CA3AF] text-xs font-medium uppercase tracking-wide mb-2">
              Core (always included)
            </p>
            <div className="space-y-2">
              {day.coreExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center gap-3 bg-[#1F2937] border border-[#374151] rounded-xl px-3 py-2.5"
                >
                  <div className="w-5 h-5 rounded-md bg-[#F97316] flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-[#F9FAFB] text-sm font-medium">{ex.name}</p>
                    <p className="text-[#F97316] text-xs">
                      {ex.type === 'sets-reps'
                        ? `${ex.sets}×${ex.reps}`
                        : `${ex.sets}×${ex.duration}s`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optional exercises (toggle) */}
        {day.optionalExercises.length > 0 ? (
          <div>
            <p className="text-[#9CA3AF] text-xs font-medium uppercase tracking-wide mb-2">
              Optional
            </p>
            <div className="space-y-2">
              {day.optionalExercises.map((ex) => {
                const checked = selected.has(ex.id);
                return (
                  <button
                    key={ex.id}
                    onClick={() => toggle(ex.id)}
                    className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 cursor-pointer transition-colors duration-150 text-left ${
                      checked ? 'bg-[#1F2937] border-[#F97316]/50' : 'bg-[#111827] border-[#374151]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        checked ? 'bg-[#F97316] border-[#F97316]' : 'border-[#4B5563]'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                    <div>
                      <p className="text-[#F9FAFB] text-sm font-medium">{ex.name}</p>
                      <p className="text-[#6B7280] text-xs">
                        {ex.type === 'sets-reps'
                          ? `${ex.sets}×${ex.reps}`
                          : `${ex.sets}×${ex.duration}s`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-[#6B7280] text-sm">No optional exercises in this day.</p>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-6 pb-10 pt-6 bg-gradient-to-t from-[#111827] via-[#111827]/90 to-transparent">
        <button
          onClick={() => onStart(selected)}
          className="w-full bg-[#F97316] text-white font-bold text-lg py-4 rounded-2xl cursor-pointer active:scale-[0.98] transition-transform duration-150"
          style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
        >
          Start Session
        </button>
      </div>
    </main>
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
  onFinish: () => void;
  onDiscard: () => void;
}) {
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

  const handleComplete = (id: string) => {
    const updated: ActiveSession = {
      ...session,
      exercises: session.exercises.map((e) =>
        e.id === id ? { ...e, completed: !e.completed } : e,
      ),
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

  const remaining = session.exercises.filter((e) => !e.completed && !e.dismissed);
  const completed = session.exercises.filter((e) => e.completed && !e.dismissed);
  const dismissed = session.exercises.filter((e) => e.dismissed);
  const totalCount = session.exercises.length;

  return (
    <main className="min-h-screen bg-[#111827] flex flex-col max-w-md mx-auto pb-20">
      {/* Header */}
      <div className="px-6 pt-14 pb-6">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[#6B7280] text-xs font-medium tracking-widest uppercase">
            {formatDate()}
          </p>
          <SessionTimer startedAt={session.startedAt} />
        </div>
        <h1
          className="text-[#F9FAFB] text-5xl font-bold mt-1 leading-none tracking-tight"
          style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
        >
          {session.planDayName ?? 'Free Session'}
        </h1>
        {session.planName && (
          <p className="text-[#F97316] text-sm mt-1 font-medium">{session.planName}</p>
        )}
        {totalCount > 0 && (
          <p className="text-[#6B7280] text-sm mt-2">
            {remaining.length} remaining · {completed.length} done
          </p>
        )}
      </div>

      {/* Exercise list */}
      <div className="flex-1 px-6 pb-52 space-y-3 overflow-y-auto">
        {totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 text-center select-none">
            <div className="w-20 h-20 rounded-full bg-[#1F2937] border border-[#374151] flex items-center justify-center mb-5">
              <Dumbbell className="w-9 h-9 text-[#374151]" />
            </div>
            <p className="text-[#9CA3AF] text-base font-medium">No exercises yet</p>
            <p className="text-[#6B7280] text-sm mt-1">Tap the button below to add one</p>
          </div>
        ) : (
          <>
            {remaining.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onComplete={() => handleComplete(exercise.id)}
                onDismiss={() => handleDismiss(exercise.id)}
              />
            ))}

            {completed.length > 0 && (
              <>
                <p className="text-[#6B7280] text-xs font-medium uppercase tracking-wide pt-2">
                  Completed
                </p>
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
                <p className="text-[#4B5563] text-xs font-medium uppercase tracking-wide pt-2">
                  Skipped
                </p>
                {dismissed.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onComplete={() => handleComplete(exercise.id)}
                    onDismiss={() => handleDismiss(exercise.id)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* Bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-6 pb-10 pt-4 bg-gradient-to-t from-[#111827] via-[#111827]/95 to-transparent space-y-2">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-[#1F2937] border border-[#374151] text-[#F9FAFB] font-bold text-base py-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-transform duration-150"
          style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Add Exercise
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDiscardConfirm(true)}
            className="flex-1 py-3.5 rounded-2xl border border-[#374151] text-[#9CA3AF] font-semibold text-sm cursor-pointer"
          >
            Discard
          </button>
          <button
            onClick={() => setShowCompleteOverlay(true)}
            className="flex-[2] bg-[#F97316] text-white font-bold text-base py-3.5 rounded-2xl cursor-pointer active:scale-[0.98] transition-transform duration-150"
            style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
          >
            Finish Session
          </button>
        </div>
      </div>

      <AddExerciseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAdd}
      />

      {/* Session complete overlay */}
      {showCompleteOverlay && (
        <SessionCompleteOverlay
          exercises={session.exercises}
          startedAt={session.startedAt}
          onDismiss={() => {
            setShowCompleteOverlay(false);
            onFinish();
          }}
        />
      )}

      {/* Discard confirmation */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end max-w-md mx-auto">
          <div className="w-full bg-[#1F2937] rounded-t-3xl px-6 pt-6 pb-10">
            <h3
              className="text-[#F9FAFB] text-2xl font-bold mb-2"
              style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
            >
              Discard Session?
            </h3>
            <p className="text-[#9CA3AF] text-sm mb-6">This session will not be saved.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDiscardConfirm(false)}
                className="flex-1 py-3.5 rounded-2xl border border-[#374151] text-[#9CA3AF] font-semibold cursor-pointer"
              >
                Keep Going
              </button>
              <button
                onClick={onDiscard}
                className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white font-semibold cursor-pointer active:scale-[0.98] transition-transform"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const [activeSession, setActive] = useState<ActiveSession | null>(() => getActiveSession());
  const [step, setStep] = useState<Step>(() => (getActiveSession() ? 'session' : 'start'));
  const [plans, setPlans] = useState<WorkoutPlan[]>(() => getPlans());
  const [sessions] = useState<WorkoutSession[]>(() => getSessions());

  const sessionsByDate = sessions.reduce<Record<string, string[]>>((acc, s) => {
    if (!s.completedAt) return acc;
    const date = s.completedAt.slice(0, 10);
    if (!acc[date]) acc[date] = [];
    acc[date].push(s.id);
    return acc;
  }, {});
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
      scalingNote?: string;
    }): Exercise => ({
      id: crypto.randomUUID(),
      name: ex.name,
      type: ex.type,
      sets: ex.sets,
      reps: ex.reps,
      duration: ex.duration,
      scalingNote: ex.scalingNote,
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
    };
    setActiveSession(session);
    setActive(session);
    setStep('session');
  };

  const handleSessionUpdate = (session: ActiveSession) => {
    setActiveSession(session);
    setActive(session);
  };

  const handleFinish = () => {
    if (!activeSession) return;
    saveSession({
      id: activeSession.id,
      startedAt: activeSession.startedAt,
      completedAt: new Date().toISOString(),
      exercises: activeSession.exercises,
      planId: activeSession.planId,
      planDayId: activeSession.planDayId,
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

  const greeting = isFirstVisit ? `Welcome, ${userName}!` : `Welcome back, ${userName}!`;

  return (
    <StartScreen
      hasPlans={plans.length > 0}
      onFollowPlan={() => {
        setPlans(getPlans()); // refresh
        setStep('pick-plan');
      }}
      onFreeSession={startFreeSession}
      onCreatePlan={() => router.push('/plans/new')}
      greeting={greeting}
      sessionsByDate={sessionsByDate}
    />
  );
}
