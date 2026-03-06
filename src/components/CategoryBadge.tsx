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
  return (
    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#374151] text-[#9CA3AF]">
      <span>{getCategoryEmoji(category)}</span>
      {category}
    </span>
  );
}
