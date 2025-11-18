'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import type { InterestTag } from '@/types';
import { INTERESTS } from '@/config/interests';
import { useAppStore } from '@/store/useAppStore';
import { useWeekcrewStorage } from '@/lib/weekcrewStorage';
import { useTranslation } from '@/i18n/useTranslation';
import { Notice } from '@/components/shared/notice';

export default function ExplorePage() {
  const router = useRouter();
  const firebaseReady = useAppStore((state) => state.firebaseReady);
  const t = useTranslation();
  const [pendingKey, setPendingKey] = useState<InterestTag | null>(null);
  const storage = useWeekcrewStorage();
  const panelClass =
    'rounded-3xl border border-slate-200/80 bg-[#fefcff] p-4 shadow-[0_12px_34px_rgba(15,23,42,0.05)] transition-colors dark:border-white/10 dark:bg-slate-900/70 sm:p-6';

  const handleSelect = async (interest: InterestTag) => {
    if (pendingKey) {
      return;
    }
    setPendingKey(interest);
    try {
      await storage.joinDemoCircleFromInterest(interest);
      router.push('/circle');
    } catch (error) {
      console.error(error);
      setPendingKey(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className={panelClass}>
        <h1 className="text-xl font-semibold text-brand-foreground sm:text-2xl">{t('explore_title')}</h1>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{t('explore_description')}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('explore_reminder')}</p>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3.5">
        {INTERESTS.map((interest) => (
          <button
            key={interest.key}
            onClick={() => handleSelect(interest.key)}
            className={clsx(
              'rounded-3xl border px-4 py-3 text-left text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:px-5 sm:py-4',
              pendingKey === interest.key
                ? 'border-brand bg-brand/10 text-slate-900 shadow-[0_15px_35px_rgba(127,90,240,0.15)] dark:text-white'
                : 'border-slate-200/70 bg-white/95 text-slate-700 shadow-[0_10px_26px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 hover:border-brand/30 hover:bg-white dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200',
              pendingKey && pendingKey !== interest.key ? 'cursor-wait opacity-60' : 'cursor-pointer'
            )}
            disabled={Boolean(pendingKey)}
          >
            <div className="text-sm font-semibold text-brand-foreground">{t(interest.labelKey)}</div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{t(interest.descriptionKey)}</p>
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-4 text-sm text-slate-600 shadow-[0_10px_26px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200" aria-live="polite">
        {!pendingKey && <p>{t('explore_status_idle')}</p>}
        {pendingKey && <p>{t('explore_status_loading')}</p>}
      </div>

      {!firebaseReady && (
        <Notice>
          <p>{t('firebase_demo_notice')}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Сейчас всё работает локально, без регистрации и серверов.</p>
        </Notice>
      )}
    </div>
  );
}
