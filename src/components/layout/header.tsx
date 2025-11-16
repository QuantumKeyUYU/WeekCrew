'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { NAV_ITEMS } from '@/data/navigation';

export const Header = () => {
  const pathname = usePathname();
  const [dbHealthy, setDbHealthy] = useState<'unknown' | 'ok' | 'error'>('unknown');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/v2/health')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) {
          return;
        }
        setDbHealthy(data?.database === 'ok' ? 'ok' : 'error');
      })
      .catch(() => {
        if (!cancelled) {
          setDbHealthy('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const mode = process.env.NODE_ENV === 'development' ? 'DEV' : 'PROD';

  return (
    <header className="app-header sticky top-0 z-50 border-b border-white/70 bg-[rgba(252,251,255,0.85)] text-slate-900 shadow-[0_6px_30px_rgba(15,23,42,0.05)] backdrop-blur supports-[backdrop-filter]:bg-[rgba(252,251,255,0.75)] transition-colors duration-300 dark:border-white/10 dark:bg-[rgba(1,6,24,0.86)] dark:text-slate-50">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="text-base font-semibold tracking-tight text-slate-900 transition-colors hover:text-brand-foreground dark:text-white sm:text-lg">
          UYAN.chat
        </Link>
        <nav className="flex flex-1 items-center justify-end overflow-x-auto">
          <div className="flex flex-wrap items-center gap-0.5 rounded-full border border-slate-200/70 bg-white/70 p-1 text-xs font-medium text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-100 sm:gap-1.5 sm:text-sm">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'group relative flex items-center rounded-full px-3 py-1.5 text-[13px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:px-3.5 sm:py-1.5 sm:text-sm',
                    isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {!isActive && <span className="absolute inset-0 rounded-full bg-slate-900/4 opacity-0 transition-all duration-200 group-hover:opacity-100 dark:bg-white/15" />}
                  {isActive && (
                    <motion.span
                      layoutId="active-nav"
                      className="absolute inset-0 rounded-full bg-white shadow-[0_10px_28px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/10 dark:bg-white/20 dark:shadow-[0_8px_22px_rgba(2,6,23,0.65)] dark:ring-white/25"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="ml-3 flex items-center gap-1 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-tight text-slate-600 shadow-[0_4px_16px_rgba(15,23,42,0.08)] dark:border-white/20 dark:bg-white/10 dark:text-white">
            <span className={clsx('h-2 w-2 rounded-full', dbHealthy === 'ok' ? 'bg-emerald-500' : dbHealthy === 'error' ? 'bg-amber-400' : 'bg-slate-400')} />
            {mode}
          </div>
        </nav>
      </div>
    </header>
  );
};
