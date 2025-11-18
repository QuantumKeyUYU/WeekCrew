'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import type { InterestTag } from '@/types';
import { INTERESTS } from '@/config/interests';
import { useWeekcrewStorage } from '@/lib/weekcrewStorage';
import { useTranslation } from '@/i18n/useTranslation';
import { motionTimingClass, primaryCtaClass } from '@/styles/tokens';
import { MOOD_OPTIONS, type MoodKey } from '@/constants/moods';
import { saveCircleSelection } from '@/lib/circleSelection';

export default function ExplorePage() {
  const router = useRouter();
  const t = useTranslation();
  const storage = useWeekcrewStorage();

  const interestCards = useMemo(
    () =>
      INTERESTS.map((interest) => ({
        key: interest.key,
        label: t(interest.labelKey),
        emoji: interest.emoji,
      })),
    [t],
  );

  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const [selectedInterest, setSelectedInterest] = useState<InterestTag | null>(null);
  const [randomInterest, setRandomInterest] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moodLabel = selectedMood
    ? t(MOOD_OPTIONS.find((option) => option.key === selectedMood)?.labelKey ?? '')
    : null;

  const canStart = Boolean(selectedMood && (selectedInterest || randomInterest));

  const handleSelectInterest = (key: InterestTag) => {
    if (joining) return;
    setSelectedInterest((prev) => (prev === key ? null : key));
    setRandomInterest(false);
  };

  const handleRandomInterest = () => {
    setRandomInterest((prev) => !prev);
    setSelectedInterest(null);
  };

  const handleStartCircle = async () => {
    if (!selectedMood || !canStart || joining) {
      return;
    }
    setJoining(true);
    setError(null);

    const interestPool = INTERESTS.map((interest) => interest.key);
    const randomChoice = interestPool[Math.floor(Math.random() * interestPool.length)];
    const interestId = randomInterest ? randomChoice : selectedInterest!;

    try {
      await storage.joinDemoCircleFromInterest(interestId);
      saveCircleSelection({ mood: selectedMood, interestId });
      router.push('/circle');
    } catch (err) {
      console.error(err);
      setError(t('explore_error_message'));
      setJoining(false);
    }
  };

  return (
    <div className="space-y-8 py-6">
      <section className="rounded-[2.75rem] border border-white/10 bg-slate-950/80 p-6 text-white shadow-[0_35px_90px_rgba(5,7,22,0.85)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">{t('explore_intro_label')}</p>
        <h1 className="mt-3 text-3xl font-semibold">{t('explore_page_title')}</h1>
        <p className="mt-2 text-sm text-white/80">{t('explore_page_subtitle')}</p>
      </section>

      <section className="rounded-[2.5rem] border border-slate-200/70 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/70">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-300">{t('explore_step_one_title')}</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{t('explore_step_one_heading')}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{t('explore_step_one_description')}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((mood) => {
            const active = selectedMood === mood.key;
            return (
              <button
                key={mood.key}
                type="button"
                onClick={() => setSelectedMood((prev) => (prev === mood.key ? null : mood.key))}
                className={clsx(
                  'rounded-full border px-4 py-2 text-sm font-medium transition',
                  active
                    ? 'border-brand bg-brand/10 text-brand-foreground'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-brand/40 hover:text-brand-foreground dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200',
                )}
                aria-pressed={active}
              >
                {t(mood.labelKey)}
              </button>
            );
          })}
        </div>
        {moodLabel && <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">{t('explore_mood_selected_label', { mood: moodLabel })}</p>}
      </section>

      <section className="space-y-4 rounded-[2.5rem] border border-slate-200/70 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/70">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-300">{t('explore_step_two_title')}</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{t('explore_step_two_heading')}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{t('explore_step_two_description')}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {interestCards.map((card) => {
            const active = selectedInterest === card.key;
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => handleSelectInterest(card.key)}
                className={clsx(
                  'rounded-3xl border px-5 py-4 text-left text-slate-700 shadow-sm transition',
                  motionTimingClass,
                  active
                    ? 'border-brand bg-brand/5 text-brand-foreground'
                    : 'border-slate-200/80 bg-white hover:-translate-y-0.5 hover:border-brand/40 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100',
                )}
                aria-pressed={active}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden>
                    {card.emoji}
                  </span>
                  <span className="text-base font-semibold">{card.label}</span>
                </div>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={handleRandomInterest}
          className={clsx(
            'w-full rounded-3xl border px-5 py-3 text-sm font-medium transition',
            randomInterest
              ? 'border-brand bg-brand/10 text-brand-foreground'
              : 'border-dashed border-slate-300 text-slate-500 hover:border-brand/40 hover:text-brand-foreground dark:border-white/20 dark:text-slate-300',
          )}
        >
          {t('explore_random_button')}
        </button>
      </section>

      <section className="rounded-[2.5rem] border border-slate-200/70 bg-white/95 p-6 text-center shadow-[0_18px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/70">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('explore_ready_title')}</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{t('explore_ready_description')}</p>
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            className={clsx(primaryCtaClass, 'disabled:opacity-60')}
            disabled={!canStart || joining}
            onClick={handleStartCircle}
          >
            {joining ? t('explore_starting_state') : t('explore_start_button')}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-500 dark:text-red-400">{error}</p>}
      </section>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400">{t('test_mode_notice')}</p>
    </div>
  );
}
