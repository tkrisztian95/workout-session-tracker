'use client';

import { Button } from '@/components/ui';

interface PulsingButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function PulsingButton({ onClick, children, className }: PulsingButtonProps) {
  return (
    <div className={`relative ${className ?? ''}`}>
      <span className="absolute inset-0 rounded-2xl bg-brand motion-safe:animate-ping-sm opacity-60" />
      <Button onClick={onClick} className="relative w-full">
        {children}
      </Button>
    </div>
  );
}
