'use client';

import { useTranslations } from '@/lib/locale-context';

export function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    Arms: '💪',
    Legs: '🦵',
    Abs: '🔥',
    Chest: '🫀',
    Back: '🏋️',
    Shoulders: '🤸',
    Calves: '🦶',
    Cardio: '🏃',
  };
  return map[category] ?? '🏋️';
}

export default function CategoryBadge({ category }: { category: string }) {
  const t = useTranslations();
  const label = t.category_labels[category as keyof typeof t.category_labels] ?? category;
  return (
    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-elevated text-secondary">
      <span>{getCategoryEmoji(category)}</span>
      {label}
    </span>
  );
}
