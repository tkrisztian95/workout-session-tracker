'use client';

import { useLocale } from '@/lib/locale-context';
import { formatSessionDate } from '@/lib/sessionUtils';
import { LabelOverline } from '@/components/ui';

interface Props {
  iso: string;
  format?: 'short' | 'long';
  className?: string;
}

export default function SessionDateLabel({ iso, format = 'short', className }: Props) {
  const { locale } = useLocale();
  return (
    <LabelOverline className={className}>{formatSessionDate(iso, locale, format)}</LabelOverline>
  );
}
