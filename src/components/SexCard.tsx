'use client';

import { useState } from 'react';
import { ChevronDown, User } from 'lucide-react';
import { useTranslations } from '@/lib/locale-context';
import { getSex, saveSex } from '@/lib/storage';
import { FieldLabel, Select } from '@/components/ui';
import type { Sex } from '@/lib/types';

export default function SexCard() {
  const t = useTranslations();
  const [sex, setSex] = useState<Sex | null>(() => getSex());
  const [open, setOpen] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const next = value === '' ? null : (value as Sex);
    setSex(next);
    saveSex(next);
  }

  const activeLabel =
    sex === 'male'
      ? t.profile_sex_male
      : sex === 'female'
        ? t.profile_sex_female
        : t.profile_sex_not_specified;

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-4 py-4 cursor-pointer active:bg-elevated transition-colors duration-150"
      >
        <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-secondary" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-white text-sm font-semibold leading-tight">{t.profile_sex_label}</p>
          <p className="text-dim text-xs mt-0.5">{activeLabel}</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-border pt-3">
          <FieldLabel htmlFor="sex-select">{t.profile_sex_label}</FieldLabel>
          <Select id="sex-select" value={sex ?? ''} onChange={handleChange}>
            <option value="">{t.profile_sex_not_specified}</option>
            <option value="male">{t.profile_sex_male}</option>
            <option value="female">{t.profile_sex_female}</option>
          </Select>
        </div>
      )}
    </div>
  );
}
