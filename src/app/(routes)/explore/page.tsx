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
    <div className="space-y-8 py-6 sm:space-y-10 sm:py-10">
      <section className="flex flex-col gap-3">
        <span className="app-chip inline-flex w-fit items-center gap-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-secondary)]">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          {t('explore_intro_label')}
        </span>
        <div className="app-panel p-5 sm:p-6">
          <h1 className="text-[1.85rem] font-semibold leading-tight text-[var(--text-primary)] sm:text-[2.05rem]">
            {t('explore_page_title')}
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)] sm:text-base">{t('explore_page_subtitle')}</p>
        </div>
      </section>

      <section className="app-panel space-y-4 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
          <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
          {t('explore_step_one_title')}
        </div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t('explore_step_one_heading')}</h2>
        <p className="text-sm text-[var(--text-secondary)]">{t('explore_step_one_description')}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((mood) => {
            const active = selectedMood === mood.key;
            return (
              <button
                key={mood.key}
                type="button"
                onClick={() => setSelectedMood((prev) => (prev === mood.key ? null : mood.key))}
                className={clsx(
                  'rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                  active
                    ? 'border-brand/70 bg-brand/15 text-brand-foreground dark:bg-brand/20 dark:text-white'
                    : 'border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--text-primary)] hover:border-brand/30 hover:text-brand-foreground',
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

      <section className="app-panel space-y-4 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
          <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
          {t('explore_step_two_title')}
        </div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t('explore_step_two_heading')}</h2>
        <p className="text-sm text-[var(--text-secondary)]">{t('explore_step_two_description')}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {interestsToRender.map((card) => {
            const active = selectedInterest === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleSelectInterest(card.id)}
                className={clsx(
                  'rounded-2xl border px-5 py-4 text-left transition',
                  motionTimingClass,
                  active
                    ? 'border-brand/60 bg-brand/12 text-brand-foreground dark:bg-brand/20 dark:text-white'
                    : 'border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--text-primary)] hover:-translate-y-0.5 hover:border-brand/30',
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
            'w-full rounded-2xl border border-dashed px-5 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
            randomInterest
              ? 'border-brand bg-brand/12 text-brand-foreground'
              : 'border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:border-brand/30 hover:text-brand-foreground',
          )}
        >
          {t('explore_random_button')}
        </button>
      </section>

      <section className="app-panel space-y-4 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/15 text-lg text-brand-foreground">
            {joining ? '⌛' : '💬'}
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">{t('explore_ready_title')}</p>
            <p className="text-xs text-[var(--text-secondary)]">{t('explore_ready_description')}</p>
          </div>
        </div>
        {error && (
          <div className="rounded-2xl border border-red-200/70 bg-white/90 p-3 text-xs text-red-800 shadow-none dark:border-red-400/40 dark:bg-red-500/10 dark:text-red-100">
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
            'flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-base font-semibold',
            joining && 'cursor-wait',
          )}
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg text-white">
            {joining ? '⏳' : '🚀'}
          </span>
          <span className="grow text-left">{joining ? t('explore_starting_state') : t('explore_start_button')}</span>
          <span aria-hidden className="text-lg transition-transform">→</span>
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
