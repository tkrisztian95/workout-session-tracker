'use client';

import { useTranslations } from '@/lib/locale-context';
import { Button, HeadingXL } from '@/components/ui';

interface DeletePlanConfirmSheetProps {
  planName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeletePlanConfirmSheet({
  planName,
  onConfirm,
  onCancel,
}: DeletePlanConfirmSheetProps) {
  const t = useTranslations();

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end max-w-md mx-auto">
      <div className="w-full bg-surface rounded-t-3xl px-6 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <HeadingXL as="h3" className="text-2xl mb-2">
          {t.delete_plan_title}
        </HeadingXL>
        <p className="text-secondary text-sm mb-6">
          {t.delete_plan_body.replace('{name}', planName)}
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onCancel} className="flex-1 py-3.5">
            {t.cancel}
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} className="flex-1 py-3.5">
            {t.delete}
          </Button>
        </div>
      </div>
    </div>
  );
}
