'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dumbbell, ClipboardList, CalendarCheck, Clock, Weight, ChevronLeft } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { Page, PageHeader, HeadingXL } from '@/components/ui';
import { useTranslations } from '@/lib/locale-context';
import { useAchievements } from '@/hooks/useAchievements';
import { ACHIEVEMENTS, type AchievementTrack } from '@/lib/achievementDefs';
import AchievementBadge from '@/components/AchievementBadge';

const TRACK_ORDER: AchievementTrack[] = ['sessions', 'plans', 'weekly', 'tenure', 'volume'];

const TRACK_ICONS: Record<AchievementTrack, React.ReactNode> = {
  sessions: <Dumbbell className="w-4 h-4" />,
  plans: <ClipboardList className="w-4 h-4" />,
  weekly: <CalendarCheck className="w-4 h-4" />,
  tenure: <Clock className="w-4 h-4" />,
  volume: <Weight className="w-4 h-4" />,
};

function AchievementsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const { allRecords } = useAchievements();

  const unlockedIds = new Set(allRecords.map((r) => r.id));
  const unlockedMap = new Map(allRecords.map((r) => [r.id, r]));

  const backPath = searchParams.get('from') === 'home' ? '/' : '/profile';

  const unlockedCount = ACHIEVEMENTS.filter((a) => unlockedIds.has(a.id)).length;
  const totalCount = ACHIEVEMENTS.length;
  const progressLabel = t.achievements_progress
    .replace('{unlocked}', String(unlockedCount))
    .replace('{total}', String(totalCount));

  return (
    <Page className="pb-24">
      <PageHeader>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(backPath)}
            className="w-8 h-8 rounded-xl flex items-center justify-center active:bg-elevated transition-colors"
            aria-label={t.back}
          >
            <ChevronLeft className="w-5 h-5 text-secondary" />
          </button>
          <HeadingXL className="flex-1 flex items-baseline gap-2">
            {t.achievements_title}
            <span className="ml-auto text-2xl text-dim tabular-nums">
              ({progressLabel})
            </span>
          </HeadingXL>
        </div>
      </PageHeader>

      <div className="flex-1 px-5 overflow-y-auto space-y-6 pb-4">
        {TRACK_ORDER.map((track) => {
          const defs = ACHIEVEMENTS.filter((a) => a.track === track);
          type TranslationKey = keyof typeof t;
          const trackKey = `achievement_track_${track}` as TranslationKey;
          const trackLabel = (t[trackKey] as string | undefined) ?? track;

          return (
            <div key={track}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-secondary">{TRACK_ICONS[track]}</span>
                <h2 className="text-xs font-semibold text-secondary tracking-widest uppercase">
                  {trackLabel}
                </h2>
                <span className="text-xs text-dim ml-auto">
                  {defs.filter((d) => unlockedIds.has(d.id)).length}/{defs.length}
                </span>
              </div>
              <div className="space-y-2">
                {defs.map((def) => {
                  const record = unlockedMap.get(def.id);
                  return (
                    <AchievementBadge
                      key={def.id}
                      id={def.id}
                      icon={def.icon}
                      unlocked={unlockedIds.has(def.id)}
                      unlockedAt={record?.unlockedAt}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav active="profile" />
    </Page>
  );
}

export default function AchievementsPage() {
  return (
    <Suspense>
      <AchievementsContent />
    </Suspense>
  );
}
