'use client';

import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { JSX } from 'react';
import { useRouter } from 'next/navigation';

import { CircleEmptyState } from '@/components/circle/empty-state';
import { MessageList } from '@/components/circle/message-list';
import { SafetyRulesModal } from '@/components/modals/safety-rules-modal';

import { useTranslation } from '@/i18n/useTranslation';
import { useSafetyRules } from '@/hooks/useSafetyRules';

import { INTERESTS_MAP } from '@/config/interests';
import { LANGUAGE_INTERESTS } from '@/constants/language-interests';
import { MOOD_OPTIONS } from '@/constants/moods';

import {
  clearCircleSelection,
  loadCircleSelection,
} from '@/lib/circleSelection';
import { ApiError } from '@/lib/api-client';
import {
  getCircleMessages,
  joinCircle,
  leaveCircle as leaveCircleApi,
  sendMessage as sendCircleMessage,
} from '@/lib/api/circles';
import { getProfile } from '@/lib/api/profile';
import { getCircleWeekPhase } from '@/lib/circle-week-phase';
import { getOrCreateDeviceId, resetDeviceId } from '@/lib/device';

import { primaryCtaClass } from '@/styles/tokens';
import { useAppStore } from '@/store/useAppStore';

import type { CircleMessage, DailyQuotaSnapshot } from '@/types';

const DAY_MS = 1000 * 60 * 60 * 24;

export default function CirclePage() {
  const router = useRouter();
  const t = useTranslation();
  const { accepted, markAccepted } = useSafetyRules();

  const language = useAppStore((state) => state.settings.language ?? 'ru');
  const circle = useAppStore((state) => state.circle);
  const user = useAppStore((state) => state.user);
  const messages = useAppStore((state) => state.messages);

  const setCircle = useAppStore((state) => state.setCircle);
  const updateCircle = useAppStore((state) => state.updateCircle);
  const setUser = useAppStore((state) => state.setUser);
  const setMessages = useAppStore((state) => state.setMessages);
  const addMessage = useAppStore((state) => state.addMessage);
  const replaceMessage = useAppStore((state) => state.replaceMessage);
  const removeMessage = useAppStore((state) => state.removeMessage);
  const clearSession = useAppStore((state) => state.clearSession);
  const openProfileModal = useAppStore((state) => state.openProfileModal);

  const dailyLimit = useAppStore((state) => state.dailyLimit);
  const dailyRemaining = useAppStore((state) => state.dailyRemaining);
  const quotaResetAtIso = useAppStore((state) => state.quotaResetAtIso);
  const isLimitReached = useAppStore((state) => state.isDailyQuotaExhausted);
  const setQuotaFromApi = useAppStore((state) => state.setQuotaFromApi);

  const storeDeviceId = useAppStore((state) => state.device?.deviceId ?? null);

  const [composerValue, setComposerValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [profileChecked, setProfileChecked] = useState(false);
  const [selectionMood, setSelectionMood] = useState<string | null>(null);
  const [selectionInterest, setSelectionInterest] =
    useState<string | null>(null);

  const [loadingCircle, setLoadingCircle] = useState(false);
  const [leavePending, setLeavePending] = useState(false);
  const [notMember, setNotMember] = useState(false);

  const [remainingMs, setRemainingMs] = useState<number | null>(
    circle?.remainingMs ?? null,
  );

  const isCircleExpired = Boolean(
    circle?.isExpired || (remainingMs !== null && remainingMs <= 0),
  );

  const circleId = circle?.id ?? null;

  const lastCircleIdRef = useRef<string | null>(circle?.id ?? null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  const currentDeviceId =
    storeDeviceId ??
    (typeof window !== 'undefined' ? getOrCreateDeviceId() : null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    getOrCreateDeviceId();
  }, []);

  // выбранные настроение/интерес (для заголовка)
  useEffect(() => {
    const stored = loadCircleSelection();
    if (!stored) return;

    const moodLabelKey = MOOD_OPTIONS.find(
      (option) => option.key === stored.mood,
    )?.shortLabelKey;
    setSelectionMood(moodLabelKey ? t(moodLabelKey) : null);

    const interestConfig = INTERESTS_MAP[stored.interestId];
    if (interestConfig) {
      setSelectionInterest(t(interestConfig.labelKey));
      return;
    }

    const languageInterest = LANGUAGE_INTERESTS.find(
      (interest) => interest.id === stored.interestId,
    );
    setSelectionInterest(
      languageInterest ? t(languageInterest.labelKey) : null,
    );
  }, [t]);

  useEffect(() => {
    if (circle?.id) {
      setNotMember(false);
    }
  }, [circle?.id]);

  // профиль
  useEffect(() => {
    if (profileChecked || user) return;

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

  // если сменился circleId – сбрасываем квоту
  useEffect(() => {
    const currentId = circle?.id ?? null;
    if (lastCircleIdRef.current === currentId) return;
    lastCircleIdRef.current = currentId;
    setQuotaFromApi(null);
  }, [circle?.id, setQuotaFromApi]);

  // старт круга при заходе
  useEffect(() => {
    let cancelled = false;

    const startFreshCircle = async () => {
      setLoadingCircle(true);
      setMessages([]);

      try {
        const storedSelection = loadCircleSelection();
        const fallbackMood = MOOD_OPTIONS[0]?.key ?? 'default';
        const fallbackInterest =
          LANGUAGE_INTERESTS[0]?.id ??
          Object.keys(INTERESTS_MAP)[0] ??
          'default';

        const response = await joinCircle({
          mood: storedSelection?.mood ?? fallbackMood,
          interest: storedSelection?.interestId ?? fallbackInterest,
        });

        if (cancelled) return;

        setCircle(response.circle);
        setMessages(response.messages);
        setQuotaFromApi(null);
        setNotMember(false);
        lastCircleIdRef.current = response.circle.id;
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to start a fresh circle', error);
          setCircle(null);
          setMessages([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingCircle(false);
        }
      }
    };

    void startFreshCircle();

    return () => {
      cancelled = true;
      void leaveCircleApi().catch((err) => {
        console.warn('Failed to delete circle on exit', err);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCircle, setMessages, setQuotaFromApi]);

  const lastFetchedCircleIdRef = useRef<string | null>(null);

  // сброс сообщений при смене круга
  useEffect(() => {
    if (!circleId) {
      setMessages([]);
      lastFetchedCircleIdRef.current = null;
      return;
    }

    if (lastFetchedCircleIdRef.current !== circleId) {
      setMessages([]);
      lastFetchedCircleIdRef.current = circleId;
    }
  }, [circleId, setMessages]);

  // начальная загрузка сообщений (одноразовый запрос)
  useEffect(() => {
    if (!circleId || notMember) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    const loadMessages = async () => {
      try {
        const { messages: incoming, quota, memberCount } =
          await getCircleMessages({ circleId });

        if (cancelled) return;

        setMessages(incoming);
        setQuotaFromApi(quota ?? null);

        if (typeof memberCount === 'number') {
          updateCircle((prev) => {
            if (!prev || prev.id !== circleId) return prev;
            if (prev.memberCount === memberCount) return prev;
            return { ...prev, memberCount };
          });
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch circle messages', error);
        }
      }
    };

    void loadMessages();

    return () => {
      cancelled = true;
    };
  }, [circleId, notMember, setMessages, setQuotaFromApi, updateCircle]);

  const handleStartMatching = async () => {
    try {
      await leaveCircleApi();
    } catch (error) {
      console.warn('Failed to leave circle before matching', error);
    }

    lastCircleIdRef.current = null;
    clearSession();
    resetDeviceId();
    setMessages([]);

    if (accepted) {
      router.push('/explore');
      return;
    }

    setPendingAction(() => () => router.push('/explore'));
    setShowModal(true);
  };

  const handleAcceptRules = () => {
    markAccepted();
    setShowModal(false);
    pendingAction?.();
    setPendingAction(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPendingAction(null);
  };

  const handleLeaveCircle = async () => {
    setLeavePending(true);
    try {
      await leaveCircleApi();
    } catch (error) {
      console.error('Failed to leave circle', error);
    } finally {
      setLeavePending(false);
    }

    lastCircleIdRef.current = null;
    clearSession();
    resetDeviceId();
    setMessages([]);
    setQuotaFromApi(null);
    clearCircleSelection();
    setNotMember(false);
  };

  const adjustComposerHeight = useCallback(() => {
    const node = composerRef.current;
    if (!node) return;
    node.style.height = 'auto';
    const nextHeight = Math.min(node.scrollHeight, 200);
    node.style.height = `${nextHeight}px`;
  }, []);

  const sendMessageCore = useCallback(async () => {
    const currentUserProfile = useAppStore.getState().user;

    if (!circle || notMember || isCircleExpired || isLimitReached || isSending) {
      return;
    }

    const trimmed = composerValue.trim();
    if (!trimmed) return;

    const optimisticId = `temp-${Date.now()}`;

    const optimisticMessage: CircleMessage = {
      id: optimisticId,
      circleId: circle.id,
      deviceId: currentDeviceId,
      author: currentUserProfile
        ? {
            id: currentUserProfile.id,
            nickname: currentUserProfile.nickname,
            avatarKey: currentUserProfile.avatarKey,
          }
        : undefined,
      content: trimmed,
      isSystem: false,
      createdAt: new Date().toISOString(),
    };

    addMessage(optimisticMessage);
    setComposerValue('');
    setIsSending(true);
    setSendError(null);

    try {
      const response = await sendCircleMessage({
        circleId: circle.id,
        content: trimmed,
      });

      replaceMessage(optimisticId, response.message);
    } catch (error) {
      if (error instanceof ApiError) {
        const details =
          (error.data as { error?: string; quota?: DailyQuotaSnapshot } | null) ??
          null;

        console.error('Failed to send message', error.status, details?.error);

        if (details?.error === 'daily_limit_exceeded') {
          setQuotaFromApi(details.quota ?? null);
          setSendError(t('circle_limit_reached'));
          return;
        }

        if (error.status === 403 && details?.error === 'circle_expired') {
          setSendError(t('circle_expired_error'));
          updateCircle((prev) => {
            if (!prev || !circle || prev.id !== circle.id) return prev;
            return { ...prev, isExpired: true, remainingMs: 0 };
          });
          return;
        }
      } else {
        console.error('Failed to send message', error);
      }

      removeMessage(optimisticId);
      setSendError(t('composer_send_error'));
    } finally {
      setIsSending(false);
    }
  }, [
    addMessage,
    circle,
    composerValue,
    currentDeviceId,
    isCircleExpired,
    isLimitReached,
    isSending,
    notMember,
    removeMessage,
    replaceMessage,
    setQuotaFromApi,
    t,
    updateCircle,
  ]);

  const attemptSendMessage = useCallback(async () => {
    if (!user) {
      openProfileModal(async () => {
        await sendMessageCore();
      });
      return;
    }
    await sendMessageCore();
  }, [openProfileModal, sendMessageCore, user]);

  const systemMessageLines = t('circle_system_message').split('\n');

  useEffect(() => {
    if (!circle) {
      setRemainingMs(null);
      return;
    }
    setRemainingMs(circle.remainingMs ?? null);
  }, [circle?.id, circle?.remainingMs]);

  // таймер круга
  useEffect(() => {
    if (!circle?.expiresAt) return;

    if (circle.isExpired) {
      setRemainingMs(0);
      return;
    }

    const expiresAtMs = new Date(circle.expiresAt).getTime();

    const updateRemaining = () => {
      const nextRemaining = Math.max(expiresAtMs - Date.now(), 0);
      setRemainingMs(nextRemaining);
      updateCircle((prev) => {
        if (!prev || prev.id !== circle.id) return prev;
        const expired = nextRemaining <= 0 || prev.isExpired;
        return { ...prev, remainingMs: nextRemaining, isExpired: expired };
      });
    };

    updateRemaining();
    const intervalId = setInterval(updateRemaining, 30_000);

    return () => clearInterval(intervalId);
  }, [circle?.id, circle?.expiresAt, circle?.isExpired, updateCircle]);

  const composerPlaceholder = isCircleExpired
    ? t('circle_expired_placeholder')
    : t('composer_placeholder');

  const composerDisabled =
    !circle || isSending || notMember || isCircleExpired || isLimitReached;

  const canSubmitMessage = Boolean(composerValue.trim()) && !composerDisabled;

  const handleSendMessage = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canSubmitMessage) return;
      void attemptSendMessage();
    },
    [attemptSendMessage, canSubmitMessage],
  );

  const handleComposerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        if (!canSubmitMessage) return;
        void attemptSendMessage();
      }
    },
    [attemptSendMessage, canSubmitMessage],
  );

  useEffect(() => {
    adjustComposerHeight();
  }, [adjustComposerHeight, composerValue]);

  // автофокус композера на десктопе
  useEffect(() => {
    if (composerValue || !circleId) return;

    const node = composerRef.current;
    if (!node) return;

    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return;
    }
    node.focus();
  }, [circleId, composerValue]);

  const timerLabel = (() => {
    if (!circle) return null;
    if (isCircleExpired) return t('circle_timer_expired');
    if (remainingMs === null) return null;

    if (remainingMs >= DAY_MS) {
      const days = Math.max(1, Math.ceil(remainingMs / DAY_MS));
      return t('circle_timer_days_left', { count: days });
    }
    return t('circle_timer_less_than_day');
  })();

  const membersCount = Math.max(circle?.memberCount ?? 0, 1);
  const timerChipText = timerLabel ?? t('circle_days_left_chip', { count: 7 });
  const showQuotaOneLiner = typeof dailyLimit === 'number';

  const quotaResetLabel = (() => {
    if (!quotaResetAtIso) return null;

    const locale = language === 'ru' ? 'ru-RU' : 'en-US';
    const resetDate = new Date(quotaResetAtIso);
    const datePart = resetDate.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
    });
    const timePart = resetDate.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });

    return t('circle_quota_reset_hint', { time: `${datePart}, ${timePart}` });
  })();

  const interestConfig = circle
    ? INTERESTS_MAP[circle.interest as keyof typeof INTERESTS_MAP]
    : null;
  const fallbackInterest = interestConfig ? t(interestConfig.labelKey) : null;

  const moodTitle = selectionMood;
  const interestTitle = selectionInterest ?? fallbackInterest;

  const circleTitle =
    moodTitle && interestTitle
      ? t('circle_weekly_title', { mood: moodTitle, topic: interestTitle })
      : circle?.mood ?? t('circle_header_default_title');

  const circleHostKey = (() => {
    if (!circle || circle.isExpired) return null;
    if (!circle.startsAt || !circle.expiresAt) return null;

    const startsAt = new Date(circle.startsAt);
    const expiresAt = new Date(circle.expiresAt);

    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(expiresAt.getTime())) {
      return null;
    }

    const phase = getCircleWeekPhase({ createdAt: startsAt, expiresAt });
    if (phase === 'start') return 'circle_host_start';
    if (phase === 'middle') return 'circle_host_middle';
    return 'circle_host_final';
  })();

  const systemPreamble = (
    <div className="space-y-4">
      {circle?.icebreaker && (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-4 py-4 text-amber-900 dark:text-amber-50">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700/80 dark:text-amber-100/80">
            {t('circle_icebreaker_title')}
          </p>
          <p className="mt-1 text-base font-semibold leading-snug text-slate-900 dark:text-white sm:text-lg">
            {circle.icebreaker}
          </p>
          <p className="mt-1 text-xs text-amber-700/90 dark:text-amber-100/70">
            {t('circle_icebreaker_hint')} ✨
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-4 text-xs leading-relaxed text-slate-600 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200 sm:text-sm">
        {systemMessageLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );

  let pageContent: JSX.Element;

  if (!circle && !loadingCircle) {
    pageContent = (
      <div className="space-y-6">
        {notMember && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50/90 p-5 text-center text-amber-900 shadow-sm dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-100">
            <p className="text-sm font-semibold sm:text-base">
              {t('circle_not_member_notice')}
            </p>
            <button
              type="button"
              onClick={handleStartMatching}
              className="mt-4 inline-flex items-center justify-center rounded-full border border-transparent bg-amber-500 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-amber-600"
            >
              {t('circle_not_member_cta')}
            </button>
          </div>
        )}
        <CircleEmptyState onStart={handleStartMatching} />
      </div>
    );
  } else if (!circle) {
    pageContent = (
      <div className="py-10 text-center text-sm text-slate-700 dark:text-slate-200">
        {t('explore_starting_state')}
      </div>
    );
  } else {
    pageContent = (
      <div className="flex min-h-screen flex-col gap-3 py-3 sm:gap-4 sm:py-4">
        {/* Шапка — компактно */}
        <section className="app-panel p-3 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-400 sm:text-xs">
                  {t('circle_header_topic_label')}
                </p>
                <h1 className="text-xl font-semibold text-slate-50 sm:text-2xl">
                  {circleTitle}
                </h1>

                <p className="text-xs text-slate-300 sm:text-sm">
                  {timerLabel
                    ? `${timerLabel} · ${t('circle_member_count_label', {
                        count: membersCount,
                      })}`
                    : t('circle_member_count_label', { count: membersCount })}
                </p>

                {circleHostKey && (
                  <p className="hidden text-[11px] text-slate-300 sm:block sm:text-xs">
                    {t(circleHostKey)}
                  </p>
                )}

                <div className="mt-2 flex flex-wrap gap-2 text-[11px] sm:mt-3 sm:text-xs">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-50">
                    {timerChipText}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => router.push('/explore')}
                  className="hidden rounded-full border border-slate-400/50 px-3 py-2 text-xs font-medium text-slate-50 transition hover:-translate-y-0.5 hover:border-brand/60 sm:inline-flex sm:px-4 sm:text-sm"
                >
                  {t('circle_change_topic_button')}
                </button>
                <button
                  type="button"
                  onClick={handleLeaveCircle}
                  disabled={leavePending}
                  className="rounded-full border border-rose-400/70 px-3 py-2 text-xs font-medium text-rose-100 transition hover:-translate-y-0.5 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-sm"
                >
                  {leavePending
                    ? t('circle_leave_pending')
                    : t('circle_leave_button')}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-slate-950/40 px-3 py-2 text-[11px] text-slate-200 sm:px-4 sm:py-3 sm:text-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-900 text-base sm:h-9 sm:w-9">
                🔒
              </div>
              <p className="leading-snug">{t('circle_rules_summary')}</p>
            </div>

            {showQuotaOneLiner && (
              <div className="hidden text-xs text-slate-300 sm:block">
                {t('circle_quota_one_liner')}
              </div>
            )}
          </div>
        </section>

        {/* Чат */}
        <section className="app-panel flex min-h-[320px] flex-1 flex-col gap-3 p-3 sm:min-h-[360px] sm:p-4">
          <div className="min-h-[220px] flex-1 overflow-y-auto rounded-3xl bg-[var(--surface-subtle)] sm:min-h-[260px]">
            <MessageList
              circleId={circleId}
              messages={messages}
              currentDeviceId={currentDeviceId}
              isLoading={false} // <— больше НИКАКОЙ мигающей загрузки
              preamble={systemPreamble}
              className="p-3 sm:p-6"
            />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="mt-1 space-y-3 rounded-3xl bg-[var(--surface-subtle)] p-3 sm:mt-2 sm:p-4 sm:shadow-[var(--shadow-soft)] sm:backdrop-blur-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <textarea
                ref={composerRef}
                rows={1}
                value={composerValue}
                onChange={(event) => setComposerValue(event.target.value)}
                onKeyDown={handleComposerKeyDown}
                placeholder={composerPlaceholder}
                aria-label={composerPlaceholder}
                className="min-h-[52px] flex-1 resize-none rounded-2xl border border-[var(--border-subtle)] bg-white/95 px-3 py-2 text-sm text-slate-900 outline-none ring-2 ring-transparent transition focus:border-brand focus:ring-brand/25 dark:border-white/10 dark:bg-slate-900/70 dark:text-white sm:min-h-[72px] sm:px-4 sm:py-3"
                disabled={composerDisabled}
              />
              <button
                type="submit"
                className={`${primaryCtaClass} inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm disabled:cursor-not-allowed sm:px-6`}
                disabled={!canSubmitMessage}
              >
                <span aria-hidden>{isSending ? '⌛' : '🚀'}</span>
                <span>
                  {isSending
                    ? t('composer_submitting')
                    : t('composer_submit')}
                </span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-300 sm:text-xs">
              {t('messages_author_system')} напоминает: здесь спокойно,
              без обмена личными данными.
            </p>

            {sendError && (
              <p
                className="inline-flex items-center gap-2 rounded-2xl bg-red-50/80 px-3 py-2 text-[11px] text-red-700 dark:bg-red-500/10 dark:text-red-200 sm:text-xs"
                role="status"
                aria-live="assertive"
              >
                <span className="text-sm">⚠️</span>
                <span>{sendError}</span>
              </p>
            )}

            {typeof dailyRemaining === 'number' &&
              typeof dailyLimit === 'number' &&
              (!isLimitReached ? (
                <div className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
                  <p>
                    {t('circle_quota_remaining', { count: dailyRemaining })}
                  </p>
                  {quotaResetLabel && (
                    <p className="mt-1">{quotaResetLabel}</p>
                  )}
                </div>
              ) : (
                <div className="hidden rounded-2xl bg-amber-50/80 p-3 text-xs text-amber-900 dark:bg-amber-500/10 dark:text-amber-100 sm:block">
                  <p className="font-medium">
                    {t('circle_quota_exhausted')}
                  </p>
                  {quotaResetLabel && (
                    <p className="mt-1">{quotaResetLabel}</p>
                  )}
                </div>
              ))}
          </form>
        </section>

        <p className="px-3 text-center text-[11px] text-slate-500 dark:text-slate-400 sm:text-xs">
          {t('landing_test_mode_hint')}
        </p>
      </div>
    );
  }

  return (
    <>
      {pageContent}
      <SafetyRulesModal
        open={showModal}
        onAccept={handleAcceptRules}
        onClose={handleCloseModal}
      />
    </>
  );
}
