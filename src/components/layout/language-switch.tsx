'use client';

import clsx from 'clsx';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/i18n/useTranslation';

export const LanguageSwitch = () => {
  // просто инициализируем i18n, чтобы переводы подгрузились
  useTranslation();

  const language = useAppStore((state) => state.settings.language ?? 'ru');
  const updateSettings = useAppStore((state) => state.updateSettings);

  const nextLanguage: 'ru' | 'en' = language === 'ru' ? 'en' : 'ru';
  const label = nextLanguage === 'en' ? 'EN' : 'RU';

  const handleToggle = () => {
    if (nextLanguage === language) return;
    updateSettings({ language: nextLanguage });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={clsx(
        // форма и размеры
        'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5',
        'text-[11px] font-semibold uppercase tracking-[0.18em]',
        // фон + бордер
        'border border-white/25 bg-white/10 text-white/80 backdrop-blur-md',
        'dark:border-white/15 dark:bg-slate-900/70 dark:text-slate-100',
        // интерактив
        'transition-transform transition-colors duration-150',
        'hover:-translate-y-[1px] hover:bg-white/16 hover:text-white',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80'
      )}
      aria-label={
        nextLanguage === 'en'
          ? 'Switch interface language to English'
          : 'Сменить язык интерфейса на русский'
      }
    >
      <span className="text-xs" aria-hidden>
        🌐
      </span>
      <span>{label}</span>
    </button>
  );
};
