'use client';

import clsx from 'clsx';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/i18n/useTranslation';

export const LanguageSwitch = () => {
  // просто чтобы переводы инициализировались, даже если тут текстов нет
  useTranslation();

  const language = useAppStore((state) => state.settings.language ?? 'ru');
  const updateSettings = useAppStore((state) => state.updateSettings);

  const handleChange = (next: 'ru' | 'en') => {
    if (next === language) return;
    updateSettings({ language: next });
  };

  return (
    <div className="inline-flex h-8 items-center rounded-full border border-white/22 bg-white/10 px-0.5 backdrop-blur-md dark:border-white/12 dark:bg-slate-900/70">
      {(['ru', 'en'] as const).map((locale) => {
        const active = locale === language;

        return (
          <button
            key={locale}
            type="button"
            onClick={() => handleChange(locale)}
            className={clsx(
              // ВЕСЬ этот овал — кликабельная зона
              'flex-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase leading-none',
              'flex items-center justify-center',
              'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-0',
              active
                ? 'bg-white text-slate-900 dark:bg-slate-100 dark:text-slate-900'
                : 'bg-transparent text-white/70 hover:text-white'
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
