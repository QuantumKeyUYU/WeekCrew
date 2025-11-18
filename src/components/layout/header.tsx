'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useTranslation } from '@/i18n/useTranslation';
import { useWeekcrewSnapshot } from '@/lib/weekcrewStorage';

export const Header = () => {
  const pathname = usePathname();
  const t = useTranslation();
  const { currentCircle } = useWeekcrewSnapshot((snapshot) => ({
    currentCircle: snapshot.currentCircle,
  }));

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Если у пользователя уже есть активный кружок, показываем «Новый круг» вместо «Интересы».
  // В обычном состоянии вход в систему идёт через выбор интересов.
  const hasCircle = Boolean(currentCircle);

  const navItems = hasCircle
    ? [
        { href: '/circle', labelKey: 'nav_my_circle' },
        { href: '/explore', labelKey: 'nav_new_circle' },
        { href: '/settings', labelKey: 'nav_settings' },
      ]
    : [
        { href: '/explore', labelKey: 'nav_interests' },
        { href: '/circle', labelKey: 'nav_my_circle' },
        { href: '/settings', labelKey: 'nav_settings' },
      ];

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 border-b border-transparent transition-all duration-300 ease-out',
        'backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-slate-900/70',
        isScrolled
          ? 'bg-white/90 text-slate-900 shadow-[0_12px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/95 dark:text-slate-50'
          : 'bg-transparent text-slate-900 dark:text-slate-50',
      )}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          aria-label="WeekCrew — на главную"
          className="inline-flex items-center rounded-full px-3 py-1.5 text-base font-semibold tracking-tight text-slate-900 transition-all duration-200 ease-out hover:text-brand-foreground hover:shadow-[0_0_24px_rgba(111,91,233,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:text-white"
        >
          WeekCrew
        </Link>
        <nav className="flex w-full flex-1 justify-end">
          <div className="flex w-full items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 p-1 text-[13px] font-medium text-slate-600 shadow-[0_12px_35px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/10 dark:text-slate-100 sm:w-auto sm:text-sm">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const label = t(item.labelKey);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'group relative flex min-h-[40px] flex-1 items-center justify-center rounded-full px-3 py-2 text-[13px] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:min-w-[120px] sm:flex-none sm:px-4 sm:text-sm',
                    isActive
                      ? 'font-semibold text-slate-900 dark:text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-100',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {!isActive && (
                    <span className="absolute inset-0 rounded-full border border-transparent bg-slate-900/5 opacity-0 transition-all duration-200 ease-out group-hover:opacity-100 dark:bg-white/15" />
                  )}
                  {isActive && (
                    <motion.span
                      layoutId="active-nav"
                      className="absolute inset-0 rounded-full bg-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] ring-1 ring-brand/40 dark:bg-brand/80 dark:shadow-[0_12px_30px_rgba(2,6,23,0.6)]"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1 text-sm font-medium">
                    {item.labelKey === 'nav_new_circle' && <span aria-hidden className="text-base leading-none text-brand">＋</span>}
                    <span>{label}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
};
