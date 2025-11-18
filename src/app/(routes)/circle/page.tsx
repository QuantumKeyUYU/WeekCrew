'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useWeekcrewSnapshot, useWeekcrewStorage } from '@/lib/weekcrewStorage';
import { CircleEmptyState } from '@/components/circle/empty-state';
import { useTranslation } from '@/i18n/useTranslation';
import { useSafetyRules } from '@/hooks/useSafetyRules';
import { SafetyRulesModal } from '@/components/modals/safety-rules-modal';
import { INTERESTS_MAP } from '@/config/interests';
import { MOOD_OPTIONS } from '@/constants/moods';
import { clearCircleSelection, loadCircleSelection } from '@/lib/circleSelection';
import { useAppStore } from '@/store/useAppStore';

export default function CirclePage() {
  const router = useRouter();
  const storage = useWeekcrewStorage();
  const t = useTranslation();
  const { accepted, markAccepted } = useSafetyRules();
  const language = useAppStore((state) => state.settings.language ?? 'ru');
  const { currentCircle, messages } = useWeekcrewSnapshot((snapshot) => ({
    currentCircle: snapshot.currentCircle,
    messages: snapshot.messages,
  }));

  const [composerValue, setComposerValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [rulesExpanded, setRulesExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [selectionMood, setSelectionMood] = useState<string | null>(null);
  const [selectionInterest, setSelectionInterest] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stored = loadCircleSelection();
    if (stored) {
      const moodLabelKey = MOOD_OPTIONS.find((option) => option.key === stored.mood)?.shortLabelKey;
      setSelectionMood(moodLabelKey ? t(moodLabelKey) : null);
      const interestConfig = INTERESTS_MAP[stored.interestId];
      setSelectionInterest(interestConfig ? t(interestConfig.labelKey) : null);
    }
  }, [t]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

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
    try {
      await storage.leaveCircle();
      clearCircleSelection();
    } catch (error) {
      console.error('Failed to leave circle', error);
    }
  };

  const handleSendMessage = async (event: FormEvent) => {
    event.preventDefault();
    if (!composerValue.trim() || !currentCircle) return;
    setIsSending(true);
    setSendError(null);
    try {
      await storage.sendMessage(currentCircle.id, composerValue);
      setComposerValue('');
    } catch (error) {
      console.error('Failed to send message', error);
      setSendError(t('composer_send_error'));
    } finally {
      setIsSending(false);
    }
  };

  const systemMessageLines = useMemo(() => t('circle_system_message').split('\n'), [t]);
  const quickRules = useMemo(() => t('rules_modal_points').split('|'), [t]);

  const daysLeft = currentCircle?.daysLeft ?? 7;
  const membersCount = currentCircle?.membersCount ?? 6;

  const interestConfig = currentCircle ? INTERESTS_MAP[currentCircle.interestId] : null;
  const fallbackInterest = interestConfig ? t(interestConfig.labelKey) : null;
  const moodTitle = selectionMood;
  const interestTitle = selectionInterest ?? fallbackInterest;
  const circleTitle = moodTitle && interestTitle ? t('circle_weekly_title', { mood: moodTitle, interest: interestTitle }) : currentCircle?.title ?? t('circle_header_default_title');

  if (!currentCircle) {
    return (
      <>
        <CircleEmptyState onStart={handleStartMatching} />
        <SafetyRulesModal open={showModal} onAccept={handleAcceptRules} onClose={handleCloseModal} />
      </>
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
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 dark:border-white/10 dark:text-white/80">
                  {t('circle_days_left_chip', { count: daysLeft })}
                </span>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 dark:border-white/10 dark:text-white/80">
                  {t('circle_members_chip', { count: membersCount })}
                </span>
              </div>
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
                className="rounded-full border border-transparent px-4 py-2 text-sm font-medium text-slate-500 transition hover:-translate-y-0.5 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                {t('circle_leave_button')}
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
          <div ref={listRef} className="mt-4 flex max-h-[400px] flex-col gap-3 overflow-y-auto pr-1">
            {messages.map((msg) => {
              const isOwn = msg.role === 'me';
              const isHost = msg.role === 'host';
              return (
                <div key={msg.id} className={clsx('flex', isOwn ? 'justify-end' : 'justify-start')}>
                  <div
                    className={clsx(
                      'max-w-[80%] rounded-2xl border px-4 py-3 text-sm shadow-sm',
                      isOwn
                        ? 'border-brand/60 bg-brand text-white'
                        : isHost
                        ? 'border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/70'
                        : 'border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100',
                    )}
                  >
                    <p className="whitespace-pre-wrap leading-snug text-slate-800 dark:text-white">{msg.text}</p>
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
            {messages.length === 0 && (
              <p className="text-center text-sm text-slate-400 dark:text-slate-500">{t('messages_empty_state')}</p>
            )}
          </div>
          <form onSubmit={handleSendMessage} className="mt-4 space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={composerValue}
                onChange={(event) => setComposerValue(event.target.value)}
                placeholder={t('composer_placeholder')}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-white/10 dark:bg-slate-900/70 dark:text-white"
                disabled={isSending}
              />
              <button
                type="submit"
                className="rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(127,90,240,0.25)] transition hover:-translate-y-0.5 disabled:opacity-50"
                disabled={isSending || !composerValue.trim()}
              >
                {isSending ? t('composer_submitting') : t('composer_submit')}
              </button>
            </div>
            {sendError && <p className="text-sm text-red-500 dark:text-red-400">{sendError}</p>}
          </form>
        </section>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">{t('test_mode_notice')}</p>
      </div>
      <SafetyRulesModal open={showModal} onAccept={handleAcceptRules} onClose={handleCloseModal} />
    </>
  );
}
