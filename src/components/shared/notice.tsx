'use client';

import clsx from 'clsx';
import { ReactNode } from 'react';

interface NoticeProps {
  children: ReactNode;
  variant?: 'info' | 'warning';
}

const variantStyles = {
  info: 'border border-brand/30 bg-brand/5 text-slate-200',
  warning: 'border border-amber-400/40 bg-amber-500/10 text-amber-100'
} as const;

export const Notice = ({ children, variant = 'info' }: NoticeProps) => {
  return (
    <div className={clsx('rounded-2xl px-4 py-3 text-sm', variantStyles[variant])}>
      {children}
    </div>
  );
};
