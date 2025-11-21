'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { InterestId } from '@/types';
import { INTERESTS } from '@/config/interests';
import { useTranslation } from '@/i18n/useTranslation';
import { MOOD_OPTIONS, type MoodKey } from '@/constants/moods';
import { saveCircleSelection } from '@/lib/circleSelection';
import { LANGUAGE_INTERESTS } from '@/constants/language-interests';
import { TestModeHint } from '@/components/shared/test-mode-hint';
import { AuthError, DeviceError, joinCircle } from '@/lib/api/circles';
import { getProfile } from '@/lib/api/profile';
import { useAppStore } from '@/store/useAppStore';
import { SafetyRulesModal } from '@/components/modals/safety-rules-modal';
import { useSafetyRules } from '@/hooks/useSafetyRules';
import { resetDeviceId } from '@/lib/device';
import { ApiError } from '@/lib/api-client';
import StepMood from '@/components/StepMood';
import StepInterest from '@/components/StepInterest';
import StepStart from '@/components/StepStart';

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [joinFailures, setJoinFailures] = useState(0);
  const [lastJoinError, setLastJoinError] = useState<unknown>(null);

  const joinDebugMessage = useMemo(() => {
    if (!lastJoinError) return null;
    if (lastJoinError instanceof Error) {
      return `${lastJoinError.name}: ${lastJoinError.message}`;
    }
    try {
      return JSON.stringify(lastJoinError);
    } catch (error) {
      console.warn('Unable to stringify join error', error);
      return String(lastJoinError);
    }
  }, [lastJoinError]);

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
      hidden: { opacity: 0, y: 24 },
      visible: (delay = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] },
      }),
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
    setToastMessage(null);

    try {
      const interestPool = interestsToRender.map((interest) => interest.id);
      const randomChoice = interestPool[Math.floor(Math.random() * interestPool.length)] ?? null;
      const interestId = randomInterest ? randomChoice : effectiveInterest;

      if (!interestId) {
        return;
      }

      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      let attemptedRecovery = false;

      const tryJoin = async () => {
        const response = await joinCircle({ mood: selectedMood, interest: interestId });
        setCircle(response.circle);
        setMessages(response.messages);
        saveCircleSelection({ mood: selectedMood, interestId });

        if (attemptedRecovery) {
          setToastMessage(t('explore_reconnected'));
        }

        setJoinFailures(0);
        setLastJoinError(null);
        router.push('/circle');
      };

      let lastError: unknown = null;

      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          await tryJoin();
          return;
        } catch (err) {
          lastError = err;
          if (err instanceof DeviceError && !attemptedRecovery) {
            attemptedRecovery = true;
            setToastMessage(t('explore_reconnecting'));
            resetDeviceId();
            clearSession();
            await delay(500);

            try {
              await tryJoin();
              return;
            } catch (retryError) {
              lastError = retryError;
            }
          }

          if (attempt === 0) {
            await delay(200);
          }
        }
      }

      console.error(lastError);
      if (lastError instanceof AuthError) {
        clearSession();
        resetDeviceId();
        setErrorHint(t('explore_error_reauth'));
        openProfileModal();
        return;
      }
      if (lastError instanceof DeviceError) {
        setErrorHint(t('explore_error_recover'));
      } else if (lastError instanceof ApiError && lastError.status >= 500) {
        setToastMessage(t('explore_retry_toast'));
      }
      setJoinFailures((count) => count + 1);
      setLastJoinError(lastError);
      setError(t('explore_error_message'));
    } finally {
      setJoining(false);
    }
  }, [
    accepted,
    clearSession,
    effectiveInterest,
    interestsToRender,
    joining,
    openProfileModal,
    randomInterest,
    router,
    saveCircleSelection,
    selectedMood,
    selectionComplete,
    resetDeviceId,
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto max-w-6xl space-y-8 px-3 py-8 sm:px-6 lg:px-10">
        <motion.section
          initial="hidden"
          animate="visible"
          variants={stepMotion}
          custom={0}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_28px_120px_rgba(59,7,100,0.55)] backdrop-blur-2xl sm:p-8"
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative p-8 rounded-2xl bg-gradient-to-r from-indigo-600/40 via-violet-600/30 to-fuchsia-500/20 backdrop-blur-lg border border-white/10 shadow-2xl"
          >
            <h1 className="text-4xl font-semibold tracking-tight text-white mb-3">{t('explore_page_title')}</h1>
            <p className="text-lg text-white/70">{t('explore_page_subtitle')}</p>
            <div className="absolute -left-20 -top-24 h-40 w-40 rounded-full bg-fuchsia-500/30 blur-3xl" aria-hidden />
            <div className="absolute -right-16 -bottom-20 h-48 w-48 rounded-full bg-indigo-500/25 blur-3xl" aria-hidden />
          </motion.div>
        </motion.section>

        <motion.section
          initial="hidden"
          animate="visible"
          variants={stepMotion}
          custom={0.05}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900/80 via-slate-800/60 to-slate-900/70 p-6 shadow-[0_0_40px_rgba(79,70,229,0.25)] backdrop-blur-xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.12),transparent_30%)]" aria-hidden />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-xl shadow-inner shadow-black/30">
                📡
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold">{t('explore_sync_title')}</p>
                <p className="text-sm text-white/80">{t('explore_sync_subtitle')}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/80 shadow-[0_0_25px_rgba(124,58,237,0.2)]">
              <span className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                🛰️ {t('messages_author_system')}
              </span>
              <span>{t('explore_sync_hint')}</span>
            </div>
          </div>
        </motion.section>

        {!accepted && (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={stepMotion}
            custom={0.1}
            className="rounded-3xl border border-amber-200/50 bg-amber-50/90 p-5 text-amber-900 shadow-[0_18px_50px_rgba(245,158,11,0.25)] backdrop-blur-md dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100"
          >
            <p className="text-sm font-semibold">{t('explore_rules_notice')}</p>
            <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-100/70">{t('explore_rules_required')}</p>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowRulesModal(true)}
                className="inline-flex min-h-[44px] items-center rounded-full border border-transparent bg-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 dark:bg-amber-400 dark:text-slate-900"
              >
                {t('explore_rules_button')}
              </button>
            </div>
          </motion.section>
        )}

        <div className="space-y-5">
          <StepMood
            t={t}
            variants={stepMotion}
            custom={0.15}
            selectedMood={selectedMood}
            onSelect={(mood) => setSelectedMood((prev) => (prev === mood ? null : mood))}
            moodLabel={moodLabel}
          />
          <StepInterest
            t={t}
            variants={stepMotion}
            custom={0.2}
            interests={interestsToRender}
            selectedInterest={selectedInterest}
            randomInterest={randomInterest}
            onSelect={handleSelectInterest}
            onRandomToggle={handleRandomInterest}
            isLanguageMood={isLanguageMood}
          />
          <StepStart
            t={t}
            variants={stepMotion}
            custom={0.25}
            canStart={canStart}
            joining={joining}
            accepted={accepted}
            showAssembling={showAssembling}
            error={error}
            errorHint={errorHint}
            toastMessage={toastMessage}
            onToastDismiss={() => setToastMessage(null)}
            onStart={handleStartCircle}
          />
        </div>

        <TestModeHint />

        <SafetyRulesModal
          open={showRulesModal}
          onAccept={() => {
            markAccepted();
            setShowRulesModal(false);
          }}
          onClose={() => setShowRulesModal(false)}
        />

        {process.env.NODE_ENV === 'development' && joinFailures >= 3 && joinDebugMessage && (
          <div className="fixed bottom-2 right-2 rounded-md bg-red-900/80 p-2 text-xs text-white">
            JOIN LOOP: {joinDebugMessage}
          </div>
        )}
      </div>
    </div>
  );
}
