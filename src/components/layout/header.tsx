'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const navItems = [
  { href: '/', label: 'Главная' },
  { href: '/explore', label: 'Кружки' },
  { href: '/circle', label: 'Мой кружок' },
  { href: '/settings', label: 'Настройки' }
];

export const Header = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-slate-950/70 border-b border-white/10">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="font-semibold text-lg tracking-tight text-brand-foreground">
          WeekCrew
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'relative rounded-full px-3 py-1 transition-colors duration-200',
                  isActive
                    ? 'text-slate-950'
                    : 'text-slate-200/80 hover:text-brand-foreground'
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-nav"
                    className="absolute inset-0 rounded-full bg-brand"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 mix-blend-difference">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
