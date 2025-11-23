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

import { useCircleMessagesPolling } from '@/hooks/useCircleMessagesPolling';
import { primaryCtaClass } from '@/styles/tokens';
import { useAppStore } from '@/store/useAppStore';

import type { CircleMessage, DailyQuotaSnapshot } from '@/types';

const DAY_MS = 1000 * 60 * 60 * 24;

export default function CirclePage(): JSX.Element {
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

  const [rulesExpanded, setRulesExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [profileChecked, setProfileChecked] = useState(false);
  const [selectionMood, setSelectionMood] = useState<string | null>(null);
  const [selectionInterest, setSelectionInterest] = useState<string | null>(null);

  const [loadingCircle, setLoadingCircle] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [leavePending, setLeavePending] = useState(false);
  const [notMember, setNotMember] = useState(false);

  const [remainingMs, setRemainingMs] = useState<number | null>(
    circle?.remainingMs ?? null,
  );
  const isCircleExpired = Boolean(
    circle?.isExpired || (remainingMs !== null && remainingMs <= 0),
  );

  const [pageError, setPageError] = useState<string | null>(null);

  const circleId = circle?.id ?? null;

  const lastCircleIdRef = useRef<string | null>(circle?.id ?? null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  const currentDeviceId =
    storeDeviceId ?? (typeof window !== 'undefined' ? getOrCreateDeviceId() : null);

  // сохраняем выбор настроения и интереса
  useEffect(() => {
    const stored = loadCircleSelection();
    if (!stored) return;

    const moodLabelKey = MOOD_OPTIONS.find(
      (option) => option.key === stored.mood,
    )?.shortLabelKey;
    setSelectionMood(moodLabelKey ? t(moodLabelKey) : null);

    const interestConfig = INTERESTS_MAP[stored.interestId as keyof typeof INTERESTS_MAP];
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

  // загрузка профиля (чтобы была аватарка/ник)
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

  // если сменился circleId — сбрасываем квоту
  useEffect(() => {
    const currentId = circle?.id ?? null;
    if (lastCircleIdRef.current === currentId) return;
    lastCircleIdRef.current = currentId;
    setQuotaFromApi(null);
  }, [circle?.id, setQuotaFromApi]);

  const handleAccessRevoked = useCallback(() => {
    void leaveCircleApi().catch((error) => {
      console.warn('Failed to cleanup circle after access revoked', error);
    });

    setNotMember(true);
    setCircle(null);
    setMessages([]);
    setQuotaFromApi(null);

    resetDeviceId();
    clearSession();
    clearCircleSelection();
  }, [clearCircleSelection, clearSession, setCircle, setMessages, setQuotaFromApi]);

  // старт круга при заходе
  useEffect(() => {
    let cancelled = false;

    const startFreshCircle = async () => {
      setLoadingCircle(true);
      setMessages([]);
      setPageError(null);

      try {
        const storedSelection = loadCircleSelection();
        const fallbackMood = MOOD_OPTIONS[0]?.key ?? 'default';
        const fallbackInterest =
          LANGUAGE_INTERESTS[0]?.id ?? Object.keys(INTERESTS_MAP)[0] ?? 'default';

        const response = await joinCircle({
          mood: storedSelection?.mood ?? fallbackMood,
          interest: storedSelection?.interestId ?? fallbackInterest,
        });

        if (cancelled) return;

        setCircle(response.circle);
        setMessages(response.messages);
        setQuotaFromApi(response.quota ?? null);
        setNotMember(false);
        lastCircleIdRef.current = response.circle.id;
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to start a fresh circle', error);
          setCircle(null);
          setMessages([]);
          setPageError('Не удалось подключиться к кругу. Попробуй обновить страницу.');
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
        console.warn('Failed to leave circle on unmount', err);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCircle, setMessages, setQuotaFromApi]);

  // загрузка сообщений
  useEffect(() => {
    if (!circle || notMember) {
      setMessages([]);
      setMessagesLoading(false);
      return;
    }

    let cancelled = false;

    const loadMessages = async () => {
      setMessagesLoading(true);
      setPageError(null);

      try {
        const { messages: incoming, quota, memberCount } =
          await getCircleMessages({ circleId: circle.id });

        if (cancelled) return;

        setMessages(incoming);
        setQuotaFromApi(quota ?? null);

        if (typeof memberCount === 'number') {
          updateCircle((prev) => {
            if (!prev || prev.id !== circle.id) {
              return prev;
            }
            return { ...prev, memberCount };
          });
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch circle messages', error);
          setPageError('Не получилось загрузить сообщения. Попробуй ещё раз позже.');
        }
      } finally {
        if (!cancelled) {
          setMessagesLoading(false);
        }
      }
    };

    void loadMessages();

    return () => {
      cancelled = true;
    };
  }, [circle, notMember, setMessages, setMessagesLoading, setQuotaFromApi, updateCircle]);

  // long-poll
  const { notMember: pollingNotMember } = useCircleMessagesPolling(circleId);

  useEffect(() => {
    if (pollingNotMember) {
      handleAccessRevoked();
    }
  }, [pollingNotMember, handleAccessRevoked]);

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
    setPageError(null);

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
  const quickRules = t('rules_modal_points').split('|');

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
        if (!prev || prev.id !== circle.id) {
          return prev;
        }
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

  // автофокус композера
  useEffect(() => {
    if (messagesLoading || composerValue || !circleId) return;

    const node = composerRef.current;
    if (!node) return;

    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return;
    }
    node.focus();
  }, [circleId, composerValue, messagesLoading]);

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

  let pageContent: JSX.Element;

  if (!circle && !loadingCircle) {
    pageContent = (
      <div className="space-y-6">
        {notMember && (
          <div className="rounded-[2rem] border border-amber-200/60 bg-amber-50/95 p-5 text-center text-amber-900 shadow-sm dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-50">
            <p className="text-base font-semibold">
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
    const messagePreamble = (
      <div className="space-y-4">
        {circle.icebreaker && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-4 text-amber-50">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-200/80">
              {t('circle_icebreaker_title')}
            </p>
            <p className="mt-1 text-lg font-semibold leading-snug text-white">
              {circle.icebreaker}
            </p>
            <p className="text-xs text-amber-100/80">
              {t('circle_icebreaker_hint')} ✨
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-white/8 bg-slate-900/40 p-4 text-sm text-slate-200">
          {systemMessageLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        {isCircleExpired && (
          <div className="rounded-2xl border border-purple-300/40 bg-purple-500/5 p-4 text-sm text-slate-100">
            <p className="font-semibold text-white">
              {t('circle_expired_notice_title')}
            </p>
            <p className="mt-1">{t('circle_expired_notice_subtitle')}</p>
            <button
              type="button"
              onClick={handleStartMatching}
              className={`${primaryCtaClass} mt-3 px-4 py-2 text-xs`}
            >
              {t('circle_expired_start_new')}
            </button>
          </div>
        )}
      </div>
    );

    pageContent = (
      <div className="flex min-h-[calc(100vh-5rem)] flex-col gap-4 py-2 sm:py-4">
        {/* Шапка круга */}
        <section className="app-panel relative overflow-hidden px-5 py-5 sm:px-7 sm:py-6">
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(129,140,248,0.35),transparent_50%),radial-gradient(circle_at_100%_0%,rgba(45,212,191,0.25),transparent_55%)]" />
          </div>

          <div className="relative space-y-4">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-200/80">
                {t('circle_header_topic_label')}
              </p>
              <h1 className="text-2xl font-semibold text-white sm:text-[26px]">
                {circleTitle}
              </h1>
              <p className="text-sm text-slate-200/85">
                {t('circle_header_subtitle')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-100/80">
              {timerChipText && (
                <span className="inline-flex items-center rounded-full bg-slate-950/40 px-3 py-1">
                  ⏳&nbsp;{timerChipText}
                </span>
              )}
              <span className="inline-flex items-center rounded-full bg-slate-950/40 px-3 py-1">
                👥&nbsp;
                {t('circle_members_chip', { count: membersCount })}
              </span>
              {showQuotaOneLiner && (
                <span className="inline-flex items-center rounded-full bg-slate-950/40 px-3 py-1">
                  💬 {t('circle_quota_one_liner')}
                </span>
              )}
            </div>

            {circleHostKey && (
              <p className="text-xs text-slate-100/80">
                {t(circleHostKey)}
              </p>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => router.push('/explore')}
                className="rounded-full bg-slate-950/35 px-4 py-2 text-xs font-semibold text-slate-100 backdrop-blur-sm transition hover:bg-slate-950/55"
              >
                {t('circle_change_topic_button')}
              </button>
              <button
                type="button"
                onClick={handleLeaveCircle}
                disabled={leavePending}
                className="rounded-full bg-slate-950/20 px-4 py-2 text-xs font-semibold text-rose-50 backdrop-blur-sm transition hover:bg-rose-600/70 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {leavePending
                  ? t('circle_leave_pending')
                  : t('circle_leave_button')}
              </button>
            </div>
          </div>
        </section>

        {/* Блок быстрых правил / квоты */}
        <section className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)]/90 p-4 text-sm text-[var(--text-secondary)] shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                {t('circle_rules_quick')}
              </p>
              <button
                type="button"
                onClick={() => setRulesExpanded((prev) => !prev)}
                className="text-xs text-[var(--text-muted)] underline-offset-4 hover:underline"
              >
                {rulesExpanded ? t('rules_hide') ?? 'Скрыть' : t('rules_show') ?? 'Показать'}
              </button>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {quickRules.slice(0, rulesExpanded ? quickRules.length : 2).map((rule, index) => (
                <li key={rule} className="flex gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--surface-elevated)] text-xs font-semibold text-[var(--text-muted)]">
                    {index + 1}
                  </span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)]/90 p-4 text-xs text-[var(--text-secondary)] shadow-[var(--shadow-soft)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
              {t('circle_quota_label')}
            </p>
            <div className="mt-2 space-y-1">
              {typeof dailyRemaining === 'number' &&
              typeof dailyLimit === 'number' ? (
                <>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {t('circle_quota_remaining', { count: dailyRemaining })}
                  </p>
                  <p>
                    {t('circle_quota_total', { count: dailyLimit })}
                  </p>
                </>
              ) : (
                <p>{t('circle_quota_unknown')}</p>
              )}
            </div>
            {quotaResetLabel && (
              <p className="mt-2 text-[11px]">{quotaResetLabel}</p>
            )}
          </div>
        </section>

        {/* Основной чат */}
        <section className="flex min-h-0 flex-1 flex-col gap-3 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/95 p-4 shadow-[var(--shadow-soft)]">
          {pageError && (
            <div className="mb-1 rounded-2xl bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {pageError}
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-hidden rounded-3xl bg-slate-950/40">
            <MessageList
              circleId={circleId}
              messages={messages}
              currentDeviceId={currentDeviceId}
              isLoading={Boolean(circle && messagesLoading)}
              preamble={messagePreamble}
              className="p-4 sm:p-6"
            />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="space-y-3 rounded-3xl bg-slate-950/40 p-3 sm:p-4"
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
                className="min-h-[72px] flex-1 resize-none rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-50 outline-none ring-2 ring-transparent transition focus:border-indigo-400 focus:ring-indigo-500/30"
                disabled={composerDisabled}
              />
              <button
                type="submit"
                className={`${primaryCtaClass} inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm disabled:cursor-not-allowed`}
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

            {sendError && (
              <p
                className="inline-flex items-center gap-2 rounded-2xl bg-red-500/10 px-3 py-2 text-xs text-red-100"
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
                <div className="text-xs text-slate-300">
                  <p>
                    {t('circle_quota_remaining', { count: dailyRemaining })}
                  </p>
                  {quotaResetLabel && (
                    <p className="mt-1">{quotaResetLabel}</p>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl bg-amber-500/10 p-3 text-xs text-amber-100">
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

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
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
