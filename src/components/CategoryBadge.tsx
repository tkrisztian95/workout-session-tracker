'use client';

import {
  Dumbbell,
  Target,
  Flame,
  Heart,
  Layers,
  Zap,
  Move,
  Activity,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from '@/lib/locale-context';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Arms: Dumbbell,
  Legs: Target,
  Abs: Flame,
  Chest: Heart,
  Back: Layers,
  Shoulders: Zap,
  Calves: Move,
  Cardio: Activity,
};

export default function CategoryBadge({ category }: { category: string }) {
  const t = useTranslations();
  const label = t.category_labels[category as keyof typeof t.category_labels] ?? category;
  const Icon = CATEGORY_ICONS[category] ?? Dumbbell;
  return (
    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-elevated text-secondary">
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
