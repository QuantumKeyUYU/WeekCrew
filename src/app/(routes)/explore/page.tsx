'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import type { InterestId } from '@/types';
import { INTERESTS } from '@/config/interests';
import { useTranslation } from '@/i18n/useTranslation';
import { motionTimingClass, primaryCtaClass } from '@/styles/tokens';
import { MOOD_OPTIONS, type MoodKey } from '@/constants/moods';
import { saveCircleSelection } from '@/lib/circleSelection';
import { LANGUAGE_INTERESTS } from '@/constants/language-interests';
import { TestModeHint } from '@/components/shared/test-mode-hint';
import { joinCircle } from '@/lib/api/circles';
import { getProfile } from '@/lib/api/profile';
import { useAppStore } from '@/store/useAppStore';
import { SafetyRulesModal } from '@/components/modals/safety-rules-modal';
import { useSafetyRules } from '@/hooks/useSafetyRules';
import { resetDeviceId } from '@/lib/device';
import { ApiError } from '@/lib/api-client';

export default function ExplorePage() {
  const router = useRouter();
  const t = useTranslation();
  const setCircle = useAppStore((state) => state.setCircle);
  const setMessages = useAppStore((state) => state.setMessages);
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const openProfileModal = useAppStore((state) => state.openProfileModal);
  const clearSession = useAppStore((state) => state.clearSession);
  const { accepted, hydrated, markAccepted } = useSafetyRules();

  type InterestCard = { id: InterestId; label: string; emoji: string };

  const defaultInterestCards: InterestCard[] = INTERESTS.map((interest) => ({
    id: interest.key,
    label: t(interest.labelKey),
    emoji: interest.emoji ?? '✨',
  }));

  const languageInterestCards: InterestCard[] = LANGUAGE_INTERESTS.map((interest) => ({
    id: interest.id,
    label: t(interest.labelKey),
    emoji: interest.icon,
  }));

  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const [selectedInterest, setSelectedInterest] = useState<InterestId | null>(null);
  const [randomInterest, setRandomInterest] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [autoPrompted, setAutoPrompted] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);
  const [showAssembling, setShowAssembling] = useState(false);

  useEffect(() => {
    if (hydrated && !accepted && !autoPrompted) {
      setShowRulesModal(true);
      setAutoPrompted(true);
    }
  }, [hydrated, accepted, autoPrompted]);

  useEffect(() => {
    if (profileChecked || user) {
      return;
    }
    let cancelled = false;
    getProfile()
      .then((response) => {
        if (cancelled) return;
        if (response.user) {
          setUser(response.user);
        } else {
          openProfileModal();
        }
      })
      .catch((error) => {
        console.error('Failed to load profile', error);
        if (!cancelled) {
          openProfileModal();
        }
      })
      .finally(() => {
        if (!cancelled) {
          setProfileChecked(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [openProfileModal, profileChecked, setUser, user]);

  const moodLabel = selectedMood
    ? t(MOOD_OPTIONS.find((option) => option.key === selectedMood)?.labelKey ?? '')
    : null;

  const isLanguageMood = selectedMood === 'languages';
  const interestsToRender = isLanguageMood ? languageInterestCards : defaultInterestCards;
  const selectedInterestIsValid = interestsToRender.some((interest) => interest.id === selectedInterest);
  const effectiveInterest = selectedInterestIsValid ? selectedInterest : null;
  const selectionComplete = Boolean(selectedMood && (effectiveInterest || randomInterest));
  const canStart = Boolean(accepted && selectionComplete);

  const stepMotion = useMemo(
    () => ({
      hidden: { opacity: 0, y: 16 },
      visible: (delay = 0) => ({ opacity: 1, y: 0, transition: { delay, duration: 0.35, ease: [0.16, 1, 0.3, 1] } }),
    }),
    [],
  );

  const handleSelectInterest = (id: InterestId) => {
    if (joining) return;
    setSelectedInterest((prev) => (prev === id ? null : id));
    setRandomInterest(false);
  };

  const handleRandomInterest = () => {
    setRandomInterest((prev) => !prev);
    setSelectedInterest(null);
  };

  useEffect(() => {
    if (selectionComplete) {
      setShowAssembling(true);
      const timer = setTimeout(() => setShowAssembling(false), 1500);
      return () => clearTimeout(timer);
    }
    setShowAssembling(false);
    return undefined;
  }, [selectionComplete]);

  const performJoin = useCallback(async () => {
    if (!selectedMood || !selectionComplete || joining) {
      return;
    }
    if (!accepted) {
      setShowRulesModal(true);
      return;
    }
    setJoining(true);
    setError(null);
    setErrorHint(null);

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
      if (err instanceof ApiError) {
        resetDeviceId();
        clearSession();
        setErrorHint(t('explore_error_recover'));
      }
      setError(t('explore_error_message'));
    } finally {
      setJoining(false);
    }
  }, [
    accepted,
    effectiveInterest,
    interestsToRender,
    joining,
    randomInterest,
    router,
    saveCircleSelection,
    clearSession,
    selectedMood,
    selectionComplete,
    setCircle,
    setMessages,
    t,
  ]);

  const handleStartCircle = async () => {
    if (!selectedMood || !selectionComplete || joining) {
      return;
    }
    if (!user) {
      openProfileModal(async () => {
        await performJoin();
      });
      return;
    }
    await performJoin();
  };

  return (
    <div className="space-y-10 px-3 py-8 sm:px-6 lg:px-10">
      <motion.section
        initial="hidden"
        animate="visible"
        variants={stepMotion}
        custom={0}
        className="app-hero overflow-hidden p-6 text-white shadow-[0_32px_140px_rgba(8,7,20,0.6)] sm:p-10"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">{t('explore_intro_label')}</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-[2.75rem]">{t('explore_page_title')}</h1>
        <p className="mt-4 text-lg text-white/85 sm:max-w-2xl">{t('explore_page_subtitle')}</p>
      </motion.section>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={stepMotion}
        custom={0.05}
        className="app-panel flex flex-col gap-4 rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-[0_26px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-xl shadow-inner shadow-black/40">
            📡
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold">{t('explore_sync_title')}</p>
            <p className="text-sm text-white/80">{t('explore_sync_subtitle')}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white/10 p-4 text-sm text-white/80 shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
          <span className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
            🛰️ {t('messages_author_system')}
          </span>
          <span>{t('explore_sync_hint')}</span>
        </div>
      </motion.section>

      {!accepted && (
        <motion.section
          initial="hidden"
          animate="visible"
          variants={stepMotion}
          custom={0.1}
          className="rounded-3xl border border-amber-200 bg-amber-50/90 p-5 text-amber-900 shadow-[0_18px_50px_rgba(245,158,11,0.25)] backdrop-blur-md dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-100"
        >
          <p className="text-sm font-semibold">{t('explore_rules_notice')}</p>
          <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-100/70">{t('explore_rules_required')}</p>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowRulesModal(true)}
              className="inline-flex min-h-[44px] items-center rounded-full border border-transparent bg-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 dark:bg-amber-400 dark:text-slate-900"
            >
              {t('explore_rules_button')}
            </button>
          </div>
        </motion.section>
      )}

      <motion.section
        initial="hidden"
        animate="visible"
        variants={stepMotion}
        custom={0.15}
        className="app-panel p-6 shadow-[0_26px_80px_rgba(15,23,42,0.12)]"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
          {t('explore_step_one_title')}
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{t('explore_step_one_heading')}</h2>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-300">{t('explore_step_one_description')}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {MOOD_OPTIONS.map((mood) => {
            const active = selectedMood === mood.key;
            return (
              <motion.button
                key={mood.key}
                type="button"
                whileHover={{ scale: active ? 1.02 : 1.04 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedMood((prev) => (prev === mood.key ? null : mood.key))}
                className={clsx(
                  'app-chip min-h-[44px] px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                  active
                    ? 'border-white/50 bg-white/10 text-white shadow-[0_15px_50px_rgba(124,58,237,0.45)] backdrop-blur-md'
                    : 'text-slate-600 hover:-translate-y-0.5 hover:text-brand-foreground dark:text-slate-200',
                )}
                aria-pressed={active}
              >
                {t(mood.labelKey)}
              </motion.button>
            );
          })}
        </div>
        {moodLabel && (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {t('explore_mood_selected_label', { mood: moodLabel })}
          </p>
        )}
      </motion.section>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={stepMotion}
        custom={0.2}
        className="app-panel space-y-5 p-6 shadow-[0_26px_80px_rgba(15,23,42,0.12)]"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
            {t('explore_step_two_title')}
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{t('explore_step_two_heading')}</h2>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-300">{t('explore_step_two_description')}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {interestsToRender.map((card) => {
            const active = selectedInterest === card.id;
            return (
              <motion.button
                key={card.id}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSelectInterest(card.id)}
                className={clsx(
                  'rounded-3xl border px-5 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                  motionTimingClass,
                  active
                    ? 'border-white/60 bg-white/5 text-white shadow-[0_25px_80px_rgba(124,58,237,0.4)] backdrop-blur-md'
                    : 'border-slate-100/80 bg-white/90 text-slate-700 shadow-[0_22px_70px_rgba(15,23,42,0.12)] hover:-translate-y-0.5 hover:shadow-[0_28px_90px_rgba(124,58,237,0.15)] dark:border-white/10 dark:bg-[#050816]/60 dark:text-slate-100',
                )}
                aria-pressed={active}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden>
                    {card.emoji}
                  </span>
                  <span className="text-lg font-semibold">{card.label}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={handleRandomInterest}
          className={clsx(
            'w-full rounded-3xl border border-dashed px-5 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
            randomInterest
              ? 'border-white/60 bg-white/5 text-white shadow-[0_20px_60px_rgba(124,58,237,0.3)] backdrop-blur-md'
              : 'border-slate-300 text-slate-600 hover:border-brand/40 hover:text-brand-foreground dark:border-white/20 dark:text-slate-300',
          )}
        >
          {t('explore_random_button')}
        </button>
      </motion.section>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={stepMotion}
        custom={0.25}
        className="app-panel space-y-4 p-6 shadow-[0_26px_80px_rgba(15,23,42,0.12)]"
      >
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.1)] backdrop-blur-lg dark:border-white/10 dark:bg-slate-900/80">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-lg text-white shadow-lg">
              {joining ? '⌛' : '💬'}
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-slate-900 dark:text-white">{t('explore_ready_title')}</p>
              <p className="text-sm text-slate-500 dark:text-slate-300">{t('explore_ready_description')}</p>
            </div>
          </div>
          <AnimatePresence>
            {showAssembling && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2 rounded-2xl bg-white/70 px-3 py-2 text-sm font-semibold text-slate-800 shadow-[0_12px_40px_rgba(124,58,237,0.2)] backdrop-blur"
              >
                <span aria-hidden>✨</span>
                <span>✨ Круг собирается…</span>
              </motion.div>
            )}
          </AnimatePresence>
          {error && (
            <div className="rounded-2xl bg-gradient-to-r from-red-50 via-white to-orange-50 p-3 text-xs text-red-800 shadow-inner shadow-red-100 dark:from-red-500/10 dark:via-slate-900 dark:to-orange-500/10 dark:text-red-100">
              <p className="font-semibold">{error}</p>
              {errorHint && <p className="mt-1 text-red-700/80 dark:text-red-50/80">{errorHint}</p>}
            </div>
          )}
          <button
            type="button"
            disabled={!canStart || joining}
            onClick={handleStartCircle}
            className={clsx(
              primaryCtaClass,
              'group flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-base font-semibold shadow-[0_24px_70px_rgba(109,40,217,0.5)] disabled:shadow-none',
              joining && 'cursor-wait',
            )}
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/25 text-lg text-white shadow-inner shadow-white/40">
              {joining ? '⏳' : '🚀'}
            </span>
            <span className="grow text-left">
              {joining ? t('explore_starting_state') : t('explore_start_button')}
              <span className="block text-xs font-normal text-white/80">{t('explore_ready_description')}</span>
            </span>
            <span aria-hidden className="text-lg transition-transform group-hover:translate-x-1">→</span>
          </button>
          {!accepted && (
            <p className="text-xs text-amber-700 dark:text-amber-200">{t('explore_rules_required')}</p>
          )}
        </div>
      </motion.section>

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
