'use client';

import clsx from 'clsx';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/i18n/useTranslation';

export const LanguageSwitch = () => {
  useTranslation(); // чтобы i18n инициализировался, если нужно
  const language = useAppStore((state) => state.settings.language ?? 'ru');
  const updateSettings = useAppStore((state) => state.updateSettings);

  const handleChange = (next: 'ru' | 'en') => {
    if (next === language) return;
    updateSettings({ language: next });
  };

  const handleContainerClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const mid = rect.width / 2;

    const next: 'ru' | 'en' = x < mid ? 'ru' : 'en';
    handleChange(next);
  };

  return (
    <div
      className="inline-flex overflow-hidden rounded-full border border-white/25 bg-white/10 shadow-[0_10px_30px_rgba(15,23,42,0.5)] backdrop-blur-md dark:border-white/10 dark:bg-slate-900/60"
      onClick={handleContainerClick}
    >
      {(['ru', 'en'] as const).map((locale) => {
        const active = locale === language;
        return (
          <button
            key={locale}
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // чтобы не было двойного вызова, но всё равно работало
              handleChange(locale);
            }}
            className={clsx(
              'flex-1 flex items-center justify-center px-3 py-1.5 text-[11px] font-semibold tracking-wide uppercase outline-none transition-all duration-150 active:scale-[0.96]',
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
