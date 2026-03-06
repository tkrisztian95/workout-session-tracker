'use client';

import Link from 'next/link';
import { Home, ClipboardList, Clock } from 'lucide-react';

interface Props {
  active: 'home' | 'plans' | 'history';
}

export default function BottomNav({ active }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-30">
      <div className="bg-[#1F2937] border-t border-[#374151] flex">
        <Link
          href="/"
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 cursor-pointer transition-colors ${
            active === 'home' ? 'text-[#F97316]' : 'text-[#4B5563]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs font-medium">Home</span>
        </Link>
        <Link
          href="/plans"
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 cursor-pointer transition-colors ${
            active === 'plans' ? 'text-[#F97316]' : 'text-[#4B5563]'
          }`}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-xs font-medium">Plans</span>
        </Link>
        <Link
          href="/history"
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 cursor-pointer transition-colors ${
            active === 'history' ? 'text-[#F97316]' : 'text-[#4B5563]'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-xs font-medium">History</span>
        </Link>
      </div>
    </nav>
  );
}
