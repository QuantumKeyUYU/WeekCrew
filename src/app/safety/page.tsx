'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { primaryCtaClass, secondaryCtaClass } from '@/styles/tokens';
import { useTranslation } from '@/i18n/useTranslation';

const SAFETY_KEY = 'weekcrew:safety-accepted-v2';

export default function SafetyPage() {
  const router = useRouter();
  const t = useTranslation();
  const [ready, setReady] = useState(false);
  const donts = t('safety_dont_points').split('|');
  const okPoints = t('safety_ok_points').split('|');
  const codePoints = t('safety_code_points').split('|');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = window.localStorage.getItem(SAFETY_KEY);
      if (stored === '1') {
        router.replace('/explore');
        return;
      }
    } catch {
      // если localStorage отвалился — просто покажем экран
    }

    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {t('safety_loading')}
        </div>
      </main>
    );
  }

  const handleAccept = () => {
    try {
      window.localStorage.setItem(SAFETY_KEY, '1');
    } catch {
      // ок, не сохранилось, но жить можно
    }
    router.push('/explore');
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <section className="w-full max-w-3xl space-y-6 rounded-[2.75rem] border border-white/15 bg-slate-950/80 p-6 text-sm text-slate-50 shadow-[0_35px_110px_rgba(3,5,20,0.95)] backdrop-blur-xl sm:p-9">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand/70">{t('safety_intro_label')}</p>
          <h1 className="text-xl font-semibold sm:text-2xl">{t('safety_intro_title')}</h1>
          <p className="text-xs leading-relaxed text-slate-200/90 sm:text-sm">{t('safety_intro_description')}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-200">{t('safety_dont_title')}</p>
            <ul className="mt-2 space-y-2 text-xs leading-relaxed text-slate-100 sm:text-[13px]">
              {donts.map((point) => (
                <li key={point}>• {point}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-200">{t('safety_ok_title')}</p>
            <ul className="mt-2 space-y-2 text-xs leading-relaxed text-slate-100 sm:text-[13px]">
              {okPoints.map((point) => (
                <li key={point}>• {point}</li>
              ))}
            </ul>
          </article>
        </div>

        <div className="rounded-2xl border border-white/10 bg-brand/10 p-4 text-xs text-slate-100">{t('safety_disclaimer')}</div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-200">{t('safety_code_title')}</p>
          <ul className="mt-2 space-y-2 text-xs leading-relaxed text-slate-100 sm:text-[13px]">
            {codePoints.map((point) => (
              <li key={point}>• {point}</li>
            ))}
          </ul>
        </div>

        <p className="text-[11px] leading-relaxed text-slate-400">{t('safety_accept_notice')}</p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleAccept} className={`${primaryCtaClass} flex-1 justify-center sm:flex-none`}>
            {t('safety_acknowledge')}
          </button>
          <button onClick={handleBack} className={secondaryCtaClass}>
            {t('safety_back')}
          </button>
        </div>
      </section>
    </main>
  );
}
