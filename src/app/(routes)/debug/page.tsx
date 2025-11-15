'use client';

import clsx from 'clsx';
import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getFirebaseStatus } from '@/config/firebase';

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
  const envList = useMemo(
    () =>
      ENV_KEYS.map((key) => ({
        key,
        value: maskValue(process.env[key as EnvKey])
      })),
    []
  );

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
        <h1 className="text-2xl font-semibold text-brand-foreground">Debug / Health Check</h1>
        <p className="mt-2 text-sm text-slate-300">
          Вспомогательная страница для разработки. Проверка окружения, конфигурации Firebase и состояния стора.
        </p>
      </div>

      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 space-y-3 text-sm">
        <h2 className="text-sm font-semibold text-slate-100">Окружение</h2>
        <div className="grid gap-2 text-slate-300">
          <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-900/60 px-3 py-2">
            <span className="text-slate-500">NODE_ENV</span>
            <span className="font-mono text-slate-100">{process.env.NODE_ENV}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-900/60 px-3 py-2">
            <span className="text-slate-500">Firebase config</span>
            <span className={clsx('font-medium', firebaseStatus.configured ? 'text-emerald-300' : 'text-red-300')}>
              {firebaseStatus.configured ? 'настроен' : 'отключён'}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-900/60 px-3 py-2">
            <span className="text-slate-500">Firebase initialized</span>
            <span className={clsx('font-medium', firebaseReady ? 'text-emerald-300' : 'text-yellow-300')}>
              {firebaseReady ? 'да' : 'нет'}
            </span>
          </div>
          {firebaseStatus.error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {firebaseStatus.error}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 space-y-3 text-sm">
        <h2 className="text-sm font-semibold text-slate-100">Переменные окружения</h2>
        <ul className="space-y-2">
          {envList.map((item) => (
            <li
              key={item.key}
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-900/50 px-3 py-2 text-xs text-slate-400"
            >
              <span className="font-mono text-[11px] text-slate-500">{item.key}</span>
              <span className="font-semibold text-slate-200">{item.value}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 space-y-3 text-sm">
        <h2 className="text-sm font-semibold text-slate-100">Состояние устройства</h2>
        <div className="grid gap-2 text-xs text-slate-300">
          <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-900/60 px-3 py-2">
            <span className="text-slate-500">deviceId</span>
            <span className="font-mono text-[11px] text-slate-200">{deviceId}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-900/60 px-3 py-2">
            <span className="text-slate-500">currentCircleId</span>
            <span className="font-mono text-[11px] text-slate-200">{circleId}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
