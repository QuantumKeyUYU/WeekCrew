'use client';

import Link from 'next/link';
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
    <header className="px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
        {/* Логотип */}
        <Link
          href="/"
          aria-label="WeekCrew — на главную"
          className="group inline-flex items-center gap-2 rounded-full px-1.5 py-1 text-base font-semibold tracking-[0.08em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-500"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/80 to-emerald-400/80 text-white shadow-md">
            <span className="h-2 w-2 rounded-full bg-white/90" />
          </span>
          <span className="text-sm font-semibold text-slate-100 sm:text-base sm:text-slate-900 dark:sm:text-white">
            WeekCrew
          </span>
        </Link>

        {/* Правый блок */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Аватар */}
          <button
            type="button"
            onClick={() => openProfileModal()}
            className="inline-flex items-center justify-center rounded-full border border-white/35 bg-white/14 p-1.5 text-lg text-slate-50 shadow-md transition-transform duration-150 hover:-translate-y-[1px] sm:px-3 sm:py-2 sm:text-sm sm:text-slate-800 sm:bg-white/80 sm:shadow-md dark:border-white/20 dark:sm:bg-white/10 dark:sm:text-white"
            aria-label={t('nav_profile') ?? 'Профиль'}
          >
            <span aria-hidden>{avatarEmoji}</span>
            <span className="ml-2 hidden sm:inline">{t('nav_profile') ?? 'Профиль'}</span>
          </button>

          {/* Язык RU / EN */}
          <LanguageSwitch />

          {/* Настройки — иконка */}
          <Link
            href="/settings"
            aria-label={t('nav_settings') ?? 'Настройки'}
            className="inline-flex items-center justify-center rounded-full border border-white/35 bg-white/14 p-1.5 text-lg text-slate-50 shadow-md transition-transform duration-150 hover:-translate-y-[1px] sm:px-3 sm:py-2 sm:text-base sm:text-slate-800 sm:bg-white/80 sm:shadow-md dark:border-white/20 dark:sm:bg-white/10 dark:sm:text-white"
          >
            <span aria-hidden>⚙️</span>
          </Link>
        </div>
      </div>

      <ProfileModalManager />
    </header>
  );
};
