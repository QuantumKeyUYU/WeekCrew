'use client';

import clsx from 'clsx';
import { useTranslation } from '@/i18n/useTranslation';
import { useAppStore } from '@/store/useAppStore';

export const LanguageSwitch = () => {
  useTranslation(); // просто чтобы дернуть i18n, если надо
  const language = useAppStore((state) => state.settings.language ?? 'ru');
  const updateSettings = useAppStore((state) => state.updateSettings);

  const handleChange = (next: 'ru' | 'en') => {
    if (next === language) return;
    updateSettings({ language: next });
  };

  return (
    <div className="inline-flex items-center rounded-full border border-white/25 bg-white/10 p-0.5 shadow-[0_10px_30px_rgba(15,23,42,0.5)] backdrop-blur-md dark:border-white/10 dark:bg-slate-900/60">
      {(['ru', 'en'] as const).map((locale) => {
        const active = locale === language;

        return (
          <button
            key={locale}
            type="button"
            onClick={() => handleChange(locale)}
            className={clsx(
              // ВЕСЬ этот пилюль — кликабельная зона
              'flex min-w-[44px] items-center justify-center rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide uppercase outline-none transition-all duration-150 active:scale-[0.96]',
              active
                ? 'bg-white text-slate-900 shadow-[0_6px_18px_rgba(15,23,42,0.35)] dark:bg-slate-100'
                : 'text-white/75 hover:text-white hover:bg-white/10'
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
