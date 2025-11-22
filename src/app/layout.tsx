import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import Script from 'next/script';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ClientProviders } from '@/components/providers/client-providers';
import { THEME_STORAGE_KEY } from '@/constants/theme';

export const metadata: Metadata = {
  title: 'WeekCrew — кружки недели',
  description:
    'WeekCrew — новый кружок каждую неделю. Выбирай интерес и попадай в уютную команду на семь дней без шума и бесконечных лент.',
  manifest: '/manifest.json',
  appleWebApp: {
    title: 'WeekCrew',
    statusBarStyle: 'default'
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg'
  }
};

export const viewport: Viewport = {
  themeColor: '#7F5AF0'
};

const themeInitScript = `(() => {
  try {
    if (typeof window === 'undefined') return;
    const storageKey = '${THEME_STORAGE_KEY}';
    const stored = window.localStorage.getItem(storageKey);
    const setting = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = setting === 'system' ? (prefersDark ? 'dark' : 'light') : setting;
    const root = document.documentElement;
    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.dataset.theme = resolved;
    root.dataset.themeMode = setting;
  } catch (error) {
    console.warn('Failed to initialize theme preference', error);
  }
})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className="font-sans">
      <body className="min-h-screen text-slate-900 transition-colors duration-300 dark:text-slate-50">
        <Script id="weekcrew-theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <ClientProviders>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-12">
                {children}
              </div>
            </main>
            <Footer />
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
