'use client';

import type { MouseEvent } from 'react';
import clsx from 'clsx';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/i18n/useTranslation';

export const LanguageSwitch = () => {
  // просто чтобы i18n подтянулся, даже если текстов тут нет
  useTranslation();

  const language = useAppStore((state) => state.settings.language ?? 'ru');
  const updateSettings = useAppStore((state) => state.updateSettings);

  const handleChange = (next: 'ru' | 'en') => {
    if (next === language) return;
    updateSettings({ language: next });
  };

  const handleContainerClick = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const mid = rect.width / 2;

    const next: 'ru' | 'en' = x < mid ? 'ru' : 'en';
    handleChange(next);
  };

  return (
    <div
      onClick={handleContainerClick}
      className="relative inline-flex h-9 w-[96px] cursor-pointer items-center rounded-full border border-white/30 bg-white/12 px-1 text-[11px] font-semibold uppercase shadow-[0_10px_30px_rgba(15,23,42,0.5)] backdrop-blur-md dark:border-white/10 dark:bg-slate-900/70"
    >
      {/* Слайдер-подложка */}
      <div
        className={clsx(
          'pointer-events-none absolute inset-y-1 left-1 w-[40px] rounded-full bg-white shadow-[0_8px_20px_rgba(15,23,42,0.45)] transition-transform duration-200 ease-out'
        )}
        style={{
          transform: language === 'ru' ? 'translateX(0)' : 'translateX(44px)'
        }}
      />

      {/* Кнопка RU */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleChange('ru');
        }}
        className={clsx(
          'relative z-10 flex flex-1 items-center justify-center rounded-full px-1 py-1 transition-colors duration-150',
          language === 'ru'
            ? 'text-slate-900 dark:text-slate-900'
            : 'text-white/70 hover:text-white'
        )}
        aria-pressed={language === 'ru'}
      >
        RU
      </button>

      {/* Кнопка EN */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleChange('en');
        }}
        className={clsx(
          'relative z-10 flex flex-1 items-center justify-center rounded-full px-1 py-1 transition-colors duration-150',
          language === 'en'
            ? 'text-slate-900 dark:text-slate-900'
            : 'text-white/70 hover:text-white'
        )}
        aria-pressed={language === 'en'}
      >
        EN
      </button>
    </div>
  );
};
