'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';
import { getConsentAccepted } from '@/lib/storage';

const DEFAULT_POSTHOG_HOST = 'https://eu.i.posthog.com';

export function initPostHog() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? DEFAULT_POSTHOG_HOST,
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
  posthog.register({ source: 'workout-sessions-tracker' });
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (getConsentAccepted()) {
      initPostHog();
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
