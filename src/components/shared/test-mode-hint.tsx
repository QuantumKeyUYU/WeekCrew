'use client';

import clsx from 'clsx';
import { useTranslation } from '@/i18n/useTranslation';

interface TestModeHintProps {
  className?: string;
}

export const TestModeHint = ({ className }: TestModeHintProps) => {
  const t = useTranslation();

  return (
    <p className={clsx('text-center text-xs text-slate-500 dark:text-slate-400', 'opacity-90', className)}>
      {t('landing_test_mode_hint')}
    </p>
  );
};
