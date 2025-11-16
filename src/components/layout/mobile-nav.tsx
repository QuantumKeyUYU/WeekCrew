'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { NAV_ITEMS } from '@/data/navigation';

export const MobileNav = () => {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/70 bg-white/90 py-2 shadow-[0_-12px_24px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/90 sm:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around px-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 text-[11px] font-semibold">
              <span
                className={clsx(
                  'rounded-full px-3 py-1 text-xs transition-colors',
                  isActive ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500 dark:text-slate-300'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
