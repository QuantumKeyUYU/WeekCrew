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
    <div className="space-y-10 py-6 sm:py-10">
      <section className="app-hero relative overflow-hidden px-6 py-10 text-white sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(120%_140%_at_15%_10%,rgba(255,255,255,0.14),transparent_55%),radial-gradient(120%_140%_at_85%_18%,rgba(94,234,212,0.12),transparent_55%)]" />
          <div className="absolute inset-x-10 bottom-10 h-px bg-gradient-to-r from-white/0 via-white/40 to-white/0" />
        </div>
        <div className="relative space-y-3">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75 backdrop-blur">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_0_8px_rgba(16,185,129,0.24)]" />
            {t('explore_intro_label')}
          </p>
          <h1 className="text-[1.85rem] font-semibold leading-tight sm:text-[2.25rem]">{t('explore_page_title')}</h1>
          <p className="text-base text-white/80 sm:text-lg">{t('explore_page_subtitle')}</p>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--surface-muted-border)] bg-[var(--surface-muted)] p-4 shadow-[var(--surface-muted-shadow)] dark:text-white">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/70 to-brand/70 text-lg text-white shadow-lg">
              📡
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('explore_sync_title')}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{t('explore_sync_subtitle')}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs text-slate-600 shadow-inner shadow-white/40 backdrop-blur dark:bg-white/5 dark:text-slate-200">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 font-semibold uppercase tracking-[0.12em] text-slate-900 shadow-sm dark:bg-white/10 dark:text-white">
              🛰️ {t('messages_author_system')}
            </span>
            <span className="text-left text-[13px] leading-relaxed">{t('explore_sync_hint')}</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--surface-muted-border)] bg-[var(--surface-muted)] p-4 shadow-[var(--surface-muted-shadow)] dark:text-white">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/70 to-sky-400/70 text-lg text-white shadow-lg">
              🤝
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('messages_author_system')}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{t('landing_logo_tagline')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs text-slate-600 shadow-inner shadow-white/40 backdrop-blur dark:bg-white/5 dark:text-slate-200">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.28)]" />
            <span className="text-left text-[13px] leading-relaxed">{t('explore_page_subtitle')}</span>
          </div>
        </div>
      </section>

      {!accepted && (
        <section className="rounded-3xl border border-amber-200/70 bg-amber-50/90 p-5 text-amber-900 shadow-[0_16px_40px_rgba(245,158,11,0.18)] dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-100">
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

      <section className="app-panel p-6 sm:p-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-100">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/80 to-brand/70 text-[10px] text-white">1</span>
          {t('explore_step_one_title')}
        </div>
        <h2 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">{t('explore_step_one_heading')}</h2>
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
                    ? 'border-brand/70 bg-brand/20 text-brand-foreground shadow-[0_12px_30px_rgba(124,92,245,0.35)] dark:bg-brand/25 dark:text-white'
                    : 'text-slate-700 hover:-translate-y-0.5 hover:border-brand/35 hover:text-brand-foreground dark:text-slate-200',
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

      <section className="app-panel space-y-4 p-6 sm:p-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-100">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/80 to-brand/70 text-[10px] text-white">2</span>
          {t('explore_step_two_title')}
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('explore_step_two_heading')}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">{t('explore_step_two_description')}</p>
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
                    ? 'border-brand/60 bg-brand/20 text-brand-foreground shadow-[0_12px_30px_rgba(124,92,245,0.28)] dark:bg-brand/25 dark:text-white'
                    : 'border-[var(--surface-muted-border)] bg-[var(--surface-muted)] text-slate-700 shadow-[var(--surface-muted-shadow)] hover:-translate-y-0.5 hover:border-brand/35 dark:text-slate-100',
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
              ? 'border-brand bg-brand/20 text-brand-foreground shadow-[0_10px_30px_rgba(124,92,245,0.22)]'
              : 'border-slate-300 text-slate-500 hover:border-brand/35 hover:text-brand-foreground dark:border-white/20 dark:text-slate-300',
          )}
        >
          {t('explore_random_button')}
        </button>
      </section>

      <section className="app-panel space-y-4 p-6 sm:p-7">
        <div className="flex flex-col gap-3 rounded-3xl border border-[var(--surface-secondary-border)] bg-[var(--surface-secondary)] p-4 shadow-[var(--surface-secondary-shadow)] backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-brand to-sky-500 text-lg text-white shadow-lg">
              {joining ? '⌛' : '💬'}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('explore_ready_title')}</p>
              <p className="text-xs text-slate-500 dark:text-slate-300">{t('explore_ready_description')}</p>
            </div>
          </div>
          {error && (
            <div className="rounded-2xl border border-red-200/70 bg-white/90 p-3 text-xs text-red-800 shadow-inner shadow-red-100 dark:border-red-400/40 dark:bg-red-500/10 dark:text-red-100">
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
              'group flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold shadow-[0_20px_60px_rgba(112,89,255,0.35)] disabled:shadow-none',
              joining && 'cursor-wait',
            )}
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/25 text-lg text-white shadow-inner shadow-white/40">
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
