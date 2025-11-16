'use client';

import clsx from 'clsx';
import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getFirebaseStatus } from '@/config/firebase';
import { useTranslation } from '@/i18n/useTranslation';

const ENV_KEYS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'
] as const;

type EnvKey = (typeof ENV_KEYS)[number];

const maskValue = (value: string | undefined) => {
  if (!value) {
    return '—';
  }
  if (value.length <= 6) {
    return `${value.slice(0, 2)}***`;
  }
  return `${value.slice(0, 3)}…${value.slice(-3)}`;
};

export default function DebugPage() {
  const firebaseReady = useAppStore((state) => state.firebaseReady);
  const deviceId = useAppStore((state) => state.device?.deviceId ?? '—');
  const circleId = useAppStore((state) => state.user?.currentCircleId ?? '—');
  const firebaseStatus = getFirebaseStatus();
  const t = useTranslation();
  const envList = useMemo(
    () =>
      ENV_KEYS.map((key) => ({
        key,
        value: maskValue(process.env[key as EnvKey])
      })),
    []
  );
  const panelClass =
    'rounded-3xl border border-slate-200/80 bg-[#fefcff] p-4 space-y-3 text-sm shadow-[0_12px_32px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-950/60 sm:p-5';

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="rounded-3xl border border-slate-200/80 bg-[#fdfcff] p-4 shadow-[0_12px_34px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-900/70 sm:p-6">
        <h1 className="text-xl font-semibold text-brand-foreground sm:text-2xl">{t('debug_title')}</h1>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{t('debug_description')}</p>
      </div>

      <section className={panelClass}>
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t('debug_environment_heading')}</h2>
        <div className="grid gap-2 text-slate-600 dark:text-slate-300">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/95 px-3 py-2 dark:border-white/5 dark:bg-slate-900/60">
            <span className="text-slate-500 dark:text-slate-400">{t('debug_env_node_label')}</span>
            <span className="font-mono text-slate-800 dark:text-slate-100">{process.env.NODE_ENV}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/95 px-3 py-2 dark:border-white/5 dark:bg-slate-900/60">
            <span className="text-slate-500 dark:text-slate-400">{t('debug_env_config_label')}</span>
            <span className={clsx('font-medium', firebaseStatus.configured ? 'text-emerald-600 dark:text-emerald-300' : 'text-red-500 dark:text-red-300')}>
              {firebaseStatus.configured ? t('debug_env_configured') : t('debug_env_disabled')}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/95 px-3 py-2 dark:border-white/5 dark:bg-slate-900/60">
            <span className="text-slate-500 dark:text-slate-400">{t('debug_env_initialized_label')}</span>
            <span className={clsx('font-medium', firebaseReady ? 'text-emerald-600 dark:text-emerald-300' : 'text-amber-500 dark:text-amber-300')}>
              {firebaseReady ? t('debug_yes') : t('debug_no')}
            </span>
          </div>
          {firebaseStatus.error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-700 dark:text-red-200">
              {t('debug_env_error_label')}: {firebaseStatus.error}
            </div>
          )}
        </div>
      </section>

      <section className={panelClass}>
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t('debug_env_vars_heading')}</h2>
        <ul className="space-y-2">
          {envList.map((item) => (
            <li
              key={item.key}
              className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/90 px-3 py-2 text-xs text-slate-500 dark:border-white/5 dark:bg-slate-900/50 dark:text-slate-300"
            >
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{item.key}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{item.value}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={panelClass}>
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t('debug_device_heading')}</h2>
        <div className="grid gap-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/90 px-3 py-2 dark:border-white/5 dark:bg-slate-900/60">
            <span className="text-slate-500 dark:text-slate-400">{t('debug_device_id_label')}</span>
            <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200">{deviceId}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/90 px-3 py-2 dark:border-white/5 dark:bg-slate-900/60">
            <span className="text-slate-500 dark:text-slate-400">{t('debug_circle_id_label')}</span>
            <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200">{circleId}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
