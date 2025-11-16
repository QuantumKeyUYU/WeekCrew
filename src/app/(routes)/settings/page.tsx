'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { useAppStore } from '@/store/useAppStore';
import { useDemoCircleStore } from '@/store/demoCircle';
import { resetDeviceId, getOrCreateDeviceId } from '@/lib/device';
import { useTranslation } from '@/i18n/useTranslation';

const themes = [
  { value: 'system', labelKey: 'settings_theme_system' },
  { value: 'light', labelKey: 'settings_theme_light' },
  { value: 'dark', labelKey: 'settings_theme_dark' }
] as const;

const languages = [
  { value: 'ru', labelKey: 'settings_language_ru' },
  { value: 'en', labelKey: 'settings_language_en' }
] as const;

export default function SettingsPage() {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const updateUser = useAppStore((state) => state.updateUser);
  const reset = useAppStore((state) => state.reset);
  const setDevice = useAppStore((state) => state.setDevice);
  const device = useAppStore((state) => state.device);
  const firebaseReady = useAppStore((state) => state.firebaseReady);
  const currentInterestKey = useDemoCircleStore((state) => state.currentInterestKey);
  const resetDemoCircle = useDemoCircleStore((state) => state.reset);
  const [cleared, setCleared] = useState(false);
  const t = useTranslation();
  const sectionClass =
    'rounded-3xl border border-slate-200/70 bg-[#fefcff] p-4 space-y-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-950/60 sm:p-5';

  const handleClear = () => {
    resetDeviceId();
    reset();
    resetDemoCircle();
    const newId = getOrCreateDeviceId();
    setDevice({ deviceId: newId, createdAt: new Date().toISOString() });
    setCleared(true);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="rounded-3xl border border-slate-200/80 bg-[#fdfcff] p-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-900/70 sm:p-6">
        <h1 className="text-xl font-semibold text-brand-foreground sm:text-2xl">{t('settings_title')}</h1>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{t('settings_description')}</p>
      </div>

      <section className={sectionClass}>
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t('settings_theme_title')}</h2>
        <div className="flex flex-wrap gap-2">
          {themes.map((theme) => (
            <button
              key={theme.value}
              onClick={() => updateSettings({ theme: theme.value })}
              className={clsx(
                'rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200',
                settings.theme === theme.value
                  ? 'border-brand bg-brand/10 text-brand-foreground shadow-[0_10px_25px_rgba(127,90,240,0.2)]'
                  : 'border-slate-200/80 bg-white/80 text-slate-700 shadow-[0_4px_12px_rgba(15,23,42,0.06)] hover:border-brand/30 hover:text-brand-foreground dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200'
              )}
            >
              {t(theme.labelKey)}
            </button>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t('settings_language_title')}</h2>
        <div className="flex flex-wrap gap-2">
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => {
                updateSettings({ language: lang.value });
                updateUser((prev) => (prev ? { ...prev, locale: lang.value } : prev));
              }}
              className={clsx(
                'rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200',
                settings.language === lang.value
                  ? 'border-brand bg-brand/10 text-brand-foreground shadow-[0_10px_25px_rgba(127,90,240,0.2)]'
                  : 'border-slate-200/80 bg-white/80 text-slate-700 shadow-[0_4px_12px_rgba(15,23,42,0.06)] hover:border-brand/30 hover:text-brand-foreground dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200'
              )}
            >
              {t(lang.labelKey)}
            </button>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t('settings_animations_title')}</h2>
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.animationsEnabled}
              onChange={(event) => updateSettings({ animationsEnabled: event.target.checked })}
              className="h-4 w-4 rounded border border-slate-300 bg-white text-brand focus:ring-brand dark:border-white/20 dark:bg-slate-900/80"
            />
            {t('settings_animations_label')}
          </label>
        </div>
      </section>

      {process.env.NODE_ENV !== 'production' && (
        <section className="rounded-3xl border border-slate-200/70 bg-white/95 p-4 text-xs text-slate-600 shadow-[0_10px_26px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-300 sm:p-5">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t('settings_debug_title')}</h2>
          <div className="mt-3 grid gap-1">
            <span>
              <span className="text-slate-500 dark:text-slate-400">{t('settings_debug_device')}:</span> {device?.deviceId ?? '—'}
            </span>
            <span>
              <span className="text-slate-500 dark:text-slate-400">{t('settings_debug_circle')}:</span> {currentInterestKey ?? '—'}
            </span>
            <span>
              <span className="text-slate-500 dark:text-slate-400">Demo circle:</span> {currentInterestKey ? 'active' : 'empty'}
            </span>
            <span>
              <span className="text-slate-500 dark:text-slate-400">{t('settings_debug_firebase')}:</span> {firebaseReady ? t('settings_debug_firebase_on') : t('settings_debug_firebase_off')}
            </span>
          </div>
          {!firebaseReady && <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">{t('settings_debug_firebase_notice')}</p>}
        </section>
      )}

      <section className="rounded-3xl border border-red-500/30 bg-red-50/90 p-4 text-sm text-red-900 shadow-[0_8px_24px_rgba(248,113,113,0.18)] dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100 sm:p-5">
        <h2 className="text-sm font-semibold text-red-700 dark:text-red-200">{t('settings_reset_title')}</h2>
        <p className="mt-1 text-red-800/90 dark:text-red-100/80">{t('settings_reset_description')}</p>
        <button
          onClick={handleClear}
          className="mt-3 inline-flex items-center justify-center rounded-full border border-red-500 px-4 py-2 text-sm font-medium text-red-900 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-red-500/10 dark:text-red-100"
        >
          {t('settings_reset_button')}
        </button>
        {cleared && (
          <p className="mt-2 text-xs text-red-800/80 dark:text-red-100/70" aria-live="polite">
            {t('settings_reset_success')}
          </p>
        )}
      </section>
    </div>
  );
}
