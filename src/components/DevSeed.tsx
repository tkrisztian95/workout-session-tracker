'use client';

import { useEffect } from 'react';
import { seedDevDataIfEmpty } from '@/lib/devSeed';

export default function DevSeed() {
  useEffect(() => {
    const result = seedDevDataIfEmpty();
    if (result.seeded) {
      console.info('[dev-seed] populated localStorage with sample plan + sessions');
    }
  }, []);

  return null;
}
