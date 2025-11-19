'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { CircleEmptyState } from '@/components/circle/empty-state';
import { useTranslation } from '@/i18n/useTranslation';
import { useSafetyRules } from '@/hooks/useSafetyRules';
import { SafetyRulesModal } from '@/components/modals/safety-rules-modal';
import { INTERESTS_MAP } from '@/config/interests';
import { MOOD_OPTIONS } from '@/constants/moods';
import { clearCircleSelection, loadCircleSelection } from '@/lib/circleSelection';
import { ApiError } from '@/lib/api-client';
import { useAppStore } from '@/store/useAppStore';
import { LANGUAGE_INTERESTS } from '@/constants/language-interests';
import {
  getCurrentCircle,
  getCircleMessages,
  leaveCircle as leaveCircleApi,
  sendMessage as sendCircleMessage,
} from '@/lib/api/circles';
import { getOrCreateDeviceId } from '@/lib/device';
import type { CircleMessage, DailyQuotaSnapshot } from '@/types';
import { useCircleMessagesPolling } from '@/hooks/useCircleMessagesPolling';
import { getCircleWeekPhase } from '@/lib/circle-week-phase';

const DAY_MS = 1000 * 60 * 60 * 24;

export default function CirclePage() {
  const router = useRouter();
  const t = useTranslation();
  const { accepted, markAccepted } = useSafetyRules();
  const language = useAppStore((state) => state.settings.language ?? 'ru');
  const circle = useAppStore((state) => state.circle);
  const messages = useAppStore((state) => state.messages);
  const setCircle = useAppStore((state) => state.setCircle);
  const updateCircle = useAppStore((state) => state.updateCircle);
  const setMessages = useAppStore((state) => state.setMessages);
  const addMessage = useAppStore((state) => state.addMessage);
  const replaceMessage = useAppStore((state) => state.replaceMessage);
  const removeMessage = useAppStore((state) => state.removeMessage);
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
  const [selectionMood, setSelectionMood] = useState<string | null>(null);
  const [selectionInterest, setSelectionInterest] = useState<string | null>(null);
  const [loadingCircle, setLoadingCircle] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [leavePending, setLeavePending] = useState(false);
  const [notMember, setNotMember] = useState(false);
  const [remainingMs, setRemainingMs] = useState<number | null>(circle?.remainingMs ?? null);

  const listRef = useRef<HTMLDivElement | null>(null);
  const lastCircleIdRef = useRef<string | null>(circle?.id ?? null);
  const currentDeviceId = useMemo(() => {
    if (storeDeviceId) {
      return storeDeviceId;
    }
    if (typeof window !== 'undefined') {
      return getOrCreateDeviceId();
    }
    return null;
  }, [storeDeviceId]);

  useEffect(() => {
    const stored = loadCircleSelection();
    if (stored) {
      const moodLabelKey = MOOD_OPTIONS.find((option) => option.key === stored.mood)?.shortLabelKey;
      setSelectionMood(moodLabelKey ? t(moodLabelKey) : null);
      const interestConfig = INTERESTS_MAP[stored.interestId];
      if (interestConfig) {
        setSelectionInterest(t(interestConfig.labelKey));
      } else {
        const languageInterest = LANGUAGE_INTERESTS.find((interest) => interest.id === stored.interestId);
        setSelectionInterest(languageInterest ? t(languageInterest.labelKey) : null);
      }
    }
  }, [t]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (circle?.id) {
      setNotMember(false);
    }
  }, [circle?.id]);

  useEffect(() => {
    const currentId = circle?.id ?? null;
    if (lastCircleIdRef.current === currentId) {
      return;
    }
    lastCircleIdRef.current = currentId;
    setQuotaFromApi(null);
  }, [circle?.id, setQuotaFromApi]);

  const handleAccessRevoked = useCallback(() => {
    setNotMember(true);
    setCircle(null);
    setMessages([]);
    setQuotaFromApi(null);
    clearCircleSelection();
  }, [clearCircleSelection, setCircle, setMessages, setQuotaFromApi]);

  useEffect(() => {
    if (circle) {
      return;
    }
    let cancelled = false;
    setLoadingCircle(true);
    getCurrentCircle()
      .then((response) => {
        if (cancelled) return;
        setCircle(response.circle);
        if (!response.circle) {
          setMessages([]);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Failed to load current circle', error);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingCircle(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [circle, setCircle, setMessages]);

  useEffect(() => {
    if (!circle || notMember) {
      return;
    }
    let cancelled = false;
    setMessagesLoading(true);
    getCircleMessages({ circleId: circle.id })
      .then((response) => {
        if (!cancelled) {
          setMessages(response.messages);
          setQuotaFromApi(response.quota ?? null);
        }
      })
      .catch((error) => {
        if (error instanceof ApiError && error.status === 403) {
          const details = typeof error.data === 'object' && error.data ? error.data : null;
          if ((details as { error?: string } | null)?.error === 'not_member') {
            handleAccessRevoked();
            return;
          }
        }
        if (!cancelled) {
          console.error('Failed to fetch circle messages', error);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setMessagesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [circle, notMember, setMessages, handleAccessRevoked, setQuotaFromApi]);

  const { notMember: pollingNotMember } = useCircleMessagesPolling(circle?.id ?? null);

  useEffect(() => {
    if (pollingNotMember) {
      handleAccessRevoked();
    }
  }, [pollingNotMember, handleAccessRevoked]);

  const handleStartMatching = () => {
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
    setCircle(null);
    setMessages([]);
    setQuotaFromApi(null);
    clearCircleSelection();
    setNotMember(false);
  };

  const handleSendMessage = async (event: FormEvent) => {
    event.preventDefault();
    if (!composerValue.trim() || !circle || notMember || isCircleExpired) return;

    if (isLimitReached) {
      return;
    }

    const trimmed = composerValue.trim();
    const optimisticId = `temp-${Date.now()}`;
    const optimisticMessage: CircleMessage = {
      id: optimisticId,
      circleId: circle.id,
      deviceId: currentDeviceId,
      content: trimmed,
      isSystem: false,
      createdAt: new Date().toISOString(),
    };

    addMessage(optimisticMessage);
    setComposerValue('');
    setIsSending(true);
    setSendError(null);

    try {
      const response = await sendCircleMessage({ circleId: circle.id, content: trimmed });
      replaceMessage(optimisticId, response.message);
      setQuotaFromApi(response.quota);
    } catch (error) {
      console.error('Failed to send message', error);
      removeMessage(optimisticId);
      if (error instanceof ApiError) {
        const details = (error.data as { error?: string; quota?: DailyQuotaSnapshot } | null) ?? null;
        if (details?.error === 'daily_limit_exceeded') {
          setQuotaFromApi(details.quota ?? null);
          setSendError(t('circle_limit_reached'));
          return;
        }
        if (error.status === 403) {
          if (details?.error === 'circle_expired') {
            setSendError(t('circle_expired_error'));
            updateCircle((prev) => {
              if (!prev || !circle || prev.id !== circle.id) {
                return prev;
              }
              return { ...prev, isExpired: true, remainingMs: 0 };
            });
            return;
          }
        }
      }
      setSendError(t('composer_send_error'));
    } finally {
      setIsSending(false);
    }
  };

  const systemMessageLines = useMemo(() => t('circle_system_message').split('\n'), [t]);
  const quickRules = useMemo(() => t('rules_modal_points').split('|'), [t]);

  useEffect(() => {
    if (!circle) {
      setRemainingMs(null);
      return;
    }
    setRemainingMs(circle.remainingMs ?? null);
  }, [circle?.id, circle?.remainingMs]);

  useEffect(() => {
    if (!circle?.expiresAt) {
      return undefined;
    }

    if (circle.isExpired) {
      setRemainingMs(0);
      return undefined;
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
    const intervalId = setInterval(updateRemaining, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [circle?.id, circle?.expiresAt, circle?.isExpired, updateCircle]);

  const isCircleExpired = Boolean(circle?.isExpired || (remainingMs !== null && remainingMs <= 0));

  const timerLabel = useMemo(() => {
    if (!circle) {
      return null;
    }
    if (isCircleExpired) {
      return t('circle_timer_expired');
    }
    if (remainingMs === null) {
      return null;
    }
    if (remainingMs >= DAY_MS) {
      const days = Math.max(1, Math.ceil(remainingMs / DAY_MS));
      return t('circle_timer_days_left', { count: days });
    }
    return t('circle_timer_less_than_day');
  }, [circle, isCircleExpired, remainingMs, t]);

  const membersCount = Math.max(circle?.memberCount ?? 0, 1);
  const timerChipText = timerLabel ?? t('circle_days_left_chip', { count: 7 });
  const showQuotaOneLiner = typeof dailyLimit === 'number';

  const quotaResetLabel = useMemo(() => {
    if (!quotaResetAtIso) {
      return null;
    }
    const locale = language === 'ru' ? 'ru-RU' : 'en-US';
    const resetDate = new Date(quotaResetAtIso);
    const datePart = resetDate.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    const timePart = resetDate.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    return t('circle_quota_reset_hint', { time: `${datePart}, ${timePart}` });
  }, [quotaResetAtIso, language, t]);

  const interestConfig = circle ? INTERESTS_MAP[circle.interest as keyof typeof INTERESTS_MAP] : null;
  const fallbackInterest = interestConfig ? t(interestConfig.labelKey) : null;
  const moodTitle = selectionMood;
  const interestTitle = selectionInterest ?? fallbackInterest;
  const circleTitle =
    moodTitle && interestTitle
      ? t('circle_weekly_title', { mood: moodTitle, topic: interestTitle })
      : circle?.mood ?? t('circle_header_default_title');

  const circleHostKey = useMemo(() => {
    if (!circle || circle.isExpired) {
      return null;
    }
    if (!circle.startsAt || !circle.expiresAt) {
      return null;
    }
    const startsAt = new Date(circle.startsAt);
    const expiresAt = new Date(circle.expiresAt);
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(expiresAt.getTime())) {
      return null;
    }
    const phase = getCircleWeekPhase({ createdAt: startsAt, expiresAt });
    if (phase === 'start') {
      return 'circle_host_start';
    }
    if (phase === 'middle') {
      return 'circle_host_middle';
    }
    return 'circle_host_final';
  }, [circle]);

  if (!circle && !loadingCircle) {
    return (
      <>
        <div className="space-y-6">
          {notMember && (
            <div className="rounded-[2.5rem] border border-amber-200 bg-white p-6 text-center text-slate-900 shadow-sm dark:border-amber-400/40 dark:bg-slate-900/70 dark:text-slate-100">
              <p className="text-base font-semibold">{t('circle_not_member_notice')}</p>
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
        <SafetyRulesModal open={showModal} onAccept={handleAcceptRules} onClose={handleCloseModal} />
      </>
    );
  }

  if (!circle) {
    return (
      <div className="py-10 text-center text-sm text-slate-700 dark:text-slate-200">
        {t('explore_starting_state')}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 py-4">
        <section className="rounded-[2.5rem] border border-slate-200/70 bg-white/95 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-slate-900/70">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-400">{t('circle_header_topic_label')}</p>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{circleTitle}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-300">{t('circle_header_subtitle')}</p>
              {timerLabel && (
                <p className="text-sm font-medium text-slate-600 dark:text-slate-200">{timerLabel}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
                <span>{t('circle_member_count_label', { count: membersCount })}</span>
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 text-[10px] text-slate-400 dark:border-white/10"
                  title={t('circle_members_tooltip')}
                  aria-label={t('circle_members_tooltip')}
                >
                  i
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 dark:border-white/10 dark:text-white/80">
                  {timerChipText}
                </span>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 dark:border-white/10 dark:text-white/80">
                  {t('circle_members_chip', { count: membersCount })}
                </span>
              </div>
              {showQuotaOneLiner && (
                <p className="mt-1 text-xs text-slate-500 dark:text-white/60">{t('circle_quota_one_liner')}</p>
              )}
              {circleHostKey && (
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-100">{t(circleHostKey)}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => router.push('/explore')}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-brand/40 hover:text-brand-foreground dark:border-white/10 dark:text-white"
              >
                {t('circle_change_button')}
              </button>
              <button
                type="button"
                onClick={handleLeaveCircle}
                disabled={leavePending}
                className="rounded-full border border-transparent px-4 py-2 text-sm font-medium text-slate-500 transition hover:-translate-y-0.5 hover:text-slate-900 disabled:opacity-60 dark:text-slate-300 dark:hover:text-white"
              >
                {leavePending ? t('explore_starting_state') : t('circle_leave_button')}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/70">
          <button
            type="button"
            className="flex w-full items-center justify-between text-left"
            onClick={() => setRulesExpanded((prev) => !prev)}
          >
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{t('circle_rules_title')}</span>
            <span className="text-xs text-slate-500 dark:text-slate-300">{rulesExpanded ? '−' : '+'}</span>
          </button>
          {rulesExpanded && (
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {quickRules.map((rule) => (
                <li key={rule} className="flex gap-2">
                  <span aria-hidden>•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/70">
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200">
            {systemMessageLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          {notMember && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-white p-4 text-sm text-slate-900 shadow-sm dark:border-amber-500/40 dark:bg-slate-900/70 dark:text-slate-100">
              <p className="font-semibold">{t('circle_not_member_notice')}</p>
              <button
                type="button"
                onClick={handleStartMatching}
                className="mt-3 inline-flex items-center justify-center rounded-full border border-transparent bg-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-amber-600"
              >
                {t('circle_not_member_cta')}
              </button>
            </div>
          )}
          {isCircleExpired && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200">
              <p className="font-semibold text-slate-900 dark:text-white">{t('circle_expired_notice_title')}</p>
              <p className="mt-1">{t('circle_expired_notice_subtitle')}</p>
              <button
                type="button"
                onClick={handleStartMatching}
                className="mt-3 inline-flex items-center justify-center rounded-full border border-transparent bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:-translate-y-0.5"
              >
                {t('circle_expired_start_new')}
              </button>
            </div>
          )}
          <div ref={listRef} className="mt-4 flex max-h-[400px] flex-col gap-3 overflow-y-auto pr-1">
            {messagesLoading && messages.length === 0 && (
              <p className="text-center text-sm text-slate-400 dark:text-slate-500">{t('explore_starting_state')}</p>
            )}
            {messages.map((msg) => {
              const isOwn = Boolean(currentDeviceId && msg.deviceId === currentDeviceId);
              return (
                <div key={msg.id} className={clsx('flex', isOwn ? 'justify-end' : 'justify-start')}>
                  <div
                    className={clsx(
                      'max-w-[80%] rounded-2xl border px-4 py-3 text-sm shadow-sm',
                      isOwn
                        ? 'border-brand/60 bg-brand text-white'
                        : msg.isSystem
                        ? 'border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/70'
                        : 'border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100',
                    )}
                  >
                    <p className="whitespace-pre-wrap leading-snug text-slate-800 dark:text-white">{msg.content}</p>
                    <span className="mt-2 block text-[11px] text-slate-400">
                      {new Date(msg.createdAt).toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && !messagesLoading && (
              <p className="text-center text-sm text-slate-400 dark:text-slate-500">{t('messages_empty_state')}</p>
            )}
          </div>
          <form onSubmit={handleSendMessage} className="mt-4 space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={composerValue}
                onChange={(event) => setComposerValue(event.target.value)}
                placeholder={isCircleExpired ? t('circle_expired_placeholder') : t('composer_placeholder')}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-white/10 dark:bg-slate-900/70 dark:text-white"
                disabled={isSending || notMember || isCircleExpired || isLimitReached}
              />
              <button
                type="submit"
                className="rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(127,90,240,0.25)] transition hover:-translate-y-0.5 disabled:opacity-50"
                disabled={
                  isSending ||
                  !composerValue.trim() ||
                  notMember ||
                  isCircleExpired ||
                  isLimitReached
                }
              >
                {isSending ? t('composer_submitting') : t('composer_submit')}
              </button>
            </div>
            {sendError && <p className="text-sm text-red-500 dark:text-red-400">{sendError}</p>}
            {typeof dailyRemaining === 'number' && typeof dailyLimit === 'number' && (
              !isLimitReached ? (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <p>{t('circle_quota_remaining', { count: dailyRemaining })}</p>
                  {quotaResetLabel && <p className="mt-1">{quotaResetLabel}</p>}
                </div>
              ) : (
                <div className="rounded-2xl bg-amber-50/80 p-3 text-xs text-amber-900 dark:bg-amber-500/10 dark:text-amber-100">
                  <p className="font-medium">{t('circle_quota_exhausted')}</p>
                  {quotaResetLabel && <p className="mt-1">{quotaResetLabel}</p>}
                </div>
              )
            )}
          </form>
        </section>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">{t('landing_test_mode_hint')}</p>
      </div>
      <SafetyRulesModal open={showModal} onAccept={handleAcceptRules} onClose={handleCloseModal} />
    </>
  );
}
