'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { getOrCreateDeviceId, DEVICE_ID_KEY, resetDeviceId } from '@/lib/device';
import { primaryCtaClass } from '@/styles/tokens';
import { useTranslation } from '@/i18n/useTranslation';
import { SafetyRulesModal } from '@/components/modals/safety-rules-modal';
import { useSafetyRules } from '@/hooks/useSafetyRules';
import { clearCircleSelection } from '@/lib/circleSelection';
import { useAppStore } from '@/store/useAppStore';
import { ThemePreference } from '@/constants/theme';
import { TestModeHint } from '@/components/shared/test-mode-hint';
import type { CopyKey } from '@/i18n/copy';
import { leaveCircle } from '@/lib/api/circles';
import { apiFetch } from '@/lib/api-client';
import { getAppMode } from '@/config/mode';

const isDemoMode = getAppMode() === 'demo';

export default function SettingsPage() {
  const t = useTranslation();
  const { markAccepted, resetAccepted } = useSafetyRules();
  const themePreference = useAppStore((state) => state.settings.theme);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const resetStore = useAppStore((state) => state.reset);
  const setDevice = useAppStore((state) => state.setDevice);

  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resettingDevice, setResettingDevice] = useState(false);
  const [deviceResetMessage, setDeviceResetMessage] = useState<string | null>(null);
  const [rulesMessage, setRulesMessage] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    const id = getOrCreateDeviceId();
    setDeviceId(id);
  }, []);

  const handleClearLocalData = async () => {
    setClearing(true);
    setMessage(null);
    try {
      await leaveCircle().catch((error) => {
        console.warn('Failed to leave circle during reset', error);
      });
      resetStore();
      clearCircleSelection();
      resetDeviceId();
      const newId = getOrCreateDeviceId();
      setDevice({ deviceId: newId, createdAt: new Date().toISOString() });
      setDeviceId(newId);
      setMessage(t('settings_reset_success'));
    } catch (error) {
      console.error('Failed to clear local data', error);
      setMessage(t('settings_reset_error'));
    } finally {
      setClearing(false);
    }
  };

  const handleResetDevice = async () => {
    setResettingDevice(true);
    setDeviceResetMessage(null);
    try {
      const response = await apiFetch('/api/device', { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to reset device');
      }

      resetStore();
      clearCircleSelection();
      resetDeviceId();

      if (typeof window !== 'undefined') {
        try {
          window.localStorage?.clear();
          window.sessionStorage?.clear();
        } catch (error) {
          console.warn('Failed to clear browser storage during device reset', error);
        }
      }

      window.location.href = '/';
    } catch (error) {
      console.error('Failed to reset device on the server', error);
      setDeviceResetMessage(t('settings_device_reset_error'));
    } finally {
      setResettingDevice(false);
    }
  };

  const modeDescription = isDemoMode
    ? t('settings_mode_description_demo')
    : t('settings_mode_description_live');

  const resetButtonLabel = clearing
    ? t('settings_reset_pending')
    : t('settings_reset_button');

  const deviceResetButtonLabel = resettingDevice
    ? t('settings_device_reset_pending')
    : t('settings_device_reset_button');

  const themeOptions: ThemePreference[] = ['system', 'light', 'dark'];
  const themeLabelKey: Record<ThemePreference, CopyKey> = {
    system: 'settings_theme_system',
    light: 'settings_theme_light',
    dark: 'settings_theme_dark',
  } as const;

  const handleThemeChange = (value: ThemePreference) => {
    updateSettings({ theme: value });
  };

  const handleResetRules = () => {
    resetAccepted();
    setRulesMessage(t('settings_rules_reset_notice'));
  };

  return (
    <main className="app-shell space-y-6 py-6">
      {/* Hero */}
      <section className="app-hero relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(129,140,248,0.22),transparent_45%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(45,212,191,0.16),transparent_50%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.65),transparent_40%,rgba(255,255,255,0.4))]" />
        </div>
        <div className="relative space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            WeekCrew
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            {t('settings_title')}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {t('settings_intro')}
          </p>
        </div>
      </section>

      {/* Режим работы */}
      <section className="app-panel p-6 text-sm text-[var(--text-secondary)]">
        <h2 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
          {t('settings_mode_title')}
        </h2>
        <p className="mt-1 text-sm">{modeDescription}</p>
        <p className="mt-3 text-xs text-[var(--text-secondary)]/80">
          {t('settings_mode_future')}
        </p>
      </section>

      {/* Тема интерфейса */}
      <section className="app-panel p-6 text-sm text-[var(--text-secondary)]">
        <h2 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
          {t('settings_theme_title')}
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {themeOptions.map((option) => {
            const active = themePreference === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleThemeChange(option)}
                className={clsx(
                  'rounded-full border px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                  active
                    ? 'border-transparent bg-[var(--accent-soft)] text-[var(--accent-foreground)] shadow-[var(--shadow-accent)]'
                    : 'border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--text-primary)] hover:-translate-y-0.5 hover:bg-white/80',
                )}
                aria-pressed={active}
              >
                {t(themeLabelKey[option])}
              </button>
            );
          })}
        </div>
      </section>

      {/* Сброс */}
      <section className="app-panel space-y-4 p-6 text-sm text-[var(--text-secondary)]">
        <h2 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
          {t('settings_reset_title')}
        </h2>
        <p className="text-sm">{t('settings_reset_description')}</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleClearLocalData}
            disabled={clearing}
            className={`${primaryCtaClass} px-7 py-2.5 text-sm`}
          >
            {resetButtonLabel}
          </button>
        </div>
        {message && (
          <p className="mt-3 text-xs text-[var(--text-secondary)]/90">
            {message}
          </p>
        )}
        <div className="mt-6 rounded-3xl border border-dashed border-[var(--border-card)] bg-[var(--surface-subtle)]/95 p-4 text-sm text-[var(--text-secondary)]">
          <p className="text-sm">
            {t('settings_device_reset_description')}
          </p>
          <button
            type="button"
            onClick={handleResetDevice}
            disabled={resettingDevice}
            className={`${primaryCtaClass} mt-3 px-7 py-2.5 text-sm`}
          >
            {deviceResetButtonLabel}
          </button>
          {deviceResetMessage && (
            <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">
              {deviceResetMessage}
            </p>
          )}
        </div>
      </section>

      {/* Правила */}
      <section className="app-panel space-y-4 p-6 text-sm text-[var(--text-secondary)]">
        <h2 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
          {t('settings_rules_title')}
        </h2>
        <p className="text-sm">{t('settings_rules_description')}</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setShowRules(true)}
            className="inline-flex items-center rounded-full border border-[var(--border-subtle)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:-translate-y-0.5 hover:bg-white/70"
          >
            {t('settings_rules_button')}
          </button>
          <button
            type="button"
            onClick={handleResetRules}
            className="inline-flex items-center rounded-full border border-dashed border-amber-300 px-5 py-2.5 text-sm font-semibold text-amber-800 transition hover:-translate-y-0.5 hover:border-amber-400 hover:bg-amber-50/60"
          >
            {t('settings_rules_reset_button')}
          </button>
        </div>
        {rulesMessage && (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            {rulesMessage}
          </p>
        )}
      </section>

      {/* Технические детали */}
      <details className="app-panel border border-dashed border-[var(--border-subtle)] p-6 text-sm text-[var(--text-secondary)] shadow-none">
        <summary className="cursor-pointer text-base font-semibold text-[var(--text-primary)]">
          {t('settings_technical_title')}
        </summary>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {t('settings_technical_description')}
        </p>
        <div className="mt-4 space-y-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-4 text-xs text-[var(--text-secondary)]">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              {t('settings_device_current_label')}
            </p>
            <p className="mt-1 break-all font-mono text-[12px] text-[var(--text-primary)]">
              {deviceId ?? t('settings_device_loading')}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              {t('settings_device_storage_key_label')}
            </p>
            <p className="mt-1 font-mono text-[12px] text-[var(--text-secondary)]">
              {DEVICE_ID_KEY}
            </p>
          </div>
        </div>
      </details>

      <TestModeHint />

      <SafetyRulesModal
        open={showRules}
        onAccept={() => {
          markAccepted();
          setShowRules(false);
          setRulesMessage(null);
        }}
        onClose={() => setShowRules(false)}
      />
    </main>
  );
}
