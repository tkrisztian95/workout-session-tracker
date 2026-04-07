'use client';

import {
  Dumbbell,
  Flame,
  Zap,
  Star,
  Trophy,
  Crown,
  ClipboardList,
  CheckCircle,
  BookOpen,
  Library,
  CalendarCheck,
  Clock,
  Medal,
  Weight,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from '@/lib/locale-context';

const ICON_MAP: Record<string, LucideIcon> = {
  Dumbbell,
  Flame,
  Zap,
  Star,
  Trophy,
  Crown,
  ClipboardList,
  CheckCircle,
  BookOpen,
  Library,
  CalendarCheck,
  Clock,
  Medal,
  Weight,
};

interface AchievementBadgeProps {
  id: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export default function AchievementBadge({
  id,
  icon,
  unlocked,
  unlockedAt,
}: AchievementBadgeProps) {
  const t = useTranslations();
  const Icon = ICON_MAP[icon] ?? Trophy;

  type TranslationKey = keyof typeof t;
  const nameKey = `achievement_${id}_name` as TranslationKey;
  const descKey = `achievement_${id}_desc` as TranslationKey;

  const name = (t[nameKey] as string | undefined) ?? id;
  const description = (t[descKey] as string | undefined) ?? '';

  const unlockDate = unlockedAt
    ? new Date(unlockedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
        unlocked ? 'bg-surface border-border' : 'bg-surface/50 border-border/40 opacity-50'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          unlocked ? 'bg-brand/15' : 'bg-elevated'
        }`}
      >
        <Icon className={`w-5 h-5 ${unlocked ? 'text-brand' : 'text-muted'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold leading-tight ${unlocked ? 'text-foreground' : 'text-secondary'}`}
        >
          {name}
        </p>
        <p className="text-xs text-dim mt-0.5 leading-snug">{description}</p>
        {unlocked && unlockDate && (
          <p className="text-xs text-brand/70 mt-1">
            {t.achievement_unlocked_on.replace('{date}', unlockDate)}
          </p>
        )}
      </div>
    </div>
  );
}
