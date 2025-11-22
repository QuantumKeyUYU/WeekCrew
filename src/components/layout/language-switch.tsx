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
    <div className="inline-flex items-center rounded-full border border-white/40 bg-white/70 p-1 text-[13px] font-semibold text-slate-700 shadow-[0_12px_30px_rgba(15,23,42,0.1)] backdrop-blur dark:border-white/15 dark:bg-white/5 dark:text-white/80">
      {(['ru', 'en'] as const).map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => handleChange(locale)}
          className={clsx(
            'min-w-[48px] rounded-full px-3 py-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
            language === locale
              ? 'bg-[var(--accent-gradient)] text-white shadow-[0_10px_26px_rgba(79,70,229,0.32)]'
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
