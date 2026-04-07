'use client';

import { useState } from 'react';
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
} from '@/lib/storage';
import UserNameModal from '@/components/UserNameModal';
import ConsentModal from '@/components/ConsentModal';
import AchievementCelebration from '@/components/AchievementCelebration';
import { useAchievements } from '@/hooks/useAchievements';
import { useTranslations } from '@/lib/locale-context';
import type { ActiveSession, Exercise, PlanDay, WorkoutPlan, WorkoutSession } from '@/lib/types';
import { StartScreen } from './_views/StartScreen';
import { PlanPickerScreen } from './_views/PlanPickerScreen';
import { DayPickerScreen } from './_views/DayPickerScreen';
import { OptionalPickerScreen } from './_views/OptionalPickerScreen';
import { SessionView } from './_views/SessionView';
import { calendarDaysAgo } from './_views/helpers';

// ─── Steps ───────────────────────────────────────────────────────────────────

type Step = 'start' | 'pick-plan' | 'pick-day' | 'pick-optionals' | 'session';

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
  const [consentSeen, setConsentSeen] = useState(() => hasSeenConsent());
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const { newUnlocks, markSeen } = useAchievements();

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
      />
      {!consentSeen && <ConsentModal variant="modal" onComplete={() => setConsentSeen(true)} />}
      {consentSeen && newUnlocks.length > 0 && (
        <AchievementCelebration queue={newUnlocks} onDismiss={markSeen} />
      )}
    </>
  );
}
