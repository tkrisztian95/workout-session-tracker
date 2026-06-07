import type { Metadata, Viewport } from 'next';
import { Barlow, Barlow_Condensed } from 'next/font/google';
import { LocaleProvider } from '@/lib/locale-context';
import { ThemeProvider } from '@/lib/theme-context';
import { PostHogProvider } from '@/components/PostHogProvider';
import MuscleMigrationToast from '@/components/MuscleMigrationToast';
import DevSeed from '@/components/DevSeed';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import './globals.css';

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-barlow',
});

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow-condensed',
});

export const metadata: Metadata = {
  title: 'Workout Tracker',
  description: 'Track your workout sessions',
  applicationName: 'Workout Tracker',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Workout',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0b1220',
};

const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('wst_theme');
    var resolved = t === 'light' ? 'light' : t === 'dark' ? 'dark' : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (resolved === 'light') document.documentElement.setAttribute('data-theme', 'light');
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-base" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${barlow.variable} ${barlowCondensed.variable} antialiased`}>
        <ServiceWorkerRegister />
        <PostHogProvider>
          <ThemeProvider>
            <LocaleProvider>
              {children}
              <MuscleMigrationToast />
              {(process.env.NODE_ENV === 'development' ||
                process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' ||
                process.env.NEXT_PUBLIC_VERCEL_ENV === 'development') && <DevSeed />}
            </LocaleProvider>
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
