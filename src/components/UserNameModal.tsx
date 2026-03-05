'use client';

import { useState } from 'react';
import { saveUserName } from '@/lib/storage';

interface UserNameModalProps {
  onComplete: (name: string) => void;
}

export default function UserNameModal({ onComplete }: UserNameModalProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    saveUserName(trimmed);
    onComplete(trimmed);
  };

  return (
    <div className="fixed inset-0 bg-[#111827] z-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1
          className="text-[#F9FAFB] text-4xl font-bold leading-tight tracking-tight mb-2"
          style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
        >
          What&apos;s your name?
        </h1>
        <p className="text-[#6B7280] text-sm mb-8">We&apos;ll use it to greet you.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoFocus
            className="w-full bg-[#1F2937] border border-[#374151] text-[#F9FAFB] placeholder-[#4B5563] rounded-2xl px-4 py-4 text-base outline-none focus:border-[#F97316] transition-colors"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-[#F97316] text-white font-bold text-xl py-4 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-150"
            style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
          >
            Let&apos;s Go
          </button>
        </form>
      </div>
    </div>
  );
}
