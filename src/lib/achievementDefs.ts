import type { WorkoutSession, WorkoutPlan } from './types';

export type AchievementTrack = 'sessions' | 'plans' | 'weekly' | 'tenure' | 'volume';

export interface AchievementData {
  sessions: WorkoutSession[];
  plans: WorkoutPlan[];
  profileCreatedAt: string | null;
}

export interface AchievementDef {
  id: string;
  track: AchievementTrack;
  icon: string;
  check: (data: AchievementData) => boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysSince(isoDate: string): number {
  const ms = Date.now() - new Date(isoDate).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function distinctTrainingDaysInLast7(): (data: AchievementData) => number {
  return ({ sessions }) => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const days = new Set<string>();
    for (const s of sessions) {
      if (new Date(s.completedAt).getTime() >= cutoff) {
        days.add(s.completedAt.slice(0, 10));
      }
    }
    return days.size;
  };
}

function totalVolumeKg({ sessions }: AchievementData): number {
  let total = 0;
  for (const s of sessions) {
    for (const ex of s.exercises) {
      if (ex.loggedSets) {
        for (const set of ex.loggedSets) {
          total += set.weight * set.reps;
        }
      }
    }
  }
  return total;
}

const weeklyDays = distinctTrainingDaysInLast7();

// ─── Achievement catalog ──────────────────────────────────────────────────────

export const ACHIEVEMENTS: AchievementDef[] = [
  // Sessions track
  {
    id: 'session_first',
    track: 'sessions',
    icon: 'Dumbbell',
    check: ({ sessions }) => sessions.length >= 1,
  },
  {
    id: 'session_10',
    track: 'sessions',
    icon: 'Flame',
    check: ({ sessions }) => sessions.length >= 10,
  },
  {
    id: 'session_25',
    track: 'sessions',
    icon: 'Zap',
    check: ({ sessions }) => sessions.length >= 25,
  },
  {
    id: 'session_50',
    track: 'sessions',
    icon: 'Star',
    check: ({ sessions }) => sessions.length >= 50,
  },
  {
    id: 'session_100',
    track: 'sessions',
    icon: 'Trophy',
    check: ({ sessions }) => sessions.length >= 100,
  },
  {
    id: 'session_250',
    track: 'sessions',
    icon: 'Crown',
    check: ({ sessions }) => sessions.length >= 250,
  },

  // Plans track
  {
    id: 'plan_first_created',
    track: 'plans',
    icon: 'ClipboardList',
    check: ({ plans }) => plans.length >= 1,
  },
  {
    id: 'plan_first_completed',
    track: 'plans',
    icon: 'CheckCircle',
    check: ({ plans }) => plans.some((p) => p.status === 'completed'),
  },
  {
    id: 'plan_3_completed',
    track: 'plans',
    icon: 'CheckCircle',
    check: ({ plans }) => plans.filter((p) => p.status === 'completed').length >= 3,
  },
  {
    id: 'plan_5_completed',
    track: 'plans',
    icon: 'Award',
    check: ({ plans }) => plans.filter((p) => p.status === 'completed').length >= 5,
  },
  {
    id: 'plan_10_completed',
    track: 'plans',
    icon: 'Trophy',
    check: ({ plans }) => plans.filter((p) => p.status === 'completed').length >= 10,
  },
  {
    id: 'plan_5_created',
    track: 'plans',
    icon: 'BookOpen',
    check: ({ plans }) => plans.length >= 5,
  },
  {
    id: 'plan_10_created',
    track: 'plans',
    icon: 'Library',
    check: ({ plans }) => plans.length >= 10,
  },
  {
    id: 'plan_first_edited',
    track: 'plans',
    icon: 'PencilLine',
    check: ({ plans }) => plans.some((p) => p.updatedAt > p.createdAt),
  },
  {
    id: 'session_first_edited',
    track: 'sessions',
    icon: 'PencilLine',
    check: ({ sessions }) => sessions.some((s) => s.updatedAt !== undefined),
  },
  {
    id: 'session_first_imported',
    track: 'sessions',
    icon: 'FileInput',
    check: ({ sessions }) => sessions.some((s) => s.importedViaAi === true),
  },

  // Weekly track
  {
    id: 'weekly_2',
    track: 'weekly',
    icon: 'CalendarCheck',
    check: (data) => weeklyDays(data) >= 2,
  },
  {
    id: 'weekly_3',
    track: 'weekly',
    icon: 'CalendarCheck',
    check: (data) => weeklyDays(data) >= 3,
  },
  {
    id: 'weekly_4',
    track: 'weekly',
    icon: 'CalendarCheck',
    check: (data) => weeklyDays(data) >= 4,
  },
  {
    id: 'weekly_5',
    track: 'weekly',
    icon: 'CalendarCheck',
    check: (data) => weeklyDays(data) >= 5,
  },

  // Tenure track
  {
    id: 'tenure_1month',
    track: 'tenure',
    icon: 'Clock',
    check: ({ profileCreatedAt, sessions }) => {
      const anchor =
        profileCreatedAt ??
        (sessions.length > 0
          ? [...sessions].sort((a, b) => a.startedAt.localeCompare(b.startedAt))[0].startedAt
          : null);
      return anchor !== null && daysSince(anchor) >= 30;
    },
  },
  {
    id: 'tenure_3months',
    track: 'tenure',
    icon: 'Clock',
    check: ({ profileCreatedAt, sessions }) => {
      const anchor =
        profileCreatedAt ??
        (sessions.length > 0
          ? [...sessions].sort((a, b) => a.startedAt.localeCompare(b.startedAt))[0].startedAt
          : null);
      return anchor !== null && daysSince(anchor) >= 90;
    },
  },
  {
    id: 'tenure_6months',
    track: 'tenure',
    icon: 'Clock',
    check: ({ profileCreatedAt, sessions }) => {
      const anchor =
        profileCreatedAt ??
        (sessions.length > 0
          ? [...sessions].sort((a, b) => a.startedAt.localeCompare(b.startedAt))[0].startedAt
          : null);
      return anchor !== null && daysSince(anchor) >= 180;
    },
  },
  {
    id: 'tenure_1year',
    track: 'tenure',
    icon: 'Medal',
    check: ({ profileCreatedAt, sessions }) => {
      const anchor =
        profileCreatedAt ??
        (sessions.length > 0
          ? [...sessions].sort((a, b) => a.startedAt.localeCompare(b.startedAt))[0].startedAt
          : null);
      return anchor !== null && daysSince(anchor) >= 365;
    },
  },
  {
    id: 'tenure_2years',
    track: 'tenure',
    icon: 'Medal',
    check: ({ profileCreatedAt, sessions }) => {
      const anchor =
        profileCreatedAt ??
        (sessions.length > 0
          ? [...sessions].sort((a, b) => a.startedAt.localeCompare(b.startedAt))[0].startedAt
          : null);
      return anchor !== null && daysSince(anchor) >= 730;
    },
  },

  // Volume track
  {
    id: 'volume_1k',
    track: 'volume',
    icon: 'Weight',
    check: (data) => totalVolumeKg(data) >= 1_000,
  },
  {
    id: 'volume_10k',
    track: 'volume',
    icon: 'Weight',
    check: (data) => totalVolumeKg(data) >= 10_000,
  },
  {
    id: 'volume_100k',
    track: 'volume',
    icon: 'Weight',
    check: (data) => totalVolumeKg(data) >= 100_000,
  },
];
