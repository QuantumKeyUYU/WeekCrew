'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { useAppStore } from '@/store/useAppStore';
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
  const user = useAppStore((state) => state.user);
  const firebaseReady = useAppStore((state) => state.firebaseReady);
  const [cleared, setCleared] = useState(false);
  const t = useTranslation();

  const handleClear = () => {
    resetDeviceId();
    reset();
    const newId = getOrCreateDeviceId();
    setDevice({ deviceId: newId, createdAt: new Date().toISOString() });
    setCleared(true);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
        <h1 className="text-2xl font-semibold text-brand-foreground">{t('settings_title')}</h1>
        <p className="mt-2 text-sm text-slate-300">{t('settings_description')}</p>
      </div>

      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-100">{t('settings_theme_title')}</h2>
        <div className="flex flex-wrap gap-2">
          {themes.map((theme) => (
            <button
              key={theme.value}
              onClick={() => updateSettings({ theme: theme.value })}
              className={clsx(
                'rounded-full border px-4 py-2 text-sm transition-colors',
                settings.theme === theme.value
                  ? 'border-brand bg-brand/10 text-brand-foreground'
                  : 'border-white/10 bg-slate-900/60 text-slate-200'
              )}
            >
              {t(theme.labelKey)}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-100">{t('settings_language_title')}</h2>
        <div className="flex gap-2">
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => {
                updateSettings({ language: lang.value });
                updateUser((prev) => (prev ? { ...prev, locale: lang.value } : prev));
              }}
              className={clsx(
                'rounded-full border px-4 py-2 text-sm transition-colors',
                settings.language === lang.value
                  ? 'border-brand bg-brand/10 text-brand-foreground'
                  : 'border-white/10 bg-slate-900/60 text-slate-200'
              )}
            >
              {t(lang.labelKey)}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-100">{t('settings_animations_title')}</h2>
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.animationsEnabled}
              onChange={(event) => updateSettings({ animationsEnabled: event.target.checked })}
              className="h-4 w-4 rounded border border-white/20 bg-slate-900/80"
            />
            {t('settings_animations_label')}
          </label>
        </div>
      </section>

      {process.env.NODE_ENV !== 'production' && (
        <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 space-y-2 text-xs text-slate-400">
          <h2 className="text-sm font-semibold text-slate-100">{t('settings_debug_title')}</h2>
          <div className="flex flex-col gap-1">
            <span>
              <span className="text-slate-500">{t('settings_debug_device')}:</span> {device?.deviceId ?? '—'}
            </span>
            <span>
              <span className="text-slate-500">{t('settings_debug_circle')}:</span> {user?.currentCircleId ?? '—'}
            </span>
            <span>
              <span className="text-slate-500">{t('settings_debug_firebase')}:</span> {firebaseReady ? t('settings_debug_firebase_on') : t('settings_debug_firebase_off')}
            </span>
          </div>
          {!firebaseReady && <p className="text-[11px] text-slate-500">{t('settings_debug_firebase_notice')}</p>}
        </section>
      )}

      <section className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5 text-sm">
        <h2 className="text-sm font-semibold text-red-200">{t('settings_reset_title')}</h2>
        <p className="mt-1 text-red-100/80">{t('settings_reset_description')}</p>
        <button
          onClick={handleClear}
          className="mt-3 inline-flex items-center justify-center rounded-full border border-red-500 px-4 py-2 text-sm font-medium text-red-100 transition-transform hover:-translate-y-0.5"
        >
          {t('settings_reset_button')}
        </button>
        {cleared && (
          <p className="mt-2 text-xs text-red-100/70">{t('settings_reset_success')}</p>
        )}
      </section>
    </div>
  );
}
