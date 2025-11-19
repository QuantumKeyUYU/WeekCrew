'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const SAFETY_RULES_KEY = 'weekcrew:safety-accepted-v2';

type SafetyRulesStore = {
  accepted: boolean;
  markAccepted: () => void;
  resetAccepted: () => void;
};

const memoryStorage = (() => {
  let storage: Record<string, string> = {};
  return {
    getItem: (name: string) => storage[name] ?? null,
    setItem: (name: string, value: string) => {
      storage[name] = value;
    },
    removeItem: (name: string) => {
      delete storage[name];
    },
  };
})();

const createStorage = () =>
  createJSONStorage<SafetyRulesStore>(() => {
    if (typeof window === 'undefined') {
      return memoryStorage as Storage;
    }

    let useMemoryFallback = false;

    const withStorage = <T>(
      handler: (storage: Storage) => T,
      fallback: () => T,
    ) => {
      if (useMemoryFallback) {
        return fallback();
      }

      try {
        const storage = window.localStorage;
        return handler(storage);
      } catch {
        useMemoryFallback = true;
        return fallback();
      }
    };

    return {
      getItem: (name: string) =>
        withStorage(
          (storage) => {
            const value = storage.getItem(name);
            if (value === '1') {
              const migrated = JSON.stringify({ state: { accepted: true }, version: 0 });
              try {
                storage.setItem(name, migrated);
              } catch {
                useMemoryFallback = true;
                memoryStorage.setItem(name, migrated);
              }
              return migrated;
            }
            return value;
          },
          () => memoryStorage.getItem(name),
        ),
      setItem: (name: string, value: string) =>
        withStorage(
          (storage) => {
            storage.setItem(name, value);
          },
          () => memoryStorage.setItem(name, value),
        ),
      removeItem: (name: string) =>
        withStorage(
          (storage) => {
            storage.removeItem(name);
          },
          () => memoryStorage.removeItem(name),
        ),
    } as Storage;
  });

const storage = createStorage();

const useSafetyRulesStore = create<SafetyRulesStore>()(
  persist(
    (set) => ({
      accepted: false,
      markAccepted: () => set({ accepted: true }),
      resetAccepted: () => set({ accepted: false }),
    }),
    {
      name: SAFETY_RULES_KEY,
      storage,
    },
  ),
);

export const useSafetyRules = () => {
  const accepted = useSafetyRulesStore((state) => state.accepted);
  const markAccepted = useSafetyRulesStore((state) => state.markAccepted);
  const resetAccepted = useSafetyRulesStore((state) => state.resetAccepted);
  const [hydrated, setHydrated] = useState(() => useSafetyRulesStore.persist?.hasHydrated?.() ?? false);

  useEffect(() => {
    if (useSafetyRulesStore.persist?.hasHydrated?.()) {
      setHydrated(true);
    }
    const unsubHydrate = useSafetyRulesStore.persist?.onHydrate?.(() => setHydrated(false));
    const unsubFinish = useSafetyRulesStore.persist?.onFinishHydration?.(() => setHydrated(true));
    return () => {
      unsubHydrate?.();
      unsubFinish?.();
    };
  }, []);

  return { accepted, hydrated, markAccepted, resetAccepted };
};
