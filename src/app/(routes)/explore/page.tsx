'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import type { InterestId } from '@/types';
import { INTERESTS } from '@/config/interests';
import { useTranslation } from '@/i18n/useTranslation';
import { motionTimingClass, primaryCtaClass } from '@/styles/tokens';
import { MOOD_OPTIONS, type MoodKey } from '@/constants/moods';
import { saveCircleSelection } from '@/lib/circleSelection';
import { LANGUAGE_INTERESTS } from '@/constants/language-interests';
import { TestModeHint } from '@/components/shared/test-mode-hint';
import { joinCircle } from '@/lib/api/circles';
import { useAppStore } from '@/store/useAppStore';
import { SafetyRulesModal } from '@/components/modals/safety-rules-modal';
import { useSafetyRules } from '@/hooks/useSafetyRules';

export default function ExplorePage() {
  const router = useRouter();
  const t = useTranslation();
  const setCircle = useAppStore((state) => state.setCircle);
  const setMessages = useAppStore((state) => state.setMessages);
  const { accepted, hydrated, markAccepted } = useSafetyRules();

  type InterestCard = { id: InterestId; label: string; emoji: string };

  const defaultInterestCards = useMemo<InterestCard[]>(
    () =>
      INTERESTS.map((interest) => ({
        id: interest.key,
        label: t(interest.labelKey),
        emoji: interest.emoji ?? '✨',
      })),
    [t],
  );

  const languageInterestCards = useMemo<InterestCard[]>(
    () =>
      LANGUAGE_INTERESTS.map((interest) => ({
        id: interest.id,
        label: t(interest.labelKey),
        emoji: interest.icon,
      })),
    [t],
  );

  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const [selectedInterest, setSelectedInterest] = useState<InterestId | null>(null);
  const [randomInterest, setRandomInterest] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [autoPrompted, setAutoPrompted] = useState(false);

  useEffect(() => {
    if (hydrated && !accepted && !autoPrompted) {
      setShowRulesModal(true);
      setAutoPrompted(true);
    }
  }, [hydrated, accepted, autoPrompted]);

  const moodLabel = selectedMood
    ? t(MOOD_OPTIONS.find((option) => option.key === selectedMood)?.labelKey ?? '')
    : null;

  const isLanguageMood = selectedMood === 'languages';
  const interestsToRender = isLanguageMood ? languageInterestCards : defaultInterestCards;
  const selectedInterestIsValid = interestsToRender.some((interest) => interest.id === selectedInterest);
  const effectiveInterest = selectedInterestIsValid ? selectedInterest : null;
  const selectionComplete = Boolean(selectedMood && (effectiveInterest || randomInterest));
  const canStart = Boolean(accepted && selectionComplete);

  const handleSelectInterest = (id: InterestId) => {
    if (joining) return;
    setSelectedInterest((prev) => (prev === id ? null : id));
    setRandomInterest(false);
  };

  const handleRandomInterest = () => {
    setRandomInterest((prev) => !prev);
    setSelectedInterest(null);
  };

  const handleStartCircle = async () => {
    if (!selectedMood || !selectionComplete || joining) {
      return;
    }
    if (!accepted) {
      setShowRulesModal(true);
      return;
    }
    setJoining(true);
    setError(null);

    const interestPool = interestsToRender.map((interest) => interest.id);
    const randomChoice = interestPool[Math.floor(Math.random() * interestPool.length)] ?? null;
    const interestId = randomInterest ? randomChoice : effectiveInterest;

    if (!interestId) {
      setJoining(false);
      return;
    }

    try {
      const response = await joinCircle({ mood: selectedMood, interest: interestId });
      setCircle(response.circle);
      setMessages(response.messages);
      saveCircleSelection({ mood: selectedMood, interestId });
      router.push('/circle');
    } catch (err) {
      console.error(err);
      setError(t('explore_error_message'));
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="space-y-8 py-6">
      <section className="app-hero overflow-hidden p-6 text-white shadow-[0_24px_120px_rgba(8,7,20,0.55)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">{t('explore_intro_label')}</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-[2.25rem]">{t('explore_page_title')}</h1>
        <p className="mt-3 text-base text-white/80">{t('explore_page_subtitle')}</p>
      </section>

      {!accepted && (
        <section className="rounded-3xl border border-amber-200 bg-amber-50/90 p-5 text-amber-900 shadow-[0_16px_40px_rgba(245,158,11,0.25)] dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-100">
          <p className="text-sm font-semibold">{t('explore_rules_notice')}</p>
          <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-100/70">{t('explore_rules_required')}</p>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowRulesModal(true)}
              className="inline-flex items-center rounded-full border border-transparent bg-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-amber-600 dark:bg-amber-400 dark:text-slate-900"
            >
              {t('explore_rules_button')}
            </button>
          </div>
        </section>
      )}

      <section className="app-panel p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
          {t('explore_step_one_title')}
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{t('explore_step_one_heading')}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t('explore_step_one_description')}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((mood) => {
            const active = selectedMood === mood.key;
            return (
              <button
                key={mood.key}
                type="button"
                onClick={() => setSelectedMood((prev) => (prev === mood.key ? null : mood.key))}
                className={clsx(
                  'app-chip px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                  active
                    ? 'border-brand/70 bg-brand text-white shadow-[0_0_30px_rgba(142,97,255,0.45)]'
                    : 'text-slate-600 hover:-translate-y-0.5 hover:text-brand-foreground dark:text-slate-200',
                )}
                aria-pressed={active}
              >
                {t(mood.labelKey)}
              </button>
            );
          })}
        </div>
        {moodLabel && (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            {t('explore_mood_selected_label', { mood: moodLabel })}
          </p>
        )}
      </section>

      <section className="app-panel space-y-4 p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
            {t('explore_step_two_title')}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{t('explore_step_two_heading')}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t('explore_step_two_description')}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {interestsToRender.map((card) => {
            const active = selectedInterest === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleSelectInterest(card.id)}
                className={clsx(
                  'rounded-3xl border px-5 py-4 text-left transition',
                  motionTimingClass,
                  active
                    ? 'border-brand/60 bg-brand/10 text-brand-foreground shadow-[0_0_30px_rgba(142,97,255,0.35)] dark:bg-brand/25 dark:text-white'
                    : 'border-slate-100/80 bg-white/90 text-slate-700 shadow-[0_20px_60px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 dark:border-white/10 dark:bg-[#050816]/60 dark:text-slate-100',
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
            'w-full rounded-3xl border border-dashed px-5 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
            randomInterest
              ? 'border-brand bg-brand/10 text-brand-foreground'
              : 'border-slate-300 text-slate-500 hover:border-brand/40 hover:text-brand-foreground dark:border-white/20 dark:text-slate-300',
          )}
        >
          {t('explore_random_button')}
        </button>
      </section>

      <section className="app-panel p-6 text-center">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('explore_ready_title')}</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t('explore_ready_description')}</p>
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
        {!accepted && (
          <p className="mt-2 text-xs text-amber-700 dark:text-amber-200">{t('explore_rules_required')}</p>
        )}
        {error && <p className="mt-3 text-sm text-red-500 dark:text-red-400">{error}</p>}
      </section>

      <TestModeHint />

      <SafetyRulesModal
        open={showRulesModal}
        onAccept={() => {
          markAccepted();
          setShowRulesModal(false);
        }}
        onClose={() => setShowRulesModal(false)}
      />
    </div>
  );
}
