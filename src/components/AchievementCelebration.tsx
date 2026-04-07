'use client';

import { useState } from 'react';
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
import { ACHIEVEMENTS } from '@/lib/achievementDefs';
import type { AchievementRecord } from '@/lib/types';
import { Button } from '@/components/ui';

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

interface AchievementCelebrationProps {
  queue: AchievementRecord[];
  onDismiss: (id: string) => void;
}

export default function AchievementCelebration({ queue, onDismiss }: AchievementCelebrationProps) {
  const t = useTranslations();
  const [index, setIndex] = useState(0);

  if (queue.length === 0 || index >= queue.length) return null;

  const record = queue[index];
  const def = ACHIEVEMENTS.find((a) => a.id === record.id);
  const Icon = def ? (ICON_MAP[def.icon] ?? Trophy) : Trophy;

  type TranslationKey = keyof typeof t;
  const nameKey = `achievement_${record.id}_name` as TranslationKey;
  const descKey = `achievement_${record.id}_desc` as TranslationKey;
  const name = (t[nameKey] as string | undefined) ?? record.id;
  const description = (t[descKey] as string | undefined) ?? '';

  function handleDismiss() {
    onDismiss(record.id);
    if (index + 1 < queue.length) {
      setIndex(index + 1);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-base/90 backdrop-blur-sm px-6"
      onClick={handleDismiss}
    >
      <div
        className="w-full max-w-sm bg-surface border border-border rounded-3xl p-8 flex flex-col items-center gap-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-20 h-20 rounded-2xl bg-brand/15 flex items-center justify-center">
          <Icon className="w-10 h-10 text-brand" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs font-semibold text-brand tracking-widest uppercase">
            {t.achievement_celebration_label}
          </p>
          <h2 className="text-xl font-bold text-foreground">{name}</h2>
          <p className="text-sm text-secondary leading-snug">{description}</p>
        </div>
        {queue.length > 1 && index < queue.length && (
          <p className="text-xs text-dim">
            {index + 1} / {queue.length}
          </p>
        )}
        <Button onClick={handleDismiss} className="w-full">
          {t.achievement_celebration_dismiss}
        </Button>
      </div>
    </div>
  );
}
