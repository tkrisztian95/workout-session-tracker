'use client';

import { Download } from 'lucide-react';
import { useTranslations } from '@/lib/locale-context';
import { downloadDataExport } from '@/lib/exportData';

export default function ExportDataCard() {
  const t = useTranslations();

  return (
    <div className="pt-2">
      <p className="text-xs font-semibold text-secondary tracking-widest uppercase mb-2 px-1">
        {t.profile_export_label}
      </p>
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <button
          onClick={downloadDataExport}
          className="w-full flex items-center gap-3 px-4 py-4 transition-colors duration-150 cursor-pointer active:bg-elevated"
        >
          <Download className="w-5 h-5 text-brand flex-shrink-0" />
          <span className="text-foreground text-base font-medium">{t.profile_export_button}</span>
        </button>
      </div>
    </div>
  );
}
