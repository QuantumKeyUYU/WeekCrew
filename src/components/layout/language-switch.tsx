'use client';

import clsx from 'clsx';
import { useTranslation } from '@/i18n/useTranslation';
import { useAppStore } from '@/store/useAppStore';

export const LanguageSwitch = () => {
  const t = useTranslation();
  const language = useAppStore((state) => state.settings.language ?? 'ru');
  const updateSettings = useAppStore((state) => state.updateSettings);

  const handleChange = (next: 'ru' | 'en') => {
    if (next === language) return;
    updateSettings({ language: next });
  };

  return (
    <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 p-0.5 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
      {(['ru', 'en'] as const).map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => handleChange(locale)}
          className={clsx(
            'px-2 py-1 text-xs font-semibold rounded-full transition-all',
            language === locale
              ? 'bg-white text-slate-900 dark:bg-white dark:text-slate-900'
              : 'text-white/70 hover:text-white'
          )}
          aria-pressed={language === locale}
        >
          {locale === 'ru' ? 'RU' : 'EN'}
        </button>
      ))}
    </div>
  );
};
