import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ClientProviders } from '@/components/providers/client-providers';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' });

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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} font-sans`}>
      <body className="min-h-screen bg-[#f9f7ff] text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50">
        <ClientProviders>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_rgba(235,234,255,0.7))] transition-colors duration-300 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900/70 dark:to-slate-950">
              <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-12">
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
