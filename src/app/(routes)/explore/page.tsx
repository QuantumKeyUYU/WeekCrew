'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { INTERESTS } from '@/constants/interests';
import type { InterestTag } from '@/types';
import { joinOrCreateCircle } from '@/lib/circles';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/i18n/useTranslation';
import { Notice } from '@/components/shared/notice';

export default function ExplorePage() {
  const router = useRouter();
  const device = useAppStore((state) => state.device);
  const updateUser = useAppStore((state) => state.updateUser);
  const setCircle = useAppStore((state) => state.setCircle);
  const language = useAppStore((state) => state.settings.language ?? 'ru');
  const firebaseReady = useAppStore((state) => state.firebaseReady);
  const t = useTranslation();
  const [selected, setSelected] = useState<InterestTag | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const panelClass =
    'rounded-3xl border border-slate-200/80 bg-[#fefcff] p-4 shadow-[0_12px_34px_rgba(15,23,42,0.05)] transition-colors dark:border-white/10 dark:bg-slate-900/70 sm:p-6';

  const handleSelect = async (interest: InterestTag) => {
    if (status === 'loading') {
      return;
    }
    setSelected(interest);
    setStatus('loading');
    setError('');

    try {
      if (!device) {
        throw new Error(t('error_device_unavailable'));
      }
      const joinedCircle = await joinOrCreateCircle(interest, device.deviceId, { locale: language });
      setCircle(joinedCircle);
      updateUser((prev) => {
        if (!prev) {
          return null;
        }
        const interests = Array.from(new Set([...(prev.interests ?? []), interest]));
        return {
          ...prev,
          interests,
          currentCircleId: joinedCircle.id
        };
      });
      setStatus('success');
      router.push('/circle');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setError(err?.message || t('explore_status_error'));
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className={panelClass}>
        <h1 className="text-xl font-semibold text-brand-foreground sm:text-2xl">{t('explore_title')}</h1>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{t('explore_description')}</p>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3.5">
        {INTERESTS.map((interest) => (
          <button
            key={interest.id}
            onClick={() => handleSelect(interest.id)}
            className={clsx(
              'rounded-3xl border px-4 py-3 text-left text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:px-5 sm:py-4',
              selected === interest.id && status === 'loading'
                ? 'border-brand bg-brand/10 text-slate-900 shadow-[0_15px_35px_rgba(127,90,240,0.15)] dark:text-white'
                : 'border-slate-200/70 bg-white/95 text-slate-700 shadow-[0_10px_26px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 hover:border-brand/30 hover:bg-white dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200',
              status === 'loading' && selected !== interest.id ? 'cursor-wait opacity-60' : 'cursor-pointer'
            )}
            disabled={status === 'loading'}
          >
            <div className="text-sm font-semibold text-brand-foreground">{t(interest.labelKey)}</div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{t(interest.descriptionKey)}</p>
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-4 text-sm text-slate-600 shadow-[0_10px_26px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200" aria-live="polite">
        {status === 'idle' && <p>{t('explore_status_idle')}</p>}
        {status === 'loading' && <p>{t('explore_status_loading')}</p>}
        {status === 'success' && <p className="text-brand-foreground">{t('explore_status_success')}</p>}
        {status === 'error' && (
          <div className="flex flex-col gap-3">
            <p className="text-red-500 dark:text-red-300">{error}</p>
            <button
              onClick={() => selected && handleSelect(selected)}
              className="w-fit rounded-full border border-slate-300/80 px-4 py-1.5 text-xs font-medium text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/60 hover:text-brand-foreground dark:border-white/20 dark:text-slate-200"
            >
              {t('explore_retry')}
            </button>
          </div>
        )}
      </div>

      {!firebaseReady && <Notice>{t('firebase_demo_notice')}</Notice>}
    </div>
  );
}
