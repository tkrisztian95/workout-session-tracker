'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

const POSTHOG_KEY = 'phc_6ijDAoR6hSveVX79OAuDy5ogb4j36vyvi0nqjTp1VQD';
const POSTHOG_HOST = 'https://eu.i.posthog.com';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? POSTHOG_HOST,
      capture_pageview: 'history_change',
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
