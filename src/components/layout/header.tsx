'use client';

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
    <header className="app-header sticky top-0 z-50 border-b border-white/70 bg-[rgba(252,251,255,0.85)] text-slate-900 shadow-[0_6px_30px_rgba(15,23,42,0.05)] backdrop-blur supports-[backdrop-filter]:bg-[rgba(252,251,255,0.75)] transition-colors duration-300 dark:border-white/10 dark:bg-[rgba(1,6,24,0.86)] dark:text-slate-50">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          aria-label="WeekCrew — на главную"
          className="inline-flex items-center rounded-full border border-transparent px-3 py-1 text-base font-semibold tracking-tight text-slate-900 transition-colors duration-200 hover:border-slate-200 hover:bg-white/80 hover:text-brand-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:text-white sm:text-lg"
        >
          WeekCrew
        </Link>
        <nav className="flex w-full flex-1 items-center justify-end sm:w-auto">
          <div className="flex w-full max-w-md flex-1 items-center gap-1 rounded-full border border-slate-200/70 bg-white/80 p-1 text-[13px] font-medium text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-slate-100 sm:max-w-none sm:gap-1.5 sm:text-sm">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const label = t(item.labelKey);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'group relative flex flex-1 items-center justify-center rounded-full px-2.5 py-1.5 text-[13px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:flex-none sm:px-3.5 sm:py-1.5 sm:text-sm',
                    isActive
                      ? 'font-semibold text-slate-900 dark:text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {!isActive && (
                    <span className="absolute inset-0 rounded-full bg-slate-900/4 opacity-0 transition-all duration-200 group-hover:opacity-100 dark:bg-white/15" />
                  )}
                  {isActive && (
                    <motion.span
                      layoutId="active-nav"
                      className="absolute inset-0 rounded-full bg-white shadow-[0_12px_30px_rgba(15,23,42,0.12)] ring-1 ring-brand/30 dark:bg-white/20 dark:shadow-[0_10px_26px_rgba(2,6,23,0.65)] dark:ring-white/35"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
};
