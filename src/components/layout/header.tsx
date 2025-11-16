'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useTranslation } from '@/i18n/useTranslation';

const navItems = [
  { href: '/', labelKey: 'nav_home' },
  { href: '/explore', labelKey: 'nav_circles' },
  { href: '/circle', labelKey: 'nav_my_circle' },
  { href: '/settings', labelKey: 'nav_settings' }
] as const;

export const Header = () => {
  const pathname = usePathname();
  const t = useTranslation();

  return (
    <header className="app-header sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 text-slate-50 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-white">
          WeekCrew
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const label = t(item.labelKey);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'group relative overflow-hidden rounded-full px-3 py-1 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                  isActive ? 'text-white' : 'text-slate-100/80 hover:text-white'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {!isActive && <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />}
                {isActive && (
                  <motion.span
                    layoutId="active-nav"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-brand to-brand/80 shadow-[0_6px_18px_rgba(127,90,240,0.35)] ring-1 ring-white/50"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
