'use client';

import type { MouseEventHandler } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

import { useTranslation } from '@/i18n/useTranslation';
import { useAppStore } from '@/store/useAppStore';

export const LanguageSwitch = () => {
  // чтобы i18n инициализировался, если нужно
  useTranslation();

  const language = useAppStore((state) => state.settings.language ?? 'ru');
  const updateSettings = useAppStore((state) => state.updateSettings);

  const handleChange = (next: 'ru' | 'en') => {
    if (next === language) return;
    updateSettings({ language: next });
  };

  // Клик по всей плашке: левая половина = RU, правая половина = EN
  const handleContainerClick: MouseEventHandler<HTMLDivElement> = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const mid = rect.width / 2;

    const next: 'ru' | 'en' = x < mid ? 'ru' : 'en';
    handleChange(next);
  };

  return (
    <div
      className="relative inline-flex h-8 w-[90px] items-center rounded-full border border-white/25 bg-white/10 px-1 shadow-[0_10px_30px_rgba(15,23,42,0.55)] backdrop-blur-md dark:border-white/10 dark:bg-slate-900/70"
      onClick={handleContainerClick}
    >
      {/* Подложка-ползунок, который красиво переезжает RU <-> EN */}
      <motion.div
        layout
        className="pointer-events-none absolute inset-y-1 w-[40px] rounded-full bg-white shadow-[0_6px_18px_rgba(15,23,42,0.35)] dark:bg-slate-100"
        animate={{ x: language === 'ru' ? 0 : 42 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      />

      {/* Кнопки поверх ползунка */}
      {(['ru', 'en'] as const).map((locale) => {
        const active = locale === language;
        return (
          <button
            key={locale}
            type="button"
            onClick={(e) => {
              // чтобы клик по самой кнопке не вызывал второй раз containerClick
              e.stopPropagation();
              handleChange(locale);
            }}
            className={clsx(
              'relative z-10 flex-1 text-center text-[11px] font-semibold tracking-wide uppercase transition-colors',
              active
                ? 'text-slate-900'
                : 'text-white/70 hover:text-white'
            )}
            aria-pressed={active}
          >
            {locale === 'ru' ? 'RU' : 'EN'}
          </button>
        );
      })}
    </div>
  );
};
