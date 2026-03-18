'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';
import { getConsentAccepted } from '@/lib/storage';

const POSTHOG_KEY = 'phc_6ijDAoR6hSveVX79OAuDy5ogb4j36vyvi0nqjTp1VQD';
const POSTHOG_HOST = 'https://eu.i.posthog.com';

export function initPostHog() {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? POSTHOG_HOST,
    capture_pageview: 'history_change',
    before_send: (event) => {
      if (!event) return event;
      const sensitiveIds = ['ai-api-key'];
      const props = event.properties;
      if (props) {
        // Strip any captured values from sensitive inputs
        if (props['$element_attr_id'] && sensitiveIds.includes(props['$element_attr_id'])) {
          props['$el_text'] = null;
          props['$element_attr_value'] = null;
        }
        // Strip name/sex fields from any form capture
        for (const key of ['name', 'sex', 'apiKey', 'api_key']) {
          if (key in props) delete props[key];
        }
      }
      return event;
    },
  });
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (getConsentAccepted()) {
      initPostHog();
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
