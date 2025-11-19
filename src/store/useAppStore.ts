'use client';

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type {
  AppSettings,
  CircleSummary,
  CircleMessage,
  DailyQuotaSnapshot,
  DeviceInfo,
  UserProfile,
} from '@/types';

/* eslint-disable no-unused-vars */
interface AppStore {
  device: DeviceInfo | null;
  user: UserProfile | null;
  circle: CircleSummary | null;
  messages: CircleMessage[];
  dailyLimit: number | null;
  dailyUsed: number | null;
  dailyRemaining: number | null;
  quotaResetAtIso: string | null;
  isDailyQuotaExhausted: boolean;
  settings: AppSettings;
  firebaseReady: boolean;
  setDevice(device: DeviceInfo): void;
  setUser(profile: UserProfile | null): void;
  updateUser(updater: (prev: UserProfile | null) => UserProfile | null): void;
  setCircle(circle: CircleSummary | null): void;
  updateCircle(updater: (prev: CircleSummary | null) => CircleSummary | null): void;
  setMessages(messages: CircleMessage[]): void;
  addMessage(message: CircleMessage): void;
  replaceMessage(tempId: string, message: CircleMessage): void;
  removeMessage(id: string): void;
  setQuotaFromApi(quota: DailyQuotaSnapshot | null): void;
  updateSettings(settings: Partial<AppSettings>): void;
  setFirebaseReady(ready: boolean): void;
  reset(): void;
}
/* eslint-enable no-unused-vars */

const defaultSettings: AppSettings = {
  language: 'ru',
  theme: 'system',
  animationsEnabled: true
};

const sortMessages = (messages: CircleMessage[]) =>
  [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

const memoryStorage = (() => {
  let storage: Record<string, string> = {};
  return {
    getItem: (name: string) => storage[name] ?? null,
    setItem: (name: string, value: string) => {
      storage[name] = value;
    },
    removeItem: (name: string) => {
      delete storage[name];
    }
  };
})();

const storage = createJSONStorage<AppStore>(() => {
  if (typeof window === 'undefined') {
    return memoryStorage as Storage;
  }
  return window.localStorage;
});

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        device: null,
        user: null,
        circle: null,
        messages: [],
        dailyLimit: null,
        dailyUsed: null,
        dailyRemaining: null,
        quotaResetAtIso: null,
        isDailyQuotaExhausted: false,
        settings: defaultSettings,
        firebaseReady: false,
        setDevice: (device) => set({ device }),
        setUser: (profile) => set({ user: profile }),
        updateUser: (updater) => set({ user: updater(get().user) }),
        setCircle: (circle) => set({ circle }),
        updateCircle: (updater) => set((state) => ({ circle: updater(state.circle) })),
        setMessages: (messages) => set({ messages: sortMessages(messages) }),
        addMessage: (message) => set({ messages: sortMessages([...get().messages, message]) }),
        replaceMessage: (tempId, message) =>
          set((state) => ({
            messages: state.messages.map((existing) =>
              existing.id === tempId ? message : existing
            ),
          })),
        removeMessage: (id) =>
          set((state) => ({
            messages: state.messages.filter((message) => message.id !== id),
          })),
        setQuotaFromApi: (quota) =>
          set(() => {
            if (!quota) {
              return {
                dailyLimit: null,
                dailyUsed: null,
                dailyRemaining: null,
                quotaResetAtIso: null,
                isDailyQuotaExhausted: false,
              };
            }
            return {
              dailyLimit: quota.dailyLimit,
              dailyUsed: quota.usedToday,
              dailyRemaining: quota.remainingToday,
              quotaResetAtIso: quota.resetAtIso,
              isDailyQuotaExhausted: quota.remainingToday <= 0,
            };
          }),
        updateSettings: (settings) => set({ settings: { ...get().settings, ...settings } }),
        setFirebaseReady: (ready) => set({ firebaseReady: ready }),
        reset: () => set({
          device: null,
          user: null,
          circle: null,
          messages: [],
          dailyLimit: null,
          dailyUsed: null,
          dailyRemaining: null,
          quotaResetAtIso: null,
          isDailyQuotaExhausted: false,
          settings: defaultSettings
        })
      }),
      {
        name: 'weekcrew-store',
        storage,
        partialize: (state) => ({
          device: state.device,
          user: state.user,
          settings: state.settings,
          circle: state.circle
        })
      }
    )
  )
);
