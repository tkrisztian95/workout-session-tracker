'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getActiveSession,
  setActiveSession,
  clearActiveSession,
  getPlans,
  getSessions,
  saveSession,
  getUserName,
  hasSeenConsent,
  getProfileCreatedAt,
  saveProfileCreatedAt,
  getHomeBackground,
} from '@/lib/storage';
import type { HomeBackground } from '@/lib/storage';
import UserNameModal from '@/components/UserNameModal';
import ConsentModal from '@/components/ConsentModal';
import AchievementCelebration from '@/components/AchievementCelebration';
import { useAchievements } from '@/hooks/useAchievements';
import { useTranslations } from '@/lib/locale-context';
import type { ActiveSession, Exercise, PlanDay, WorkoutPlan, WorkoutSession } from '@/lib/types';
import type { Muscle } from '@/lib/muscles';
import { StartScreen } from './_views/StartScreen';
import { PlanPickerScreen } from './_views/PlanPickerScreen';
import { DayPickerScreen } from './_views/DayPickerScreen';
import { OptionalPickerScreen } from './_views/OptionalPickerScreen';
import { SessionView } from './_views/SessionView';
import { calendarDaysAgo, todayWeekday } from './_views/helpers';

// ─── Steps ───────────────────────────────────────────────────────────────────

type Step = 'start' | 'pick-plan' | 'pick-day' | 'pick-optionals' | 'session';

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const t = useTranslations();
  const [mounted, setMounted] = useState(false);
  const [activeSession, setActive] = useState<ActiveSession | null>(null);
  const [step, setStep] = useState<Step>('start');
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState<PlanDay | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [homeBackground, setHomeBackground] = useState<HomeBackground>('velocity');
  const [consentSeen, setConsentSeen] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const { newUnlocks, allRecords, markSeen } = useAchievements();

  // Hydrate persisted state from localStorage after mount. Doing this in an
  // effect (rather than via useState lazy init) is required because the server
  // cannot read localStorage and would otherwise produce a different tree than
  // the client, causing a hydration mismatch.
  useEffect(() => {
    const active = getActiveSession();
    /* eslint-disable react-hooks/set-state-in-effect */
    setActive(active);
    setStep(active ? 'session' : 'start');
    setPlans(getPlans().filter((p) => (p.status ?? 'active') === 'active'));
    setSessions(getSessions());
    setUserName(getUserName());
    setHomeBackground(getHomeBackground());
    setConsentSeen(hasSeenConsent());
    setMounted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const handleNameComplete = (name: string) => {
    setUserName(name);
    setIsFirstVisit(true);
    if (getProfileCreatedAt() === null) {
      saveProfileCreatedAt(new Date().toISOString());
    }
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

  const beginPlanSession = (plan: WorkoutPlan, day: PlanDay, selectedOptionalIds: Set<string>) => {
    const toExercise = (ex: {
      name: string;
      type: Exercise['type'];
      sets?: number;
      reps?: number;
      repsPerSet?: number[];
      duration?: number;
      weightKg?: number;
      scalingNote?: string;
      muscle?: Muscle;
    }): Exercise => ({
      id: crypto.randomUUID(),
      name: ex.name,
      type: ex.type,
      sets: ex.sets,
      reps: ex.reps,
      repsPerSet: ex.repsPerSet,
      duration: ex.duration,
      weightKg: ex.weightKg,
      scalingNote: ex.scalingNote,
      muscle: ex.muscle,
    });
    const sharedExercises: Exercise[] = (plan.sharedExercises ?? []).map(toExercise);
    const coreExercises: Exercise[] = day.coreExercises.map(toExercise);
    const optionalExercises: Exercise[] = day.optionalExercises
      .filter((ex) => selectedOptionalIds.has(ex.id))
      .map(toExercise);
    const session: ActiveSession = {
      id: crypto.randomUUID(),
      startedAt: new Date().toISOString(),
      exercises: [...sharedExercises, ...coreExercises, ...optionalExercises],
      planId: plan.id,
      planDayId: day.id,
      planName: plan.name,
      planDayName: day.name,
      totalPausedMs: 0,
    };
    setActiveSession(session);
    setActive(session);
    setStep('session');
  };

  const startPlanSession = (selectedOptionalIds: Set<string>) => {
    if (!selectedPlan || !selectedDay) return;
    beginPlanSession(selectedPlan, selectedDay, selectedOptionalIds);
  };

  const handleSessionUpdate = (session: ActiveSession) => {
    setActiveSession(session);
    setActive(session);
  };

  const handleFinish = (rating?: 1 | 2 | 3 | 4 | 5): WorkoutSession | null => {
    if (!activeSession) return null;
    // Persist now (so the debrief can run against the stored record + its
    // evaluation), but defer teardown to handleFinishDone so the celebration
    // screen — including the inline AI debrief — stays mounted.
    return saveSession({
      id: activeSession.id,
      startedAt: activeSession.startedAt,
      completedAt: new Date().toISOString(),
      exercises: activeSession.exercises,
      planId: activeSession.planId,
      planDayId: activeSession.planDayId,
      rating,
    });
  };

  const handleFinishDone = () => {
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

  if (!mounted) return null;

  if (step === 'session' && activeSession) {
    return (
      <SessionView
        session={activeSession}
        onUpdate={handleSessionUpdate}
        onFinish={handleFinish}
        onFinishDone={handleFinishDone}
        onDiscard={handleDiscard}
      />
    );
  }

  if (step === 'pick-plan') {
    return (
      <PlanPickerScreen
        plans={plans}
        sessions={sessions}
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

  // New user just finished onboarding: full-page consent before entering the app
  if (!consentSeen && isFirstVisit) {
    return <ConsentModal onComplete={() => setConsentSeen(true)} />;
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

  // Days from active plans scheduled for today's weekday. Tapping one jumps
  // straight to the optional picker for that plan + day.
  const today = todayWeekday();
  const todaysSessions = plans.flatMap((plan) =>
    plan.days
      .filter((day) => day.weekdays.includes(today))
      .map((day) => ({
        planId: plan.id,
        dayId: day.id,
        planName: plan.name,
        dayName: day.name,
        coreCount: day.coreExercises.length,
        optionalCount: day.optionalExercises.length,
      })),
  );

  const startTodaysSession = (planId: string, dayId: string) => {
    const plan = plans.find((p) => p.id === planId);
    const day = plan?.days.find((d) => d.id === dayId);
    if (!plan || !day) return;
    // Nothing to choose: start the session straight away. Otherwise route
    // through the optional-exercise picker first.
    if (day.optionalExercises.length === 0) {
      beginPlanSession(plan, day, new Set());
      return;
    }
    setSelectedPlan(plan);
    setSelectedDay(day);
    setStep('pick-optionals');
  };

  return (
    <>
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
        todaysSessions={todaysSessions}
        onStartTodaysSession={startTodaysSession}
        achievementCount={allRecords.length}
        onOpenAchievements={() => router.push('/profile/achievements?from=home')}
        homeBackground={homeBackground}
      />
      {!consentSeen && <ConsentModal variant="modal" onComplete={() => setConsentSeen(true)} />}
      {consentSeen && newUnlocks.length > 0 && (
        <AchievementCelebration queue={newUnlocks} onDismiss={markSeen} />
      )}
    </>
  );
}
