'use client';

import { useEffect } from 'react';
import { seedDevDataIfEmpty } from '@/lib/devSeed';

export default function DevSeed() {
  useEffect(() => {
    seedDevDataIfEmpty().then((result) => {
      if (result.seeded) {
        console.info(
          `[dev-seed] populated localStorage with ${result.sessionCount} sample sessions`,
        );
      }
    });
  }, []);

  return null;
}
