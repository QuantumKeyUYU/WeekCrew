import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ClientProviders } from '@/components/providers/client-providers';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'WeekCrew — кружки недели',
  description:
    'WeekCrew собирает уютные кружки недели: выбери интерес и пообщайся с небольшой компанией единомышленников за 7 дней.',
  manifest: '/manifest.json',
  themeColor: '#7F5AF0',
  appleWebApp: {
    title: 'WeekCrew',
    statusBarStyle: 'default'
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg'
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} font-sans`}>
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <ClientProviders>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 bg-gradient-to-b from-slate-950 via-slate-900/70 to-slate-950">
              <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
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
