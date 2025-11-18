'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { InterestTag } from '@/types';
import { INTERESTS } from '@/config/interests';
import { useAppStore } from '@/store/useAppStore';
import { useWeekcrewStorage } from '@/lib/weekcrewStorage';
import { useTranslation } from '@/i18n/useTranslation';
import { Notice } from '@/components/shared/notice';
import { motionTimingClass, primaryCtaClass } from '@/styles/tokens';

type MoodKey = 'calm' | 'inspired' | 'support' | 'hobby';

export default function ExplorePage() {
  const router = useRouter();
  const firebaseReady = useAppStore((state) => state.firebaseReady);
  const t = useTranslation();
  const [pendingKey, setPendingKey] = useState<InterestTag | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const storage = useWeekcrewStorage();
  const interestCards = useMemo(
    () =>
      INTERESTS.map((interest) => ({
        key: interest.key,
        label: t(interest.labelKey),
        description: t(interest.descriptionKey),
      })),
    [t],
  );
  const moods = useMemo(
    () => [
      { key: 'calm' satisfies MoodKey, label: t('explore_mood_chip_calm') },
      { key: 'inspired' satisfies MoodKey, label: t('explore_mood_chip_inspired') },
      { key: 'support' satisfies MoodKey, label: t('explore_mood_chip_support') },
      { key: 'hobby' satisfies MoodKey, label: t('explore_mood_chip_hobby') },
    ],
    [t],
  );

  const selectedMoodLabel = selectedMood
    ? t('explore_mood_selected', {
        mood: moods.find((mood) => mood.key === selectedMood)?.label ?? '',
      })
    : t('explore_mood_placeholder');

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
      <section className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/95 to-brand/20 p-6 text-slate-50 shadow-[0_30px_80px_rgba(3,6,23,0.9)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{t('explore_intro_label')}</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{t('explore_title')}</h1>
        <p className="mt-3 text-sm text-slate-200/90 sm:text-base">{t('explore_description')}</p>
        <p className="mt-2 text-xs text-slate-300">{t('explore_reminder')}</p>

        <div className="mt-6 space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-4 text-white/90 shadow-[0_18px_55px_rgba(2,4,18,0.65)]">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">{t('explore_mood_title')}</p>
            <p className="text-sm text-slate-100/90 sm:text-base">{t('explore_mood_description')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {moods.map((mood) => {
              const isActive = selectedMood === mood.key;
              return (
                <button
                  key={mood.key}
                  type="button"
                  onClick={() => setSelectedMood((prev) => (prev === mood.key ? null : mood.key))}
                  className={clsx(
                    'rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'border-white/90 bg-white text-slate-900 shadow-[0_12px_25px_rgba(255,255,255,0.25)]'
                      : 'border-white/20 bg-white/5 text-white/80 hover:-translate-y-0.5 hover:border-white/50 hover:text-white',
                  )}
                  aria-pressed={isActive}
                >
                  {mood.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-white/70">{selectedMoodLabel}</p>
        </div>
      </section>

      <motion.div
        className="grid gap-3 sm:grid-cols-2"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: {} }}
      >
        <div className="sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            {t('explore_intro_label')}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{t('explore_title')}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{t('explore_interest_subtitle')}</p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{selectedMoodLabel}</p>
        </div>
        {interestCards.map((card, index) => (
          <motion.button
            key={card.key}
            custom={index}
            variants={{
              hidden: { opacity: 0, translateY: 12 },
              visible: { opacity: 1, translateY: 0, transition: { delay: index * 0.05 + 0.05, duration: 0.25, ease: 'easeOut' } },
            }}
            onClick={() => handleSelect(card.key)}
            className={clsx(
              'rounded-3xl border px-5 py-4 text-left',
              motionTimingClass,
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
              pendingKey === card.key
                ? 'border-brand bg-brand/10 text-slate-900 shadow-[0_18px_45px_rgba(120,90,240,0.2)] dark:text-white'
                : 'border-slate-200/70 bg-white/95 text-slate-700 shadow-[0_12px_30px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 hover:border-brand/40 hover:bg-white dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200',
              pendingKey && pendingKey !== card.key ? 'cursor-wait opacity-60' : 'cursor-pointer'
            )}
            disabled={Boolean(pendingKey)}
          >
            <div className="text-base font-semibold text-brand-foreground">{card.label}</div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{card.description}</p>
          </motion.button>
        ))}
      </motion.div>

      <div
        className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 text-sm text-slate-600 shadow-[0_12px_34px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200"
        aria-live="polite"
        aria-busy={Boolean(pendingKey)}
      >
        {!pendingKey && <p>{t('explore_status_idle')}</p>}
        {pendingKey && <p>{t('explore_status_loading')}</p>}
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t('explore_status_hint')}</p>
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-5 text-center text-sm text-slate-700 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
        <p className="font-semibold text-slate-900 dark:text-white">{t('explore_footer_title')}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('explore_footer_description')}</p>
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => handleSelect(pendingKey ?? INTERESTS[0].key)}
            className={`${primaryCtaClass} disabled:opacity-70`}
            disabled={Boolean(pendingKey)}
          >
            {t('explore_footer_cta')}
          </button>
        </div>
      </div>

      {!firebaseReady && (
        <Notice>
          <p>{t('firebase_demo_notice')}</p>
        </Notice>
      )}
    </div>
  );
}
