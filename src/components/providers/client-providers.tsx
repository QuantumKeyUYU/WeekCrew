'use client';

import { ReactNode, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getOrCreateDeviceId } from '@/lib/device';
import { ensureAnonymousAuth, getFirebaseStatus } from '@/config/firebase';
import { useHydrated } from '@/hooks/useHydrated';
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
  const settings = useAppStore((state) => state.settings);
  const setDevice = useAppStore((state) => state.setDevice);
  const updateUser = useAppStore((state) => state.updateUser);
  const setFirebaseReady = useAppStore((state) => state.setFirebaseReady);

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
    document.documentElement.lang = settings.language;
  }, [settings.language]);
  useEffect(() => {
    if (!device) {
      return;
    }
    updateUser((prev) => {
      if (prev) {
        return prev;
      }
      return {
        id: device.deviceId,
        interests: [],
        currentCircleId: null,
        locale: settings.language,
        theme: settings.theme,
        notificationsEnabled: false
      };
    });
  }, [device, updateUser, settings.language, settings.theme]);

  useEffect(() => {
    let cancelled = false;
    setFirebaseReady(getFirebaseStatus().initialized);

    ensureAnonymousAuth()
      .then((uid) => {
        if (cancelled) {
          return;
        }
        setFirebaseReady(getFirebaseStatus().initialized);
        if (!uid) {
          return;
        }
        updateUser((prev) => {
          if (prev && prev.id === uid) {
            return { ...prev, locale: settings.language, theme: settings.theme };
          }
          return {
            id: uid,
            interests: prev?.interests ?? [],
            currentCircleId: prev?.currentCircleId ?? null,
            locale: settings.language,
            theme: settings.theme,
            notificationsEnabled: prev?.notificationsEnabled ?? false
          };
        });
      })
      .catch((error) => {
        if (!cancelled) {
          setFirebaseReady(getFirebaseStatus().initialized);
          console.warn('Anonymous auth skipped', error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [updateUser, settings.language, settings.theme, setFirebaseReady]);

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
