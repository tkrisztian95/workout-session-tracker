export function todayWeekday(): number {
  return new Date().getDay();
}

export function formatDate(locale: string): string {
  return new Date().toLocaleDateString(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function calendarDaysAgo(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}
