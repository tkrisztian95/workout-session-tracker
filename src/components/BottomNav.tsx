'use client';

import Link from 'next/link';
import { Home, ClipboardList, Clock, BarChart2, User } from 'lucide-react';
import { useTranslations } from '@/lib/locale-context';

interface Props {
  active: 'home' | 'plans' | 'history' | 'stats' | 'profile';
}

export default function BottomNav({ active }: Props) {
  const t = useTranslations();

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-30">
      <div className="bg-surface border-t border-border flex pb-[env(safe-area-inset-bottom)]">
        <Link
          href="/"
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 cursor-pointer transition-colors ${active === 'home' ? 'text-brand' : 'text-dim'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs font-medium">{t.nav_home}</span>
        </Link>
        <Link
          href="/plans"
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 cursor-pointer transition-colors ${active === 'plans' ? 'text-brand' : 'text-dim'}`}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-xs font-medium">{t.nav_plans}</span>
        </Link>
        <Link
          href="/history"
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 cursor-pointer transition-colors ${active === 'history' ? 'text-brand' : 'text-dim'}`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-xs font-medium">{t.nav_history}</span>
        </Link>
        <Link
          href="/stats"
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 cursor-pointer transition-colors ${active === 'stats' ? 'text-brand' : 'text-dim'}`}
        >
          <BarChart2 className="w-5 h-5" />
          <span className="text-xs font-medium">{t.nav_stats}</span>
        </Link>
        <Link
          href="/profile"
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 cursor-pointer transition-colors ${active === 'profile' ? 'text-brand' : 'text-dim'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-xs font-medium">{t.nav_profile}</span>
        </Link>
      </div>
    </nav>
  );
}
