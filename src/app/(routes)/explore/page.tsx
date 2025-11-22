'use client';

import { useCallback, useEffect, useState } from 'react';
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

  const handleSelectInterest = (id: InterestId) => {
    if (joining) return;
    setSelectedInterest((prev) => (prev === id ? null : id));
    setRandomInterest(false);
  };

  const handleRandomInterest = () => {
    setRandomInterest((prev) => !prev);
    setSelectedInterest(null);
  };

  const performJoin = useCallback(async () => {
    if (!selectedMood || !selectionComplete || joining) {
      return;
    }
    if (!accepted) {
      setShowRulesModal(true);
      return;
    }

    try {
      setJoining(true);
      setError(null);
      setErrorHint(null);

      const interestId = randomInterest
        ? interestsToRender[Math.floor(Math.random() * interestsToRender.length)]?.id
        : effectiveInterest;

      if (!interestId) return;

      const response = await joinCircle({ mood: selectedMood, interest: interestId });
      saveCircleSelection({ mood: selectedMood, interestId });
      setCircle(response.circle);
      setMessages(response.messages);
      router.push('/circle');
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
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
    <div className="space-y-10 py-8 sm:space-y-12 sm:py-12">
      <section className="app-hero relative overflow-hidden space-y-4 p-7 text-left text-white sm:space-y-5 sm:p-10">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_24%,rgba(124,136,255,0.1),transparent_36%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(45,212,191,0.12),transparent_40%)]" />
        </div>
        <h1 className="relative text-[1.9rem] font-semibold leading-tight tracking-tight text-white/90 sm:text-[2.1rem]">
          {t('explore_page_title')}
        </h1>
        <p className="relative max-w-2xl text-sm text-white/80 sm:text-base">{t('explore_page_subtitle')}</p>
      </section>

      <section className="app-panel space-y-5 p-5 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <span className="step-index text-base leading-none">1</span>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              {t('explore_step_one_title')}
            </p>
            <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">{t('explore_step_one_heading')}</h2>
            <p className="text-sm text-[var(--text-secondary)]">{t('explore_step_one_description')}</p>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((mood) => {
            const active = selectedMood === mood.key;
            return (
              <button
                key={mood.key}
                type="button"
                onClick={() => setSelectedMood((prev) => (prev === mood.key ? null : mood.key))}
                className={clsx(
                  'rounded-full border px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                  active
                    ? 'border-white/30 bg-white/10 text-white shadow-[0_16px_36px_rgba(0,0,0,0.45)]'
                    : 'border-[var(--border-subtle)] bg-[var(--surface-subtle)]/80 text-[var(--text-primary)] hover:border-white/20 hover:bg-white/5 hover:text-[var(--text-primary)] dark:border-white/10 dark:bg-white/5 dark:text-white/85',
                )}
                aria-pressed={active}
              >
                {t(mood.labelKey)}
              </button>
            );
          })}
        </div>
        {moodLabel && (
          <p className="text-xs text-[var(--text-secondary)]">{t('explore_mood_selected_label', { mood: moodLabel })}</p>
        )}
      </section>

      <section className="app-panel space-y-5 p-5 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <span className="step-index text-base leading-none">2</span>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              {t('explore_step_two_title')}
            </p>
            <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">{t('explore_step_two_heading')}</h2>
            <p className="text-sm text-[var(--text-secondary)]">{t('explore_step_two_description')}</p>
          </div>
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
                    ? 'border-white/30 bg-white/10 text-white shadow-[0_18px_44px_rgba(0,0,0,0.45)]'
                    : 'border-[var(--border-card)] bg-[var(--surface-subtle)]/90 text-[var(--text-primary)] hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/5 dark:border-white/10 dark:bg-white/5 dark:text-white/85',
                )}
                aria-pressed={active}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[1.7rem]" aria-hidden>
                    {card.emoji}
                  </span>
                  <span className="text-base font-semibold tracking-tight">{card.label}</span>
                </div>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={handleRandomInterest}
          className={clsx(
            'w-full rounded-3xl border border-dashed px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
            randomInterest
              ? 'border-white/30 bg-white/10 text-white shadow-[0_14px_32px_rgba(0,0,0,0.38)]'
              : 'border-[var(--border-card)] bg-[var(--surface-subtle)]/90 text-[var(--text-secondary)] hover:border-white/20 hover:bg-white/5 hover:text-[var(--text-primary)] dark:border-white/10 dark:bg-white/5 dark:text-white/80',
          )}
        >
          {t('explore_random_button')}
        </button>
      </section>

      <section className="app-panel space-y-5 p-5 sm:p-6">
        <div className="space-y-1">
          <p className="text-base font-semibold tracking-tight text-[var(--text-primary)]">{t('explore_ready_title')}</p>
          <p className="text-sm text-[var(--text-secondary)]">{t('explore_ready_description')}</p>
        </div>
        {error && (
          <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-800 dark:text-red-100">
            <p className="font-semibold text-red-700 dark:text-red-50">{error}</p>
            {errorHint && <p className="mt-1 text-red-700/80 dark:text-red-50/80">{errorHint}</p>}
          </div>
        )}
        <button
          type="button"
          disabled={!canStart || joining}
          onClick={handleStartCircle}
          className={clsx(
            primaryCtaClass,
            'flex w-full items-center justify-center gap-2 rounded-full py-3 text-base font-semibold',
            joining && 'cursor-wait',
          )}
        >
          {joining ? t('explore_starting_state') : t('explore_start_button')}
        </button>
        {!accepted && (
          <p className="text-xs text-[var(--text-secondary)]">{t('explore_rules_required')}</p>
        )}
      </section>

      <TestModeHint className="mt-2" />

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
