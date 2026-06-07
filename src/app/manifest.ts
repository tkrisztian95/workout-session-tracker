import type { MetadataRoute } from 'next';

// Native Next.js manifest route → served at /manifest.webmanifest and
// auto-linked from <head>. Declares the app as an installable, standalone
// PWA. Combined with the service worker (public/sw.js), this lets the app
// launch and run fully offline since all data lives in localStorage.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Workout Tracker',
    short_name: 'Workout',
    description: 'Track your workout sessions — works offline.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0b1220',
    theme_color: '#0b1220',
    icons: [
      {
        src: '/icon.svg',
        type: 'image/svg+xml',
        sizes: 'any',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        type: 'image/svg+xml',
        sizes: 'any',
        purpose: 'maskable',
      },
      {
        src: '/apple-icon.png',
        type: 'image/png',
        sizes: '180x180',
        purpose: 'any',
      },
    ],
  };
}
