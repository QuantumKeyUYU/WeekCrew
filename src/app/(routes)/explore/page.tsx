'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import type { InterestId } from '@/types';
import { INTERESTS } from '@/config/interests';
import { useTranslation } from '@/i18n/useTranslation';
import { primaryCtaClass } from '@/styles/tokens';
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
      <section className="app-hero relative overflow-hidden space-y-4 p-7 text-left text-[var(--text-primary)] sm:space-y-5 sm:p-10">
        <div className="pointer-events-none absolute inset-0 opacity-85">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_24%,rgba(124,136,255,0.18),transparent_36%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.18),transparent_40%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_26%,rgba(255,255,255,0.06))]" />
        </div>
        <h1 className="relative text-[1.95rem] font-semibold leading-tight tracking-tight text-[var(--text-primary)] sm:text-[2.35rem]">
          {t('explore_page_title')}
        </h1>
        <p className="relative max-w-2xl text-sm text-[var(--text-secondary)] sm:text-base">{t('explore_page_subtitle')}</p>
      </section>

      <section className="app-panel relative overflow-hidden space-y-5 p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 hover:opacity-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(79,70,229,0.08),transparent_34%),radial-gradient(circle_at_88%_40%,rgba(34,197,94,0.08),transparent_32%)]" />
        </div>
        <div className="flex items-start gap-3 sm:gap-4">
          <span className="step-index text-base leading-none transition-transform duration-200 hover:scale-[1.05] hover:shadow-[0_12px_28px_rgba(79,70,229,0.25)]">
            1
          </span>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              {t('explore_step_one_title')}
            </p>
            <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">{t('explore_step_one_heading')}</h2>
            <p className="text-sm text-[var(--text-secondary)]">{t('explore_step_one_description')}</p>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-3">
          {MOOD_OPTIONS.map((mood) => {
            const active = selectedMood === mood.key;
            return (
              <button
                key={mood.key}
                type="button"
                onClick={() => setSelectedMood((prev) => (prev === mood.key ? null : mood.key))}
                className={clsx(
                  'group relative overflow-hidden rounded-full border px-4 py-2.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                  active
                    ? 'border-transparent bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.22),transparent_36%),radial-gradient(circle_at_82%_70%,rgba(34,197,94,0.2),transparent_38%),var(--accent-strong)] text-white shadow-[0_14px_40px_rgba(79,70,229,0.3)]'
                    : 'border-[var(--chip-border)] bg-[var(--chip-bg)] text-[var(--text-primary)] shadow-[0_10px_28px_rgba(15,23,42,0.06)] hover:-translate-y-[2px] hover:border-[var(--border-card)] hover:bg-white/70 hover:text-[var(--text-primary)] dark:hover:bg-white/10',
                )}
                aria-pressed={active}
              >
                <span className="relative z-10">{t(mood.labelKey)}</span>
                <span className="pointer-events-none absolute inset-0 rounded-full bg-white/0 transition-opacity group-hover:bg-white/5" />
              </button>
            );
          })}
        </div>
        {moodLabel && (
          <p className="text-xs text-[var(--text-secondary)]">{t('explore_mood_selected_label', { mood: moodLabel })}</p>
        )}
      </section>

      <section className="app-panel relative overflow-hidden space-y-5 p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 hover:opacity-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(79,70,229,0.08),transparent_34%),radial-gradient(circle_at_86%_48%,rgba(34,197,94,0.08),transparent_32%)]" />
        </div>
        <div className="flex items-start gap-3 sm:gap-4">
          <span className="step-index text-base leading-none transition-transform duration-200 hover:scale-[1.05] hover:shadow-[0_12px_28px_rgba(79,70,229,0.25)]">
            2
          </span>
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
                  'group relative overflow-hidden rounded-3xl border px-5 py-4 text-left shadow-[var(--shadow-soft)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent hover:-translate-y-1',
                  active
                    ? 'border-transparent bg-[var(--accent-gradient)] text-white shadow-[0_18px_48px_rgba(79,70,229,0.35)]'
                    : 'border-[var(--border-card)] bg-[var(--surface-subtle)]/90 text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-white/80 dark:hover:bg-white/10',
                )}
                aria-pressed={active}
              >
                <div className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(79,70,229,0.08),transparent_38%),radial-gradient(circle_at_86%_70%,rgba(34,197,94,0.08),transparent_34%)]" />
                </div>
                <div className="relative flex items-center gap-3">
                  <span className={clsx('text-[1.45rem] leading-none transition-transform duration-200', active ? 'scale-110' : 'group-hover:scale-110')} aria-hidden>
                    {card.emoji}
                  </span>
                  <span className="text-base font-semibold leading-snug tracking-tight">{card.label}</span>
                </div>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={handleRandomInterest}
          className={clsx(
            'w-full rounded-3xl border border-dashed px-5 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
            randomInterest
              ? 'border-transparent bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.18),transparent_32%),radial-gradient(circle_at_80%_60%,rgba(34,197,94,0.14),transparent_36%),var(--accent-strong)] text-white shadow-[0_14px_38px_rgba(79,70,229,0.28)]'
              : 'border-[var(--border-card)] bg-[var(--surface-subtle)]/90 text-[var(--text-primary)] shadow-[0_6px_20px_rgba(15,23,42,0.08)] hover:-translate-y-[2px] hover:border-[var(--border-strong)] hover:bg-white/80 dark:hover:bg-white/10',
          )}
        >
          {t('explore_random_button')}
        </button>
      </section>

      <section className="app-hero relative flex flex-col gap-4 overflow-hidden p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(124,136,255,0.16),transparent_40%),radial-gradient(circle_at_88%_72%,rgba(34,197,94,0.2),transparent_36%)]" />
        </div>
        <div className="relative space-y-2 text-left sm:max-w-xl">
          <p className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">{t('explore_ready_title')}</p>
          <p className="text-sm text-[var(--text-secondary)]">{t('explore_ready_description')}</p>
        </div>
        <div className="relative flex w-full flex-col items-start gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
          <button
            type="button"
            disabled={!canStart || joining}
            onClick={handleStartCircle}
            className={clsx(
              primaryCtaClass,
              'flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold sm:w-auto',
              joining && 'cursor-wait',
            )}
          >
            {joining ? t('explore_starting_state') : t('explore_start_button')}
          </button>
          {!selectionComplete && (
            <p className="text-xs text-[var(--text-secondary)]">{t('explore_ready_hint')}</p>
          )}
          {!accepted && (
            <p className="text-xs text-[var(--text-secondary)]">{t('explore_rules_required')}</p>
          )}
        </div>
        {error && (
          <div className="relative w-full rounded-2xl border border-red-200/70 bg-red-50/70 p-3 text-xs text-red-800 shadow-[0_12px_28px_rgba(248,113,113,0.2)] dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-100">
            <p className="font-semibold text-red-700 dark:text-red-50">{error}</p>
            {errorHint && <p className="mt-1 text-red-700/80 dark:text-red-50/80">{errorHint}</p>}
          </div>
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
