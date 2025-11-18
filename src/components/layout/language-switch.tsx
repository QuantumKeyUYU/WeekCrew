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
    <div className="inline-flex items-center rounded-full border border-white/40 bg-white/80 p-1 text-xs font-medium text-slate-600 shadow-[0_12px_30px_rgba(15,23,42,0.08)] dark:border-white/20 dark:bg-white/5 dark:text-white/90">
      {(['ru', 'en'] as const).map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => handleChange(locale)}
          className={clsx(
            'min-w-[48px] rounded-full px-3 py-1 transition',
            language === locale
              ? 'bg-white text-slate-900 shadow-sm dark:bg-white/90 dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-900 dark:text-white/70 dark:hover:text-white',
          )}
          aria-pressed={language === locale}
        >
          {locale === 'ru' ? t('settings_language_ru') : t('settings_language_en')}
        </button>
      ))}
    </div>
  );
};
