import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MobileNav } from '@/components/layout/mobile-nav';
import { ClientProviders } from '@/components/providers/client-providers';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'UYAN.chat — интернет без лайков и шума',
  description:
    'UYAN.chat — анонимная почта тёплых слов. Делись мыслями и получай поддержку от людей со всего мира без регистрации и алгоритмов.',
  manifest: '/manifest.json',
  appleWebApp: {
    title: 'UYAN.chat',
    statusBarStyle: 'default'
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg'
  }
};

export const viewport: Viewport = {
  themeColor: '#101828'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} font-sans`}>
      <body className="min-h-screen bg-[#f8f5ff] text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50">
        <ClientProviders>
          <div className="flex min-h-screen flex-col pb-16 sm:pb-0">
            <Header />
            <main className="flex-1 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_rgba(235,234,255,0.7))] transition-colors duration-300 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900/70 dark:to-slate-950">
              <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-12">{children}</div>
            </main>
            <Footer />
            <MobileNav />
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
