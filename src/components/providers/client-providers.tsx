'use client';

import { ReactNode, useEffect } from 'react';
import { useHydrated } from '@/hooks/useHydrated';
import { useAppStore } from '@/store/useAppStore';
import { getOrCreateDeviceId } from '@/lib/device';
import { ErrorBoundary } from '@/components/shared/error-boundary';

interface Props {
  children: ReactNode;
}

const resolveTheme = (theme: 'light' | 'dark' | 'system') => {
  if (theme !== 'system') {
    return theme;
  }
  if (typeof window === 'undefined') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const ClientProviders = ({ children }: Props) => {
  const hydrated = useHydrated();
  const device = useAppStore((state) => state.device);
  const setDevice = useAppStore((state) => state.setDevice);
  const settings = useAppStore((state) => state.settings);

  useEffect(() => {
    const id = getOrCreateDeviceId();
    if (!device || device.deviceId !== id) {
      setDevice({ deviceId: id, createdAt: new Date().toISOString() });
    }
  }, [device, setDevice]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    document.documentElement.lang = 'ru';
  }, []);

  useEffect(() => {
    const applyTheme = () => {
      if (typeof document === 'undefined') {
        return;
      }
      const theme = resolveTheme(settings.theme);
      document.body.dataset.theme = theme;
      document.body.dataset.animations = settings.animationsEnabled ? 'on' : 'off';
    };

    applyTheme();

    if (settings.theme === 'system' && typeof window !== 'undefined') {
      const matcher = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme();
      matcher.addEventListener('change', handler);
      return () => matcher.removeEventListener('change', handler);
    }
  }, [settings.theme, settings.animationsEnabled]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          registrations.forEach((registration) => {
            registration.unregister().catch((error) => {
              console.info('Service worker unregister failed', error);
            });
          })
        )
        .catch((error) => console.info('Service worker cleanup skipped', error));
      return;
    }

    navigator.serviceWorker
      .register('/service-worker.js')
      .catch((error) => console.warn('Service worker registration failed', error));
  }, []);

  if (!hydrated) {
    return <div className="min-h-screen bg-slate-950" />;
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
};
