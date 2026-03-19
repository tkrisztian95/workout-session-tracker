'use client';

import { useTranslations } from '@/lib/locale-context';
import { Button, HeadingXL } from '@/components/ui';

interface FinishSessionConfirmSheetProps {
  remainingCount: number;
  onKeepGoing: () => void;
  onFinish: () => void;
}

export default function FinishSessionConfirmSheet({
  remainingCount,
  onKeepGoing,
  onFinish,
}: FinishSessionConfirmSheetProps) {
  const t = useTranslations();

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end max-w-md mx-auto">
      <div className="w-full bg-surface rounded-t-3xl px-6 pt-6 pb-10">
        <HeadingXL as="h3" className="text-2xl mb-2">
          {t.finish_early_title}
        </HeadingXL>
        <p className="text-secondary text-sm mb-6">
          {t.finish_early_subtitle.replace('{count}', String(remainingCount))}
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onKeepGoing} className="flex-1 py-3.5">
            {t.keep_going}
          </Button>
          <Button onClick={onFinish} className="flex-1">
            {t.finish_anyway}
          </Button>
        </div>
      </div>
    </div>
  );
}
