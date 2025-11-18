'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { useTranslation } from '@/i18n/useTranslation';
import { LanguageSwitch } from '@/components/layout/language-switch';

export const Header = () => {
  const t = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 border-b border-transparent transition-all duration-300 ease-out',
        'backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-[#050816]/60',
        isScrolled
          ? 'bg-white/85 text-slate-900 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#050816]/90 dark:text-white'
          : 'bg-transparent text-slate-900 dark:text-white',
      )}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          aria-label="WeekCrew — на главную"
          className="inline-flex items-center rounded-full px-3 py-1.5 text-base font-semibold tracking-tight text-slate-900 transition-all duration-200 ease-out hover:text-brand-foreground hover:shadow-[0_0_24px_rgba(111,91,233,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:text-white"
        >
          WeekCrew
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitch />
          <Link
            href="/settings"
            className="inline-flex items-center rounded-full border border-white/70 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_18px_45px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:text-brand-foreground dark:border-white/20 dark:bg-white/10 dark:text-white"
          >
            {t('nav_settings')}
          </Link>
        </div>
      </div>
    </header>
  );
};
