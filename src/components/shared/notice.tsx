'use client';

import clsx from 'clsx';
import { ReactNode } from 'react';

interface NoticeProps {
  children: ReactNode;
  variant?: 'info' | 'warning';
}

const variantStyles = {
  info: 'border-brand/30 bg-white/90 text-slate-700 shadow-[0_10px_25px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100',
  warning: 'border-amber-400/50 bg-amber-500/10 text-amber-700 shadow-[0_10px_25px_rgba(251,191,36,0.25)] dark:border-amber-300/50 dark:bg-amber-500/20 dark:text-amber-50'
} as const;

export const Notice = ({ children, variant = 'info' }: NoticeProps) => {
  return (
    <div className={clsx('rounded-2xl border px-4 py-3 text-sm backdrop-blur', variantStyles[variant])}>
      {children}
    </div>
  );
};
