import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { ReactNode } from 'react';

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
    statusBarStyle: 'default',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

// НОРМАЛЬНЫЙ viewport, чтобы не было странного масштаба
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#7F5AF0',
};

const themeInitScript = `(() => {
  try {
    if (typeof window === 'undefined') return;
    const storageKey = '${THEME_STORAGE_KEY}';
    const stored = window.localStorage.getItem(storageKey);
    const setting =
      stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
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
    <html lang="ru" className="h-full">
      <body className="min-h-screen transition-colors duration-300">
        <Script id="weekcrew-theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>

        <ClientProviders>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {/* Вся центровка и паддинги теперь в .app-shell внутри page.tsx */}
              {children}
            </main>
            <Footer />
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
