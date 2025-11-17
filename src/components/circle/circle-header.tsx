// @ts-nocheck
'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import type { Circle } from '@/types';
import { useCountdown } from '@/hooks/useCountdown';
import { INTERESTS } from '@/config/interests';
import { useTranslation } from '@/i18n/useTranslation';

interface Props {
  circle: Circle;
}

export const CircleHeader = ({ circle }: Props) => {
  const t = useTranslation();
  const language = useAppStore((state) => state.settings.language ?? 'ru');
  const countdown = useCountdown(circle.expiresAt, language);
  const interestMeta = INTERESTS.find((item) => item.id === circle.interest);
  const createdAtDate = circle.createdAt?.toDate?.();
  const fallbackTitle = interestMeta ? t(interestMeta.labelKey) : t('circle_header_default_title');
  const locale = language === 'ru' ? 'ru-RU' : 'en-US';

  return (
    <motion.div
      className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] backdrop-blur dark:border-white/10 dark:bg-slate-900/60 sm:p-6"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="flex flex-col gap-2">
        <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('circle_header_topic_label')}</div>
        <h1 className="text-2xl font-semibold text-brand-foreground">{circle.title || fallbackTitle}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {interestMeta ? t(interestMeta.descriptionKey) : t('circle_header_default_description')}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
        <span className="rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-slate-700 dark:border-white/10 dark:bg-transparent dark:text-slate-200">
          {t('circle_header_members_label')}: {circle.memberIds.length}/{circle.capacity}
        </span>
        <span className="rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-slate-700 dark:border-white/10 dark:bg-transparent dark:text-slate-200">
          {t('circle_header_time_left_label')}: {countdown.formatted}
        </span>
        {createdAtDate && (
          <span className="rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-slate-700 dark:border-white/10 dark:bg-transparent dark:text-slate-200">
            {t('circle_header_start_label')}: {createdAtDate.toLocaleDateString(locale)}
          </span>
        )}
      </div>
    </motion.div>
  );
};
