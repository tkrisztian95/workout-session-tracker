'use client';

import { useEffect, useState } from 'react';
import { clearDevSeed, resetToOnboarding, seedDevDataIfEmpty } from '@/lib/devSeed';

/**
 * Auto-seeds sample data on first load and renders a small floating dev panel.
 * Mounted only in local dev and Vercel preview (gated in `layout.tsx`), never
 * production — so the panel and the seed corpus stay out of the prod experience.
 */
export default function DevSeed() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    seedDevDataIfEmpty().then((result) => {
      if (result.seeded) {
        console.info(
          `[dev-seed] populated localStorage with ${result.sessionCount} sample sessions`,
        );
      }
    });
  }, []);

  // Wipe everything and re-seed fresh sample data.
  const reloadSeed = async () => {
    setBusy(true);
    clearDevSeed();
    await seedDevDataIfEmpty();
    window.location.reload();
  };

  // Wipe everything but suppress re-seeding, landing on a clean onboarding flow.
  const resetOnboarding = () => {
    setBusy(true);
    resetToOnboarding();
    window.location.reload();
  };

  return (
    <div className="fixed bottom-20 right-3 z-50">
      {open ? (
        <div className="w-56 space-y-2 rounded-2xl border border-warning/40 bg-elevated p-3 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-warning text-xs font-semibold uppercase tracking-wide">Dev tools</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-dim text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
          <p className="text-dim text-[11px] leading-snug">
            Local / preview only. Both actions wipe current data.
          </p>
          <button
            type="button"
            onClick={reloadSeed}
            disabled={busy}
            className="w-full rounded-lg bg-brand py-2 text-xs font-medium text-white cursor-pointer disabled:opacity-50"
          >
            Reload seed data
          </button>
          <button
            type="button"
            onClick={resetOnboarding}
            disabled={busy}
            className="w-full rounded-lg border border-warning/40 py-2 text-xs font-medium text-warning cursor-pointer disabled:opacity-50"
          >
            Reset to onboarding
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full border border-warning/40 bg-elevated px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-warning shadow-lg cursor-pointer"
        >
          Dev
        </button>
      )}
    </div>
  );
}
