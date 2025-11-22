'use client';

import Link from 'next/link';
import clsx from 'clsx';

import { useTranslation } from '@/i18n/useTranslation';
import { LanguageSwitch } from '@/components/layout/language-switch';
import { useAppStore } from '@/store/useAppStore';
import { AVATAR_PRESETS, DEFAULT_AVATAR_KEY } from '@/constants/avatars';
import { ProfileModalManager } from '@/components/modals/profile-modal-manager';

const getAvatarEmoji = (key?: string | null) =>
  AVATAR_PRESETS.find((preset) => preset.key === key)?.emoji ?? '🙂';

export const Header = () => {
  const t = useTranslation();
  const user = useAppStore((state) => state.user);
  const openProfileModal = useAppStore((state) => state.openProfileModal);

  const avatarEmoji = getAvatarEmoji(user?.avatarKey ?? DEFAULT_AVATAR_KEY);

  return (
    // На мобиле просто обычный блок сверху,
    // на sm+ — уже липкий хедер
    <header className="px-3 pt-3 sm:sticky sm:top-3 sm:z-50 sm:px-6 sm:pt-4">
      <div
        className={clsx(
          'mx-auto flex w-full max-w-5xl items-center justify-between gap-2 rounded-full border px-3 py-2.5',
          'backdrop-blur-2xl shadow-[0_14px_45px_rgba(15,23,42,0.12)] dark:shadow-[0_18px_55px_rgba(0,0,0,0.55)]',
          'border-white/40 bg-white/20 text-slate-100 dark:border-white/15 dark:bg-white/5 dark:text-white',
        )}
      >
        {/* Логотип слева */}
        <Link
          href="/"
          aria-label="WeekCrew — на главную"
          className="group inline-flex items-center gap-2 rounded-full px-1.5 py-1 text-base font-semibold tracking-[0.08em] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:focus-visible:ring-slate-500"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/80 to-emerald-400/80 text-white shadow-[0_12px_30px_rgba(37,99,235,0.65)]">
            <span className="h-2 w-2 rounded-full bg-white/90 shadow-[0_0_0_4px_rgba(255,255,255,0.18)]" />
          </span>
          <span className="text-sm font-semibold text-slate-100 sm:text-base sm:text-slate-900 sm:group-hover:text-slate-700 dark:sm:text-white dark:sm:group-hover:text-white/80">
            WeekCrew
          </span>
        </Link>

        {/* Правая часть */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* На мобиле — просто кружок-аватар, без текста "Профиль" */}
          <button
            type="button"
            onClick={() => openProfileModal()}
            className="inline-flex items-center justify-center rounded-full border border-white/50 bg-white/20 p-1.5 text-lg text-slate-50 shadow-[0_8px_22px_rgba(15,23,42,0.45)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_12px_30px_rgba(15,23,42,0.6)] sm:px-3 sm:py-2 sm:text-sm sm:text-slate-800 sm:bg-white/80 sm:shadow-[0_10px_30px_rgba(15,23,42,0.12)] dark:border-white/20 dark:sm:bg-white/10 dark:sm:text-white"
            aria-label={t('nav_profile') ?? 'Профиль'}
          >
            <span aria-hidden>{avatarEmoji}</span>
            <span className="ml-2 hidden sm:inline">{t('nav_profile') ?? 'Профиль'}</span>
          </button>

          {/* Переключатель языка */}
          <LanguageSwitch />

          {/* Настройки */}
          <Link
            href="/settings"
            className="inline-flex items-center rounded-full border border-white/50 bg-white/20 px-3 py-1.5 text-xs font-semibold text-slate-50 shadow-[0_8px_22px_rgba(15,23,42,0.45)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_12px_30px_rgba(15,23,42,0.6)] sm:border-white/50 sm:bg-white/80 sm:px-4 sm:py-2 sm:text-sm sm:text-slate-800 sm:shadow-[0_10px_30px_rgba(15,23,42,0.12)] dark:border-white/20 dark:sm:bg-white/10 dark:sm:text-white"
          >
            {t('nav_settings')}
          </Link>
        </div>
      </div>

      <ProfileModalManager />
    </header>
  );
};
