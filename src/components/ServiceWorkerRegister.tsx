'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker (public/sw.js) so the app can launch and run
 * offline. Registration is skipped in development to avoid the service worker
 * caching stale assets across `next dev` rebuilds.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Registration failures (e.g. unsupported context) are non-fatal —
        // the app still works online without offline caching.
      });
    };

    // Register after load so it never competes with the initial render.
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });

    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
